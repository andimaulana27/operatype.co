// src/components/admin/TagInput.tsx
'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  name: string;
  label: string;
  tags: string[];
  setTags: (tags: string[]) => void;
  placeholder?: string; // Jadikan placeholder opsional
}

const TagInput = ({ name, label, tags, setTags, placeholder }: TagInputProps) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      
      const newTags = inputValue
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag && !tags.includes(tag));

      if (newTags.length > 0) {
        setTags([...tags, ...newTags]);
      }
      
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  return (
    <div>
      <label className="font-medium">{label}</label>
      {tags.map(tag => <input key={tag} type="hidden" name={name} value={tag} />)}
      
      <div className="flex flex-wrap items-center gap-2 p-2 mt-1 border rounded-md min-h-[42px]">
        {tags.map((tag, index) => (
          <span 
            key={`${tag}-${index}`}
            className="bg-gray-200 text-gray-800 text-sm font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5"
          >
            {tag}
            <button 
              type="button" 
              onClick={(e) => {
                e.preventDefault();
                removeTag(tag);
              }}
              className="text-gray-500 hover:text-red-600 focus:outline-none"
              aria-label={`Remove ${tag}`}
            >
              <X size={14} />
            </button>
          </span>
        ))}
        <input 
          type="text" 
          value={inputValue} 
          onChange={(e) => setInputValue(e.target.value)} 
          onKeyDown={handleKeyDown} 
          // Gunakan placeholder yang diberikan, atau buat default jika tidak ada
          placeholder={placeholder || `Add ${label.toLowerCase()} (separate with commas)...`}
          className="flex-grow bg-transparent focus:outline-none p-1 text-sm"
        />
      </div>
    </div>
  );
};

export default TagInput;