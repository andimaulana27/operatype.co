// src/components/TypeTester.tsx
'use client';
import { useState } from 'react';
import { ChevronDownIcon } from '@/components/icons';

type TypeTesterProps = {
  fontFamily: string;
  fontUrlRegular: string;
  fontUrlItalic?: string;
};

const pangramOptions = [
  "The quick brown fox jumps over the lazy dog.",
  "Pack my box with five dozen liquor jugs.",
  "Sphinx of black quartz, judge my vow.",
  "Waltz, nymph, for quick jigs vex Bud.",
  "How vexingly quick daft zebras jump!",
];

const TypeTester = ({ fontFamily, fontUrlRegular, fontUrlItalic }: TypeTesterProps) => {
  const [fontSize, setFontSize] = useState(38);
  const [text, setText] = useState(pangramOptions[0]);
  const [fontStyle, setFontStyle] = useState('Regular');

  const dynamicFontFamily = `dynamic-${fontFamily.replace(/\s+/g, '-')}`;
  // PERBAIKAN: Pastikan URL lengkap dari Supabase Storage
  const currentFontUrl = fontStyle === 'Italic' && fontUrlItalic ? fontUrlItalic : fontUrlRegular;

  return (
    <div className="mt-8">
      <style>{`
        @font-face {
          font-family: '${dynamicFontFamily}';
          src: url('${currentFontUrl}') format('opentype');
          font-weight: normal;
          font-style: ${fontStyle === 'Italic' ? 'italic' : 'normal'};
        }
      `}</style>
      
      {/* PERBAIKAN: Layout diubah */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-medium">Type Tester</h3>
        <div className="flex items-center gap-4 w-full md:w-1/3">
          <input
            type="range"
            min="12"
            max="120"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full h-1 bg-brand-gray-2 rounded-lg appearance-none cursor-pointer"
            style={{ 
              background: `linear-gradient(to right, #C8705C ${((fontSize - 12) / (120 - 12)) * 100}%, #F2F2F2 ${((fontSize - 12) / (120 - 12)) * 100}%)` 
            }}
          />
          <span className="text-lg font-medium">{fontSize}px</span>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Font Style Selector */}
        <div className="relative">
           <select 
             value={fontStyle}
             onChange={(e) => setFontStyle(e.target.value)}
             className="w-full bg-transparent text-brand-black pl-6 pr-12 py-3 border border-brand-black rounded-full focus:outline-none focus:border-brand-orange transition-colors appearance-none"
           >
             <option value="Regular">Regular</option>
             {fontUrlItalic && <option value="Italic">Italic</option>}
           </select>
           <ChevronDownIcon className="h-5 w-5 text-brand-orange absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Pangram Selector */}
        <div className="relative">
           <select 
             onChange={(e) => setText(e.target.value)}
             className="w-full bg-transparent text-brand-black pl-6 pr-12 py-3 border border-brand-black rounded-full focus:outline-none focus:border-brand-orange transition-colors appearance-none"
           >
             {pangramOptions.map(option => <option key={option} value={option}>{option}</option>)}
           </select>
           <ChevronDownIcon className="h-5 w-5 text-brand-orange absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Custom Text Input */}
        <input
          type="text"
          placeholder="Type Here"
          onChange={(e) => setText(e.target.value)}
          className="w-full bg-transparent text-brand-black pl-6 pr-4 py-3 border border-brand-black rounded-full placeholder:text-brand-gray-1 focus:outline-none focus:border-brand-orange transition-colors"
        />
      </div>

      {/* Preview Area */}
      <div className="py-8 border-t border-b border-brand-gray-2 mt-6">
        <p
          className="text-center break-words"
          style={{ fontFamily: `'${dynamicFontFamily}', sans-serif`, fontSize: `${fontSize}px` }}
        >
          {text || "Type Here"}
        </p>
      </div>
    </div>
  );
};

export default TypeTester;
