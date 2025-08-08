import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-brand-white text-brand-black">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Kolom 1: Brand Info */}
          <div className="flex flex-col justify-between">
            <div>
              <Link href="/">
                <Image
                  src="/logo.svg"
                  alt="Operatype.co Logo"
                  width={150}
                  height={40}
                />
              </Link>
              <p className="font-light text-brand-black max-w-xs mt-4">
                Crafting high quality fonts with passion and precision.
              </p>
            </div>
            <div>
              <p className="font-light text-sm text-brand-black mt-6">
                © {new Date().getFullYear()} operatype.co. All Rights Reserved.
              </p>
              <div className="flex space-x-2 text-sm font-light text-brand-black mt-2">
                <Link href="/terms-of-service" className="hover:text-brand-orange">Terms of Service</Link>
                <span>|</span>
                <Link href="/privacy-policy" className="hover:text-brand-orange">Privacy Policy</Link>
              </div>
            </div>
          </div>

          {/* Kolom 2: Sitemap */}
          <div>
            <h3 className="text-lg font-medium text-brand-orange mb-4">Sitemap</h3>
            <ul className="space-y-3 font-light">
              <li><Link href="/fonts" className="text-brand-black hover:text-brand-orange">All Fonts</Link></li>
              <li><Link href="/about" className="text-brand-black hover:text-brand-orange">Our Story</Link></li>
              <li><Link href="/license" className="text-brand-black hover:text-brand-orange">License</Link></li>
              <li><Link href="/contact" className="text-brand-black hover:text-brand-orange">Contact</Link></li>
            </ul>
          </div>

          {/* Kolom 3: Connect */}
          <div>
            <h3 className="text-lg font-medium text-brand-orange mb-4">Connect</h3>
            <ul className="space-y-3 font-light">
              <li className="flex items-center space-x-3 text-brand-black hover:text-brand-orange group">
                <Image src="/icons/instagram.svg" alt="Instagram" width={20} height={20} className="filter-black group-hover:filter-orange"/>
                <a href="#">Instagram</a>
              </li>
              <li className="flex items-center space-x-3 text-brand-black hover:text-brand-orange group">
                <Image src="/icons/behance.svg" alt="Behance" width={20} height={20} className="filter-black group-hover:filter-orange"/>
                <a href="#">Behance</a>
              </li>
              <li className="flex items-center space-x-3 text-brand-black hover:text-brand-orange group">
                <Image src="/icons/dribbble.svg" alt="Dribbble" width={20} height={20} className="filter-black group-hover:filter-orange"/>
                <a href="#">Dribbble</a>
              </li>
               <li className="flex items-center space-x-3 text-brand-black hover:text-brand-orange group">
                <Image src="/icons/pinterest.svg" alt="Pinterest" width={20} height={20} className="filter-black group-hover:filter-orange"/>
                <a href="#">Pinterest</a>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Newsletter */}
          <div>
            <h3 className="text-lg font-medium text-brand-orange mb-4">Join Our Newsletter</h3>
            <p className="font-light text-brand-black mb-4">
              Get updates on new fonts, special offers, and freebies.
            </p>
            <form className="flex flex-col space-y-3">
              <input 
                type="email" 
                placeholder="Enter your email address"
                className="w-full bg-transparent border-b border-brand-gray-1 focus:border-brand-orange text-brand-black font-light py-2 focus:outline-none transition-colors"
              />
              <button 
                type="submit"
                className="bg-brand-orange text-white font-medium py-3 px-6 rounded-full hover:bg-brand-orange-hover transition-colors duration-300"
              >
                Subscribe
              </button>
            </form>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;