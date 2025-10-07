// src/app/(main)/contact/page.tsx
import type { Metadata } from 'next';
import ContactForm from './ContactForm'; // Impor komponen klien yang baru dibuat

// Metadata ini valid karena file ini sekarang adalah Server Component
export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the Operatype team for custom licenses, support, or collaborations. Let\'s create something timeless together.',
};

export default function ContactPage() {
  return (
    <div className="bg-brand-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h1 className="text-5xl font-medium text-brand-black">Get in Touch</h1>
          <div className="w-20 h-[3px] bg-brand-orange mx-auto my-6"></div>
          <p className="text-lg font-light text-brand-gray-1">
            We&apos;re excited to hear about your ideas. Reach out and let&apos;s create something timeless together.
          </p>
        </div>

        {/* Cukup panggil Client Component di sini */}
        <ContactForm />
      </div>
    </div>
  );
}