// src/app/(main)/about/page.tsx
import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="bg-brand-white">
      <div className="container mx-auto px-4 py-16">
        
        {/* --- Seksi Pertama: Hero --- */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Kolom Kiri: Gambar */}
          <div className="w-full h-96 relative rounded-lg overflow-hidden">
            <Image 
              src="/images/pages/about-image-1.png"
              alt="Operatype workspace"
              layout="fill"
              objectFit="cover"
            />
          </div>
          
          {/* Kolom Kanan: Teks */}
          <div className="text-left">
            <h1 className="text-5xl font-medium text-brand-black leading-tight">
              The Story Behind Every Stroke
            </h1>
            <div className="w-20 h-0.5 bg-brand-orange mt-4 mb-6"></div>
            <p className="font-light text-brand-gray-1">
              We are Operatype, a collective of designers dedicated to crafting high-quality fonts.
            </p>
            
            {/* PERBAIKAN: Garis oranye di sini dihapus sesuai permintaan */}
            
            <div className="mt-6"> {/* Menambahkan margin top untuk spasi */}
              <h3 className="font-medium text-brand-orange mb-4">Our Value</h3>
              <div className="flex flex-col md:flex-row items-center gap-x-6 gap-y-2 font-medium text-brand-black">
                <span>Passion for Precision</span>
                <span className="hidden md:block text-brand-orange">|</span>
                <span>Artistry in Every Font</span>
                <span className="hidden md:block text-brand-orange">|</span>
                <span>Empowering Creators</span>
              </div>
            </div>
          </div>
        </section>

        {/* --- Seksi Kedua: Our Story --- */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-24">
          {/* Kolom Kiri: Teks */}
          <div className="text-left">
            <h2 className="text-4xl font-medium text-brand-black">Our Story</h2>
            <div className="w-20 h-0.5 bg-brand-orange mt-4 mb-6"></div>
            
            <div className="space-y-4 font-light text-brand-black">
              <p>
                We've all been there: you find a high quality font, you purchase it for a project, and then the frustration begins. Awkward letter connections, a limited character set, no multilingual support. A Stylish Typography tool becomes a technical headache. We knew there had to be a better way.
              </p>
              <p>
                operatype.co was founded on a simple, pragmatic mission: to create stunningly stylish typography that just work, flawlessly. We combine our love for artistic calligraphy with a rigorous focus on technical excellence. This means every font is fully-featured, extensively tested, and designed to be intuitive for any creator.
              </p>
            </div>
            <Link href="/fonts">
              <span className="inline-block mt-8 bg-brand-orange text-white font-medium py-3 px-8 rounded-full hover:bg-brand-orange-hover transition-colors">
                Explore The Collection
              </span>
            </Link>
          </div>
          
          {/* Kolom Kanan: Gambar */}
          <div className="w-full h-96 relative rounded-lg overflow-hidden">
            <Image 
              src="/images/pages/about-image-2.png"
              alt="Crafting a font"
              layout="fill"
              objectFit="cover"
            />
          </div>
        </section>
        
      </div>
    </div>
  );
}
