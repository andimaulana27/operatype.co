// src/components/DynamicFontLoader.tsx
'use client';

import React from 'react';

type DynamicFontLoaderProps = {
  fontFamily: string;
  fontUrl: string | null;
};

const DynamicFontLoader = ({ fontFamily, fontUrl }: DynamicFontLoaderProps) => {
  if (!fontUrl) {
    return null;
  }

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