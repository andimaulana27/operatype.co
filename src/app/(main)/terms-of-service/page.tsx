// src/app/(main)/terms-of-service/page.tsx
import Link from 'next/link';
import React from 'react';

// Komponen kecil untuk setiap poin agar lebih rapi
const TermSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <section>
    <h2 className="text-2xl font-medium text-brand-orange">{title}</h2>
    <div className="mt-3 space-y-4 font-light text-brand-black text-opacity-80">
      {children}
    </div>
  </section>
);

export default function TermsOfServicePage() {
  return (
    <div className="bg-brand-white">
      <div className="container mx-auto px-4 py-16">
        {/* ==================== PERUBAHAN DI SINI ==================== */}
        {/* Lebar maksimum diubah dari 4xl menjadi 5xl agar sub-headline bisa menjadi 2 baris */}
        <div className="text-center mb-16 max-w-5xl mx-auto">
        {/* ========================================================== */}
          <h1 className="text-5xl font-medium text-brand-black">Terms of Service</h1>
          <div className="w-20 h-[3px] bg-brand-orange mx-auto my-6"></div>
          <p className="text-sm text-brand-gray-1">Effective Date: July 12, 2025</p>
          <p className="text-lg font-light text-brand-gray-1 mx-auto mt-6">
            Welcome to operatype.co. Please read these Terms of Service carefully before using our website, or purchasing any products offered through operatype.co. By accessing or using the Website, you agree to comply with and be bound by these Terms.
          </p>
        </div>

        {/* Isi Konten */}
        <div className="space-y-8">
          <TermSection title="1. Acceptance of Terms">
            <p>
              By using our Website or purchasing our Products, you agree to be bound by these Terms, as well as any additional terms or conditions that may apply to specific sections of the Website or Products. If you do not agree with these Terms, please refrain from using the Website.
            </p>
          </TermSection>
          
          <TermSection title="2. Changes to Terms">
            <p>
              We reserve the right to modify, update, or change these Terms at any time. When we make changes, the updated Terms will be posted on this page with an updated effective date. Please review these Terms periodically to stay informed of any changes.
            </p>
          </TermSection>

          <TermSection title="3. Product Availability">
            <p>
              We offer a variety of digital fonts for purchase on operatype.co. All Products are digital files and will be delivered to you electronically upon successful payment. Availability and pricing of Products may change without notice. We do not guarantee the availability of any specific Product at all times.
            </p>
          </TermSection>

          <TermSection title="4. Use of Products">
            <p>
              By purchasing a font from operatype.co, you are granted a non-exclusive, non-transferable license to use the Product for personal or commercial purposes, depending on the type of license purchased. You may not:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Resell, sublicense, or distribute the fonts.</li>
              <li>Modify, reverse-engineer, or use the fonts in a way that violates copyright laws.</li>
              <li>Use the fonts for unlawful purposes.</li>
            </ul>
            <p>
              For detailed licensing information, please refer to our <Link href="/license" className="text-brand-orange hover:underline font-medium">License Agreement</Link>.
            </p>
          </TermSection>

          <TermSection title="5. Account Registration">
            <p>
              To purchase Products from operatype.co, you may need to create an account. You agree to provide accurate and up-to-date information during the registration process and to update your account details if necessary. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
            </p>
          </TermSection>

          <TermSection title="6. Payment and Pricing">
            <p>
              All prices for Products are listed in USD (United States Dollar) and are subject to change. Payment must be made in full at the time of purchase. We accept payment via PayPal. By providing your payment details, you authorize us to charge the full price of the Product to your selected payment method.
            </p>
          </TermSection>
          
          <TermSection title="7. Refunds and Returns">
            <p>
              Due to the nature of digital products, all sales are final, and no refunds will be issued once a font has been delivered or downloaded. Please review the product details and ensure compatibility before making your purchase.
            </p>
          </TermSection>

          <TermSection title="8. Intellectual Property">
            <p>
              All Products, including but not limited to fonts, logos, images, and content on operatype.co, are protected by copyright, trademark, and other intellectual property laws. The ownership of these Products remains with operatype.co or the respective rights holders.
            </p>
          </TermSection>

          <TermSection title="9. User Conduct">
            <p>You agree to use the Website in compliance with all applicable laws and regulations. You shall not:</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Engage in activities that could damage, disable, or impair the Website.</li>
              <li>Attempt to gain unauthorized access to any part of the Website or the systems of operatype.co.</li>
              <li>Submit false or misleading information on the Website.</li>
            </ul>
          </TermSection>

          <TermSection title="10. Limitation of Liability">
            <p>
              To the fullest extent permitted by law, operatype.co shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Website or the Products, including any errors, inaccuracies, or interruptions of service.
            </p>
          </TermSection>

          <TermSection title="11. Privacy Policy">
            <p>
              By using our Website and purchasing our Products, you consent to the collection, use, and sharing of your personal data as outlined in our <Link href="/privacy-policy" className="text-brand-orange hover:underline font-medium">Privacy Policy</Link>.
            </p>
          </TermSection>

          <TermSection title="12. Termination">
            <p>
              We reserve the right to suspend or terminate your access to the Website or your account at our discretion, without prior notice, if you violate these Terms.
            </p>
          </TermSection>

          <TermSection title="13. Governing Law">
            <p>
              These Terms shall be governed by and construed in accordance with the laws of Indonesia. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts in Indonesia.
            </p>
          </TermSection>

          <TermSection title="14. Contact Information">
            <p>
              If you have any questions or concerns about these Terms or the Products, please contact us at:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Email: operatype.co@gmail.com</li>
              <li>Phone: [Phone Number]</li>
            </ul>
          </TermSection>
        </div>
      </div>
    </div>
  );
}