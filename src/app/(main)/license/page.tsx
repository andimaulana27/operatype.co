// src/app/(main)/license/page.tsx
import Link from 'next/link';
import { CheckCircleIcon } from '@/components/icons';

const LicenseCard = ({ title, subtitle, description, features }: { title: string; subtitle: string; description: string; features: string[] }) => (
  <div className="border border-brand-black rounded-lg p-8 h-full flex flex-col">
    <h3 className="text-2xl font-medium text-brand-black">{title}</h3>
    <div className="w-16 h-0.5 bg-brand-orange mt-2 mb-4"></div>
    {/* PERBAIKAN: Warna teks diubah menjadi brand-black */}
    <p className="text-brand-black mt-1">{subtitle}</p>
    <p className="font-light text-brand-black mt-4">{description}</p>
    <ul className="space-y-3 mt-6">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start gap-3">
          <CheckCircleIcon className="w-6 h-6 text-brand-orange flex-shrink-0" />
          {/* PERBAIKAN: Warna teks diubah menjadi brand-black */}
          <span className="font-light text-brand-black">{feature}</span>
        </li>
      ))}
    </ul>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <LicenseCard
            title="Desktop License"
            subtitle="For Creating Graphics & Documents"
            description="Our standard license for using fonts on a desktop computer. Perfect for freelancers, students, and creating a vast array of static design work."
            features={[
              "Install the font on up to 2 computers per user.",
              "Create logos, branding, and marketing materials.",
              "Create rasterized images (JPEG, PNG) for web, ads, and social media.",
              "Create physical end products for sale (merchandise, packaging, print).",
              "Use in videos (YouTube, social media, etc.).",
            ]}
          />
          <LicenseCard
            title="Website License"
            subtitle="For Use on the Web"
            description="Allows you to embed the font into a single website's code, so it appears as live, selectable text."
            features={[
              "Use on one (1) website domain.",
              "License covers up to 50,000 monthly pageviews. (Contact us for higher traffic sites).",
              "Provided in WOFF & WOFF2 file formats for web optimization.",
              "This is for live text using CSS @font-face.",
            ]}
          />
          <LicenseCard
            title="App License"
            subtitle="For Mobile & Desktop Applications"
            description="Required if you are embedding the font file into the code of a mobile or desktop application."
            features={[
              "Embed in one (1) application title (e.g., one iOS app, one Android app, or one PC/Mac game).",
              "Covers unlimited installations of your application.",
              "The font file must be secured within the app's package and not accessible by end-users.",
            ]}
          />
          <LicenseCard
            title="E-pub License"
            subtitle="For E-books & Digital Publications"
            description="For embedding the font into an electronic publication like an e-book, e-magazine, or interactive PDF."
            features={[
              "Use for one (1) publication title (e.g. one book title, regardless of how many times it's sold).",
              "The font must be embedded in a secure, non-extractable format (e.g., EPUB, AZW, PDF).",
            ]}
          />
          <LicenseCard
            title="Broadcast License"
            subtitle="For TV, Film, and Streaming"
            description="A specific license for using the font in motion pictures, television shows, video streaming services, and broadcast commercials."
            features={[
              "Use in titles, credits, or other text within one (1) film, one (1) television series, or a broadcast advertising campaign.",
              "License term is typically for one year and renewable.",
              "Pricing is based on the scale and reach of the production. Please contact us for a quote.",
            ]}
          />
          
          {/* PERBAIKAN: Kartu CTA dikembalikan ke layout 'center' */}
          <div className="border border-brand-black rounded-lg p-8 h-full flex flex-col justify-center items-center text-center">
             <h3 className="text-2xl font-medium text-brand-black">Need a Custom Solution?</h3>
             <p className="font-light text-brand-black mt-4">
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
    </div>
  );
}
