// src/app/(main)/contact/page.tsx
'use client';

import { useTransition, useRef } from 'react';
import { ChevronDownIcon } from '@/components/icons';
import { sendContactFormEmail } from '@/app/actions/emailActions'; // <-- 1. Impor action
import toast from 'react-hot-toast'; // <-- 2. Impor toast

export default function ContactPage() {
  const [isPending, startTransition] = useTransition(); // <-- 3. Gunakan useTransition
  const formRef = useRef<HTMLFormElement>(null);

  // <-- 4. Buat fungsi handleSubmit yang baru
  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await sendContactFormEmail(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success!);
        formRef.current?.reset(); // Kosongkan form setelah berhasil
      }
    });
  };

  return (
    <div className="bg-brand-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h1 className="text-5xl font-medium text-brand-black">Get in Touch</h1>
          <div className="w-20 h-[3px] bg-brand-orange mx-auto my-6"></div>
          <p className="text-lg font-light text-brand-gray-1">
            We're excited to hear about your ideas. Reach out and let's create something timeless together.
          </p>
        </div>

        {/* <-- 5. Ganti form untuk memanggil action --> */}
        <form ref={formRef} action={handleSubmit} className="max-w-3xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              className="w-full p-4 bg-brand-gray-2 rounded-full focus:outline-none"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email Address"
              className="w-full p-4 bg-brand-gray-2 rounded-full focus:outline-none"
              required
            />
          </div>
          <div className="relative">
            <select
              name="subject"
              defaultValue=""
              className="w-full p-4 bg-brand-gray-2 rounded-full focus:outline-none appearance-none"
              required
            >
              <option value="" disabled>Subject</option>
              <option value="General Inquiry">General Inquiry</option>
              <option value="Custom License">Custom License</option>
              <option value="Support">Support</option>
              <option value="Collaboration">Collaboration</option>
            </select>
            <ChevronDownIcon className="h-5 w-5 text-brand-gray-1 absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <textarea
            name="message"
            placeholder="Message"
            rows={8}
            className="w-full p-4 bg-brand-gray-2 rounded-3xl focus:outline-none resize-none"
            required
          />
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-brand-orange text-white font-medium py-4 rounded-full hover:bg-brand-orange-hover transition-colors text-lg disabled:opacity-50"
          >
            {isPending ? 'Sending...' : 'Send Message'}
          </button>
        </form>

      </div>
    </div>
  );
}