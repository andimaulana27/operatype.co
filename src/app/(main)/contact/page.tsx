// src/app/(main)/contact/page.tsx
'use client';

import { useState } from 'react';
import { ChevronDownIcon } from '@/components/icons';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Di sini nanti kita akan menambahkan logika untuk mengirim email atau menyimpan ke database
    console.log('Form submitted:', formData);
    alert('Thank you for your message!');
  };

  return (
    <div className="bg-brand-white">
      <div className="container mx-auto px-4 py-16">
        {/* Judul Halaman */}
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h1 className="text-5xl font-medium text-brand-black">Get in Touch</h1>
          <div className="w-20 h-[3px] bg-brand-orange mx-auto my-6"></div>
          <p className="text-lg font-light text-brand-gray-1">
            We're excited to hear about your ideas. Reach out and let's create something timeless together.
          </p>
        </div>

        {/* Form Kontak */}
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-4 bg-brand-gray-2 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-orange"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email Address"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-4 bg-brand-gray-2 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-orange"
              required
            />
          </div>
          <div className="relative">
            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full p-4 bg-brand-gray-2 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-orange appearance-none"
              required
            >
              <option value="" disabled>Subject</option>
              <option value="general-inquiry">General Inquiry</option>
              <option value="custom-license">Custom License</option>
              <option value="support">Support</option>
              <option value="collaboration">Collaboration</option>
            </select>
            <ChevronDownIcon className="h-5 w-5 text-brand-gray-1 absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <textarea
            name="message"
            placeholder="Message"
            rows={8}
            value={formData.message}
            onChange={handleChange}
            className="w-full p-4 bg-brand-gray-2 rounded-3xl focus:outline-none focus:ring-2 focus:ring-brand-orange resize-none"
            required
          />
          <button
            type="submit"
            className="w-full bg-brand-orange text-white font-medium py-4 rounded-full hover:bg-brand-orange-hover transition-colors text-lg"
          >
            Send Message
          </button>
        </form>

      </div>
    </div>
  );
}
