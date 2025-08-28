// src/app/(main)/license/page.tsx
import Link from 'next/link';
import { CheckCircleIcon } from '@/components/icons';
import { XCircle } from 'lucide-react'; // Mengimpor ikon X

// Komponen kartu lisensi yang dimodifikasi untuk menampilkan "Allowed" dan "Not Allowed"
const LicenseCard = ({ 
  title, 
  subtitle, 
  allowed, 
  notAllowed 
}: { 
  title: string; 
  subtitle: string; 
  allowed: string[]; 
  notAllowed: string[];
}) => (
  <div className="border border-brand-black rounded-lg p-8 h-full flex flex-col">
    <h3 className="text-2xl font-medium text-brand-black">{title}</h3>
    <div className="w-16 h-0.5 bg-brand-orange mt-2 mb-4"></div>
    <p className="text-brand-black mt-1 italic">{subtitle}</p>
    
    <div className="mt-6 flex-grow">
      <h4 className="font-medium text-green-600 mb-3">Allowed:</h4>
      <ul className="space-y-3 mb-6">
        {allowed.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
            <span className="font-light text-brand-black">{feature}</span>
          </li>
        ))}
      </ul>

      <h4 className="font-medium text-red-600 mb-3">Not Allowed:</h4>
      <ul className="space-y-3">
        {notAllowed.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <span className="font-light text-brand-black">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

// Komponen kartu lisensi korporat dengan "Additional Terms"
const CorporateLicenseCard = ({ 
  title, 
  subtitle, 
  allowed, 
  additionalTerms 
}: { 
  title: string; 
  subtitle: string; 
  allowed: string[]; 
  additionalTerms: string[];
}) => (
  <div className="border border-brand-black rounded-lg p-8 h-full flex flex-col">
    <h3 className="text-2xl font-medium text-brand-black">{title}</h3>
    <div className="w-16 h-0.5 bg-brand-orange mt-2 mb-4"></div>
    <p className="text-brand-black mt-1 italic">{subtitle}</p>
    
    <div className="mt-6 flex-grow">
      <h4 className="font-medium text-green-600 mb-3">Allowed:</h4>
      <ul className="space-y-3 mb-6">
        {allowed.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
            <span className="font-light text-brand-black">{feature}</span>
          </li>
        ))}
      </ul>

      <h4 className="font-medium text-blue-600 mb-3">Additional Terms:</h4>
      <ul className="space-y-3">
        {additionalTerms.map((term, index) => (
          <li key={index} className="flex items-start gap-3">
            <CheckCircleIcon className="w-6 h-6 text-blue-500 flex-shrink-0" />
            <span className="font-light text-brand-black">{term}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);


export default function LicensePage() {
  return (
    <div className="bg-brand-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-medium text-brand-black">Our Licenses</h1>
          <div className="w-20 h-[3px] bg-brand-orange mx-auto my-6"></div>
          <p className="text-lg font-light text-brand-gray-1 max-w-2xl mx-auto">
            Simple, clear, and comprehensive terms to help you create with confidence.
          </p>
        </div>

        {/* ==================== KONTEN LISENSI BARU ==================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <LicenseCard
            title="Desktop License"
            subtitle="For personal & non-commercial use only."
            allowed={[
              "Personal projects such as school work, student assignments, personal portfolios, resumes, or hobby-based designs.",
              "Non-commercial prints such as posters for personal use, greeting cards, or home decoration.",
              "Use on personal devices with no commercial intent."
            ]}
            notAllowed={[
              "Any commercial use (selling products, business branding, advertisements).",
              "Use for creating logos, trademarks, websites, apps, or client projects.",
              "Usage by more than one individual.",
              "Embedding into websites, apps, games, or digital platforms.",
              "Redistribution, reselling, or sharing of the font files.",
              "Modification of the font with intent to redistribute."
            ]}
          />
          <LicenseCard
            title="Standard Commercial License"
            subtitle="Best suited for freelancers, independent designers, and small businesses."
            allowed={[
              "Client work including branding, logo design, packaging, stationery, and marketing materials.",
              "Social media content for business accounts (static images, banners, thumbnails).",
              "Print-based materials such as books, magazines, brochures, flyers, stickers, t-shirts, posters, and product packaging.",
              "Static website use (images such as JPG, PNG, or PDF).",
              "Installation on a maximum of 2 devices for 1 user only."
            ]}
            notAllowed={[
              "Webfont embedding (.woff, .woff2, .eot, .svg) for live text on websites.",
              "Use in mobile applications or video games.",
              "Usage by multiple users, agencies, or teams without additional licenses.",
              "Incorporation into software, templates, or digital products for resale.",
              "Broadcasting or advertising campaigns on TV, streaming platforms, or large-scale media."
            ]}
          />
          <LicenseCard
            title="Extended Commercial License"
            subtitle="Designed for agencies, startups, and larger digital content creators."
            allowed={[
              "All usage rights granted under the Standard Commercial License.",
              "Web embedding (using .woff / .woff2 formats) with up to 1,000,000 pageviews per month across a single domain.",
              "Use in mobile applications and games, up to 100,000 downloads.",
              "Creation and sale of paid digital products such as e-books, design templates, or asset bundles (the font itself cannot be included as an installable file).",
              "Broadcast and advertising campaigns, including TV commercials, YouTube ads, TikTok, Instagram Reels, and other social media video ads.",
              "Installation for up to 5 users across 5 devices."
            ]}
            notAllowed={[
              "Use in AI training, machine learning datasets, or generative tools.",
              "Inclusion in open-source platforms, repositories, or shared asset libraries.",
              "Redistribution, resale, or claiming the font as your own.",
              "Unlimited app or web embedding (requires Corporate License)."
            ]}
          />
          <CorporateLicenseCard
            title="Corporate License"
            subtitle="For medium to large companies, including national and international brands."
            allowed={[
              "All usage rights granted under the Extended Commercial License.",
              "Corporate branding on a large scale: company logos, trademarks, product packaging, environmental design, interior signage, uniforms, and full brand systems.",
              "Use on primary websites, microsites, and corporate intranet or internal systems.",
              "Unlimited use in applications, games, and software with no download restrictions.",
              "Unlimited web embedding across multiple domains with no pageview limits.",
              "Broadcasting and advertising across all media: television, cinema, billboards, digital out-of-home (DOOH), streaming services, and global campaigns.",
              "Installation for up to 20 active users within the company."
            ]}
            additionalTerms={[
              "The purchasing company must provide its legal company name at the time of licensing.",
              "The license is valid only for the named company and cannot be transferred.",
              "For multinational corporations or enterprises exceeding 20 users, a custom or enterprise license may be required."
            ]}
          />
        </div>
        
        {/* KARTU KUSTOM DIPERTAHANKAN DAN DITEMPATKAN DI BAWAH */}
        <div className="mt-8 border border-brand-black rounded-lg p-8 flex flex-col justify-center items-center text-center bg-gray-50">
           <h3 className="text-2xl font-medium text-brand-black">Need a Custom Solution?</h3>
           <p className="font-light text-brand-black mt-4 max-w-2xl">
             On a Limited Budget or Need a Custom License? Our team can create a tailored package that fits your project's unique scope and budget. We're here to help.
           </p>
           <div className="mt-6">
              <Link href="/contact">
                <span className="inline-block bg-brand-orange text-white font-medium py-3 px-8 rounded-full hover:bg-brand-orange-hover transition-colors">
                  Contact Us
                </span>
              </Link>
           </div>
        </div>

      </div>
    </div>
  );
}