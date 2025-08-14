// src/components/DynamicFontLoader.tsx
'use client';

import React from 'react';

type DynamicFontLoaderProps = {
  fontFamily: string;
  fontUrl: string | null;
};

const DynamicFontLoader = ({ fontFamily, fontUrl }: DynamicFontLoaderProps) => {
  // Jangan render apapun jika tidak ada URL font
  if (!fontUrl) {
    return null;
  }

  // Komponen ini hanya bertugas merender blok <style>
  // untuk mendefinisikan @font-face secara dinamis
  return (
    <style jsx global>{`
      @font-face {
        font-family: '${fontFamily}';
        src: url('${fontUrl}');
      }
    `}</style>
  );
};

export default DynamicFontLoader;