// src/components/Navbar.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

const CartIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
    strokeWidth={1.2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
    strokeWidth={1.2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'All Fonts', href: '/fonts' },
  { name: 'Partners', href: '/partners' },
  { name: 'About', href: '/about' },
  { name: 'License', href: '/license' },
  { name: 'Contact', href: '/contact' },
];

const Navbar = () => {
  const pathname = usePathname();
  const { cartItemCount } = useCart();
  const { session } = useAuth();

  return (
    <header className="bg-brand-white sticky top-0 z-50">
      <div className="container mx-auto">
        <nav className="flex items-center justify-between p-6">
          <div className="flex-shrink-0">
            <Link href="/" aria-label="Back to Homepage">
              <Image src="/logo.svg" alt="Operatype.co Logo" width={150} height={40} priority />
            </Link>
          </div>

          <div className="hidden md:flex flex-grow items-center justify-center">
            <ul className="flex items-center space-x-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className={`
                        group relative py-2 transition-colors duration-[450ms] ease-in text-[16px]
                        ${isActive 
                          ? 'font-medium text-brand-orange' 
                          : 'font-light text-brand-gray-1 hover:text-brand-black hover:font-medium'
                        }
                      `}
                    >
                      {link.name}
                      <span 
                        className={`
                          absolute left-0 -bottom-1 block h-0.5 bg-brand-orange transition-all duration-[450ms] ease-in
                          ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}
                        `}
                      ></span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex items-center space-x-5">
            <Link href="/cart" aria-label="Shopping Cart" className="relative text-brand-black hover:text-brand-orange transition-colors">
              <CartIcon className="w-[26px] h-[26px]" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 bg-red-600 text-white text-xs rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>
            
            <div className="h-6 w-px bg-brand-orange"></div>

            {/* PERBAIKAN: Warna ikon dinamis berdasarkan status login */}
            <Link 
              href={session ? "/account" : "/login"} 
              aria-label="Login or personal account" 
              className={`transition-colors ${session ? 'text-brand-orange' : 'text-brand-black'} hover:text-brand-orange`}
            >
              <UserIcon className="w-[26px] h-[26px]" />
            </Link>
          </div>
        </nav>
        <div className="border-b border-brand-black"></div>
      </div>
    </header>
  );
};

export default Navbar;
