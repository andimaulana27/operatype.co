// src/components/GlyphViewer.tsx
'use client';

import { useState } from 'react';
import toast from 'react-hot-toast'; // BARU: Impor toast untuk notifikasi

type GlyphViewerProps = {
  glyphString: string | null;
  fontFamily: string;
};

const INITIAL_VISIBLE_GLYPHS = 64; // Jumlah glyph yang ditampilkan awal

const GlyphViewer = ({ glyphString, fontFamily }: GlyphViewerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!glyphString) {
    return <p className="text-gray-500">No glyphs available to display.</p>;
  }
  
  const allGlyphs = glyphString.split('');
  const glyphsToShow = isExpanded ? allGlyphs : allGlyphs.slice(0, INITIAL_VISIBLE_GLYPHS);

  // BARU: Fungsi copy ke clipboard dengan notifikasi toast
  const copyToClipboard = (glyph: string) => {
    navigator.clipboard.writeText(glyph);
    toast.success(`Glyph "${glyph}" copied to clipboard!`);
  };

  return (
    // DIPERBARUI: Menggunakan Flexbox untuk menata layout secara vertikal
    // Container ini akan mencoba mengisi ruang vertikal yang tersedia
    <div className="flex flex-col h-full">

      {/* Konten glyph, akan mengisi ruang yang tersedia */}
      <div 
        className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2 text-center text-4xl"
        style={{ fontFamily: `'${fontFamily}', sans-serif` }}
      >
        {glyphsToShow.map((char, index) => (
          <div 
            key={index}
            onClick={() => copyToClipboard(char)}
            className="flex items-center justify-center aspect-square bg-gray-100 rounded-md cursor-pointer hover:bg-orange-100 transition-colors"
            title="Click to copy" // Menambahkan tooltip
          >
            {char}
          </div>
        ))}
      </div>

      {/* Bagian Tombol, akan didorong ke bawah jika ada ruang kosong */}
      {/* Tombol hanya muncul jika jumlah total glyph lebih banyak dari jumlah awal */}
      {allGlyphs.length > INITIAL_VISIBLE_GLYPHS && (
        <div className="flex-grow flex items-end justify-center pt-8">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-brand-orange text-white font-medium py-2 px-8 rounded-full hover:bg-brand-orange-hover transition-colors"
          >
            {isExpanded ? 'View Less' : 'View More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default GlyphViewer;