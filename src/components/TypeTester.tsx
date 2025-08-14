// src/components/TypeTester.tsx
'use client';

import { useState } from 'react';
import { ChevronDownIcon } from '@/components/icons';

// DIPERBARUI: Props sekarang menerima nama font-family untuk setiap style
type TypeTesterProps = {
  fontFamilyRegular: string;
  fontFamilyItalic?: string;
};

const pangramOptions = [
  "The quick brown fox jumps over the lazy dog.",
  "Pack my box with five dozen liquor jugs.",
  "Sphinx of black quartz, judge my vow.",
  "Waltz, nymph, for quick jigs vex Bud.",
  "How vexingly quick daft zebras jump!",
];

const TypeTester = ({ fontFamilyRegular, fontFamilyItalic }: TypeTesterProps) => {
  const [fontSize, setFontSize] = useState(48);
  const [text, setText] = useState(pangramOptions[0]);
  const [activeStyle, setActiveStyle] = useState<'Regular' | 'Italic'>('Regular');

  // DIPERBARUI: Logika ini sekarang hanya beralih antara nama font-family
  // yang sudah dimuat oleh halaman induknya.
  const currentFontFamily = activeStyle === 'Italic' && fontFamilyItalic 
    ? fontFamilyItalic 
    : fontFamilyRegular;
  
  return (
    <div className="mt-16">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-medium">Type Tester</h3>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <input
            type="range"
            min="12"
            max="120"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full md:w-48 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-lg font-medium w-16 text-right">{fontSize}px</span>
        </div>
      </div>

      {/* Panel Kontrol */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Font Style Selector */}
        <div className="relative">
           <select 
             value={activeStyle}
             onChange={(e) => setActiveStyle(e.target.value as 'Regular' | 'Italic')}
             className="w-full bg-transparent text-brand-black pl-6 pr-12 py-3 border border-brand-black rounded-full focus:outline-none focus:border-brand-orange transition-colors appearance-none"
           >
             <option value="Regular">Regular</option>
             {/* Tombol Italic hanya muncul jika prop-nya diberikan */}
             {fontFamilyItalic && <option value="Italic">Italic</option>}
           </select>
           <ChevronDownIcon className="h-5 w-5 text-brand-orange absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Pangram Selector */}
        <div className="relative">
           <select 
             onChange={(e) => setText(e.target.value)}
             defaultValue={pangramOptions[0]}
             className="w-full bg-transparent text-brand-black pl-6 pr-12 py-3 border border-brand-black rounded-full focus:outline-none focus:border-brand-orange transition-colors appearance-none"
           >
             {pangramOptions.map(option => <option key={option} value={option}>{option}</option>)}
           </select>
           <ChevronDownIcon className="h-5 w-5 text-brand-orange absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Custom Text Input */}
        <input
          type="text"
          placeholder="Or type your own text here"
          onChange={(e) => setText(e.target.value)}
          className="w-full bg-transparent text-brand-black pl-6 pr-4 py-3 border border-brand-black rounded-full placeholder:text-brand-gray-1 focus:outline-none focus:border-brand-orange transition-colors"
        />
      </div>

      {/* Preview Area */}
      <div className="py-8 border-t border-b border-brand-gray-2 mt-6">
        <p
          className="text-center break-words"
          style={{ 
            fontFamily: `'${currentFontFamily}', sans-serif`, 
            fontSize: `${fontSize}px` 
          }}
        >
          {text || "Type something to test"}
        </p>
      </div>
    </div>
  );
};

export default TypeTester;