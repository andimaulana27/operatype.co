// compress-migration.ts
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Wajib pakai Service Role Key agar bisa update semua data

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: Pastikan NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY ada di .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${url}`);
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (e) {
    console.error(`Gagal download: ${url}`, e);
    return null;
  }
}

async function compressAndUpload(buffer: Buffer, originalUrl: string, bucket: string): Promise<string | null> {
  try {
    // 1. Dapatkan nama file asli
    const urlParts = originalUrl.split('/');
    const originalName = urlParts[urlParts.length - 1]; // misal: 12345_font.png
    
    // Decode URI component (untuk menangani spasi/%20)
    const decodedName = decodeURIComponent(originalName);

    // 2. Cek apakah sudah WebP
    if (decodedName.toLowerCase().endsWith('.webp')) {
      console.log(`⏩ Skip (sudah WebP): ${decodedName}`);
      return originalUrl;
    }

    // 3. Compress ke WebP menggunakan SHARP
    console.log(`⏳ Compressing: ${decodedName}...`);
    const compressedBuffer = await sharp(buffer)
      .webp({ quality: 80 }) // Kualitas 80% (sangat cukup untuk web)
      .resize({ width: 1920, withoutEnlargement: true }) // Resize max HD
      .toBuffer();

    // 4. Buat nama file baru
    const nameWithoutExt = decodedName.split('.').slice(0, -1).join('.');
    const newFileName = `${Date.now()}_migrated_${nameWithoutExt}.webp`;

    // 5. Upload ke Supabase
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(newFileName, compressedBuffer, {
        contentType: 'image/webp',
        cacheControl: '3600'
      });

    if (error) throw error;

    // 6. Ambil Public URL baru
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    console.log(`✅ Success: ${(buffer.length/1024).toFixed(0)}KB -> ${(compressedBuffer.length/1024).toFixed(0)}KB`);
    return publicUrlData.publicUrl;

  } catch (e) {
    console.error(`❌ Gagal proses gambar`, e);
    return null;
  }
}

async function runMigration() {
  console.log("🚀 Memulai Migrasi Kompresi Gambar...");

  // 1. Ambil semua fonts
  const { data: fonts, error } = await supabase
    .from('fonts')
    .select('id, name, main_image_url, gallery_image_urls');

  if (error) {
    console.error("Gagal mengambil data font:", error);
    return;
  }

  console.log(`Ditemukan ${fonts.length} font untuk diperiksa.`);

  for (const font of fonts) {
    console.log(`\n📂 Memproses Font: ${font.name} (${font.id})`);
    let needsUpdate = false;
    let newMainImage = font.main_image_url;
    let newGalleryImages = font.gallery_image_urls as string[] || [];

    // --- PROSES MAIN IMAGE ---
    if (font.main_image_url) {
      const buffer = await downloadImage(font.main_image_url);
      if (buffer) {
        const newUrl = await compressAndUpload(buffer, font.main_image_url, 'font_images');
        if (newUrl && newUrl !== font.main_image_url) {
          newMainImage = newUrl;
          needsUpdate = true;
        }
      }
    }

    // --- PROSES GALLERY IMAGES ---
    if (newGalleryImages.length > 0) {
      const processedGallery = [];
      for (const url of newGalleryImages) {
        const buffer = await downloadImage(url);
        if (buffer) {
            const newUrl = await compressAndUpload(buffer, url, 'font_images');
            processedGallery.push(newUrl || url); // Pakai URL baru atau fallback ke lama
            if (newUrl && newUrl !== url) needsUpdate = true;
        } else {
            processedGallery.push(url);
        }
      }
      newGalleryImages = processedGallery;
    }

    // --- UPDATE DATABASE JIKA ADA PERUBAHAN ---
    if (needsUpdate) {
      const { error: updateError } = await supabase
        .from('fonts')
        .update({
          main_image_url: newMainImage,
          gallery_image_urls: newGalleryImages
        })
        .eq('id', font.id);

      if (updateError) {
        console.error(`❌ Gagal update database untuk ${font.name}:`, updateError.message);
      } else {
        console.log(`💾 Database updated untuk ${font.name}`);
      }
    } else {
      console.log(`👍 Tidak ada perubahan diperlukan untuk ${font.name}`);
    }
  }

  console.log("\n🎉 Migrasi Selesai!");
}

runMigration();