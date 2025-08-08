// src/components/admin/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { name: 'Dashboard', href: '/admin/dashboard' },
  { name: 'Manage Fonts', href: '/admin/fonts' },
  { name: 'Manage Partners', href: '/admin/partners' },
  { name: 'Manage Orders', href: '/admin/orders' },
  { name: 'Manage Users', href: '/admin/users' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-6 text-2xl font-semibold border-b border-gray-700">
        Operatype.co
      </div>
      <nav className="flex-grow p-4">
        <ul>
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className={`block px-4 py-2 my-1 rounded-md transition-colors ${
                    isActive ? 'bg-brand-orange text-white' : 'hover:bg-gray-700'
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-6 border-t border-gray-700">
        {/* User Info Placeholder */}
        <p className="text-sm">Admin User</p>
      </div>
    </aside>
  );
}
