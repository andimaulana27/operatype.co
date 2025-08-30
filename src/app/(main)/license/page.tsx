// src/app/(main)/license/page.tsx
import React from 'react';
import Link from 'next/link';
import { CheckCircle, XCircle, Star, Check, X } from 'lucide-react';

// ==================== DATA UNTUK TABEL PERBANDINGAN ====================
const comparisonFeatures = [
  {
    category: 'Core Usage',
    features: [
      { name: 'Number of Users/Devices', desktop: '1 User / 2 Devices', standard: '1 User / 2 Devices', extended: 'Up to 5 Users', corporate: 'Up to 20 Users' },
      { name: 'Personal & Non-Commercial Projects', desktop: true, standard: true, extended: true, corporate: true },
      { name: 'Commercial Use (Client Work, Branding)', desktop: false, standard: true, extended: true, corporate: true },
    ]
  },
  {
    category: 'Products for Sale',
    features: [
      { name: 'Physical End Products (T-shirts, Mugs)', desktop: false, standard: 'Unlimited', extended: 'Unlimited', corporate: 'Unlimited' },
      { name: 'Digital End Products (Templates, E-books)', desktop: false, standard: false, extended: true, corporate: true },
    ]
  },
  {
    category: 'Digital & Broadcast',
    features: [
        { name: 'Web Embedding (Live Text)', desktop: false, standard: false, extended: 'Up to 1M Views/Month', corporate: 'Unlimited' },
        { name: 'App & Game Embedding', desktop: false, standard: false, extended: 'Up to 100k Downloads', corporate: 'Unlimited' },
        { name: 'Social Media & Video Ads', desktop: false, standard: false, extended: true, corporate: 'Unlimited' },
        { name: 'TV & Streaming Broadcast', desktop: false, standard: false, extended: false, corporate: 'Unlimited' },
    ]
  }
];

// Helper component untuk render cell tabel
const FeatureCell = ({ value }: { value: string | boolean | undefined }) => {
    if (typeof value === 'boolean') {
        return value ? <Check className="w-6 h-6 text-green-600 mx-auto" /> : <X className="w-6 h-6 text-red-500 mx-auto" />;
    }
    return <span className="text-gray-700 text-sm">{value}</span>;
};

// ==================== KOMPONEN TABEL PERBANDINGAN BARU ====================
const LicenseComparisonTable = () => (
  <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
    <table className="w-full text-left">
      <thead className="bg-gray-50">
        <tr>
          <th className="p-6 text-lg font-semibold text-brand-black w-1/3">Features</th>
          <th className="p-6 text-center font-semibold text-brand-black">Desktop</th>
          <th className="p-6 text-center font-semibold text-brand-black">Standard Commercial</th>
          <th className="p-6 text-center font-semibold text-brand-black">Extended Commercial</th>
          <th className="p-6 text-center font-semibold text-brand-black">Corporate</th>
        </tr>
      </thead>
      <tbody>
        {comparisonFeatures.map((group) => (
          <React.Fragment key={group.category}>
            <tr className="bg-gray-100">
              <td colSpan={5} className="px-6 py-3 text-sm font-bold text-brand-black">{group.category}</td>
            </tr>
            {group.features.map((feature, index) => (
              <tr key={feature.name} className="border-b border-gray-200 last:border-b-0 hover:bg-orange-50/20">
                <td className="pl-10 pr-6 py-4 font-medium text-gray-800">{feature.name}</td>
                <td className="px-6 py-4 text-center"><FeatureCell value={feature.desktop} /></td>
                <td className="px-6 py-4 text-center"><FeatureCell value={feature.standard} /></td>
                <td className="px-6 py-4 text-center"><FeatureCell value={feature.extended} /></td>
                <td className="px-6 py-4 text-center"><FeatureCell value={feature.corporate} /></td>
              </tr>
            ))}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  </div>
);


// ==================== KARTU LISENSI DENGAN DESAIN BARU ====================
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
  <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
    <h3 className="text-3xl font-semibold text-brand-black">{title}</h3>
    <div className="w-16 h-1 bg-brand-orange mt-3 mb-4"></div>
    <p className="text-gray-500 italic mb-6">{subtitle}</p>
    
    <div className="flex-grow space-y-6">
      <div>
        <h4 className="font-semibold text-green-700 mb-3 text-lg">Allowed:</h4>
        <ul className="space-y-3">
          {allowed.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
              <span className="text-gray-600 leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-semibold text-red-700 mb-3 text-lg">Not Allowed:</h4>
        <ul className="space-y-3">
          {notAllowed.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
              <span className="text-gray-600 leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

// ==================== KARTU LISENSI KORPORAT DENGAN DESAIN BARU ====================
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
  <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
    <h3 className="text-3xl font-semibold text-brand-black">{title}</h3>
    <div className="w-16 h-1 bg-brand-orange mt-3 mb-4"></div>
    <p className="text-gray-500 italic mb-6">{subtitle}</p>
    
    <div className="flex-grow space-y-6">
       <div>
        <h4 className="font-semibold text-green-700 mb-3 text-lg">Allowed:</h4>
        <ul className="space-y-3">
          {allowed.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
              <span className="text-gray-600 leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div>
        <h4 className="font-semibold text-blue-700 mb-3 text-lg">Additional Terms:</h4>
        <ul className="space-y-3">
          {additionalTerms.map((term, index) => (
            <li key={index} className="flex items-start gap-3">
              <Star className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" fill="currentColor" />
              <span className="text-gray-600 leading-relaxed">{term}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);


export default function LicensePage() {
  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-20">
        {/* ==================== PERUBAHAN DI SINI ==================== */}
        <div className="text-center mb-16">
          {/* 1. Ketebalan font diubah ke 'medium' agar sesuai dengan gambar */}
          <h1 className="text-5xl font-medium text-brand-black">Our Licenses</h1>
          {/* 2. Ukuran garis disesuaikan menjadi tinggi 3px dan lebar 80px */}
          <div className="w-20 h-[3px] bg-brand-orange mx-auto my-6"></div>
          {/* 3. Ukuran font sub-headline diubah ke 'lg' (18px) */}
          <p className="text-lg font-light text-brand-gray-1 max-w-3xl mx-auto">
            Simple, clear, and comprehensive terms to help you create with confidence. Find the perfect fit for your project.
          </p>
        </div>
        {/* ========================================================== */}

        <section className="mb-20">
          <h2 className="text-4xl font-semibold text-brand-black tracking-tight text-left mb-10">At a Glance</h2>
          <LicenseComparisonTable />
        </section>
        
        <section>
          <h2 className="text-4xl font-semibold text-brand-black tracking-tight text-left mb-10">License Details</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
              title="Standard Commercial"
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
              title="Extended Commercial"
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
        </section>

        <div className="mt-12 bg-gray-900 rounded-2xl p-10 flex flex-col justify-center items-center text-center">
           <h3 className="text-3xl font-semibold text-white">Need a Custom Solution?</h3>
           <p className="font-light text-gray-300 mt-4 max-w-3xl">
             On a Limited Budget or Need a Custom License? Our team can create a tailored package that fits your project's unique scope and budget. We're here to help.
           </p>
           <div className="mt-8">
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