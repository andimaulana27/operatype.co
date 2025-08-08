// src/components/GlyphViewer.tsx
'use client';
import { useState } from 'react';

type GlyphViewerProps = {
  glyphString: string;
  fontFamily: string;
};

const GlyphViewer = ({ glyphString, fontFamily }: GlyphViewerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const glyphs = glyphString ? glyphString.split('') : [];

  const copyToClipboard = (glyph: string) => {
    navigator.clipboard.writeText(glyph);
  };

  return (
    <div>
      <div className={`relative mt-4 overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-full' : 'max-h-48'}`}>
        <div 
          className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-16 gap-2"
          style={{ fontFamily: fontFamily, fontSize: '2rem' }}
        >
          {glyphs.map((glyph, index) => (
            <div
              key={index}
              onClick={() => copyToClipboard(glyph)}
              className="flex items-center justify-center aspect-square border border-brand-gray-2 rounded-md cursor-pointer hover:bg-brand-gray-2"
            >
              {glyph}
            </div>
          ))}
        </div>
        {!isExpanded && glyphs.length > 64 && (
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-brand-white to-transparent pointer-events-none"></div>
        )}
      </div>
      {glyphs.length > 64 && (
        <div className="text-center mt-4">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-brand-orange text-white font-medium py-2 px-6 rounded-full hover:bg-brand-orange-hover"
          >
            {isExpanded ? 'View Less' : 'View More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default GlyphViewer;
