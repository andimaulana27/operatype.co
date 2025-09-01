// src/app/(main)/privacy-policy/page.tsx
import React from 'react';
export const revalidate = 86400; // 1 hari

const PolicySection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <section>
    <h2 className="text-2xl font-medium text-brand-orange">{title}</h2>
    <div className="mt-3 space-y-4 font-light text-brand-black text-opacity-80">
      {children}
    </div>
  </section>
);

const SubSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mt-4">
        <h3 className="text-lg font-medium text-brand-orange">{title}</h3>
        <div className="mt-2 space-y-4">
            {children}
        </div>
    </div>
);

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-brand-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header Halaman */}
        <div className="text-center mb-16 max-w-5xl mx-auto">
          <h1 className="text-5xl font-medium text-brand-black">Privacy Policy</h1>
          <div className="w-20 h-[3px] bg-brand-orange mx-auto my-6"></div>
          <p className="text-sm text-brand-gray-1">Effective Date: July 12, 2025</p>
          <p className="text-lg font-light text-brand-gray-1 mt-6">
            At operatype.co, we are committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible manner. This Privacy Policy outlines the types of information we collect, how it is used, and the steps we take to safeguard your data.
          </p>
        </div>

        {/* Isi Konten */}
        <div className="space-y-8">
          <PolicySection title="1. Information We Collect">
            <p>We collect two types of information when you visit or use our Website:</p>
            <SubSection title="a. Personal Information:">
              <p>When you register an account, make a purchase, or interact with our Website, we may collect the following personal information:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Name</li>
                <li>Email address</li>
                <li>Shipping and billing address</li>
                <li>Payment information (e.g., PayPal details)</li>
                <li>Phone number (optional)</li>
              </ul>
            </SubSection>
            <SubSection title="b. Non-Personal Information:">
              <p>We may also collect non-personal information related to your interaction with the Website, including:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Device type and operating system</li>
                <li>Pages visited and time spent on the Website</li>
                <li>Referring URL</li>
              </ul>
            </SubSection>
          </PolicySection>

          <PolicySection title="2. How We Use Your Information">
            <p>We use the information we collect to provide and improve our services, including:</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Processing your orders and delivering Products.</li>
              <li>Sending order confirmations, receipts, and updates regarding your purchase.</li>
              <li>Responding to your inquiries and providing customer support.</li>
              <li>Improving the Website and making it more user-friendly.</li>
              <li>Personalizing your experience with our Products and promotions.</li>
              <li>Complying with legal requirements.</li>
            </ul>
          </PolicySection>

          <PolicySection title="3. Sharing Your Information">
            <p>We will not sell, trade, or rent your personal information to third parties. However, we may share your information in the following circumstances:</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Service Providers: We may share your personal information with trusted third-party service providers who assist in processing payments, delivering products, and performing other essential services.</li>
              <li>Legal Compliance: If required by law or in response to a valid legal request, we may disclose your information to law enforcement or regulatory authorities.</li>
              <li>Business Transfers: In the event of a merger, acquisition, or sale of operatype.co, your information may be transferred as part of the business transaction.</li>
            </ul>
          </PolicySection>
          
          <PolicySection title="4. Data Security">
            <p>We implement reasonable security measures to protect your personal information from unauthorized access, alteration, or disclosure. However, no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.</p>
          </PolicySection>

          <PolicySection title="5. Cookies and Tracking Technologies">
            <p>We use cookies and similar tracking technologies to enhance your experience on our Website. Cookies are small text files stored on your device that help us remember your preferences and improve our services. You can choose to disable cookies through your browser settings, but this may impact the functionality of the Website.</p>
          </PolicySection>

          <PolicySection title="6. Your Rights and Choices">
            <p>You have the right to:</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Access and update your personal information at any time through your account settings.</li>
              <li>Request to delete your account or personal data by contacting us at operatype.co@gmail.com.</li>
              <li>Opt-out of receiving promotional emails by clicking the unsubscribe link in our emails or contacting us directly.</li>
            </ul>
          </PolicySection>

          <PolicySection title="7. Third-Party Links">
            <p>Our Website may contain links to third-party websites or services that are not operated by operatype.co. We are not responsible for the privacy practices or content of these third-party sites. We encourage you to review their privacy policies before interacting with them.</p>
          </PolicySection>

          <PolicySection title="8. Children's Privacy">
            <p>Our Website is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children. If we learn that we have collected personal information from a child under 18, we will take steps to delete that information.</p>
          </PolicySection>

          <PolicySection title="9. International Transfers">
            <p>If you are accessing the Website from outside Indonesia, please be aware that your information may be transferred to, stored, and processed in countries where our servers are located. By using our Website, you consent to the transfer of your information to countries outside of your own, which may have different data protection laws.</p>
          </PolicySection>
          
          <PolicySection title="10. Changes to This Privacy Policy">
            <p>We reserve the right to update or change this Privacy Policy at any time. When we make changes, the updated policy will be posted on this page with an updated effective date. Please review this Privacy Policy periodically to stay informed of any updates.</p>
          </PolicySection>

          <PolicySection title="11. Contact Information">
            <p>If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at: Email: operatype.co@gmail.com</p>
          </PolicySection>
        </div>
      </div>
    </div>
  );
}