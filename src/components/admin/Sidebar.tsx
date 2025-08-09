// src/components/admin/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LogoutIcon } from '@/components/icons';
import Image from 'next/image';

const navLinks = [
  { name: 'Dashboard', href: '/admin/dashboard' },
  { name: 'Manage Fonts', href: '/admin/fonts' },
  { name: 'Manage Partners', href: '/admin/partners' },
  { name: 'Manage Orders', href: '/admin/orders' },
  { name: 'Manage Users', href: '/admin/users' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, profile, logout } = useAuth();

  return (
    // PERBAIKAN: Warna latar diubah menjadi putih
    <aside className="w-64 bg-white text-brand-black flex flex-col">
      <div className="p-6 border-b border-brand-gray-2">
        <Link href="/">
            <Image
                src="/logo.svg"
                alt="Operatype.co Logo"
                width={150}
                height={40}
                priority
            />
        </Link>
      </div>
      <nav className="flex-grow p-4">
        <ul>
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <li key={link.name}>
                <Link
                  href={link.href}
                  // PERBAIKAN: Warna teks dan hover disesuaikan
                  className={`block px-4 py-2 my-1 rounded-md transition-colors font-medium ${
                    isActive ? 'bg-brand-orange text-white' : 'hover:bg-brand-gray-2'
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-brand-gray-2">
        <div className="mb-4">
          <p className="font-semibold">{profile?.full_name || 'Admin'}</p>
          <p className="text-xs text-brand-gray-1">{user?.email}</p>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
        >
          <LogoutIcon className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
