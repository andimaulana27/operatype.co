// src/components/AccountSidebar.tsx
'use client';

import { usePathname } from 'next/navigation';
import { useTransition } from 'react';
import Link from 'next/link';
import { FolderArrowDownIcon, ReceiptPercentIcon, KeyIcon, LogoutIcon } from '@/components/icons';
import type { User } from '@supabase/supabase-js';
import { useAuth } from '@/context/AuthContext'; // Impor useAuth

const SidebarLink = ({ href, icon, text }: { href: string; icon: React.ReactNode; text: string; }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 p-3 rounded-md text-brand-black transition-colors ${
        isActive ? 'bg-orange-100 font-medium' : 'hover:bg-gray-100'
      }`}
    >
      <span className="w-5 h-5 text-brand-orange">{icon}</span>
      <span>{text}</span>
    </Link>
  );
};

type AccountSidebarProps = {
  user: User;
  profile: { full_name: string | null } | null;
};

export default function AccountSidebar({ user, profile }: AccountSidebarProps) {
  const [isPending, startTransition] = useTransition();
  const { handleLogout } = useAuth(); // Ambil fungsi logout dari context

  // ==================== PERUBAHAN UTAMA ====================
  // Buat fungsi wrapper untuk menangani transisi loading state
  const onLogoutClick = () => {
    startTransition(async () => {
      await handleLogout();
    });
  };
  // =======================================================

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-4 mb-4 border-b">
        <p className="font-medium text-brand-black text-lg">{profile?.full_name}</p>
        <p className="text-sm text-brand-gray-1 break-words">{user.email}</p>
        <Link href="/account/edit-profile" className="text-sm text-brand-orange hover:underline mt-2 inline-block">
          Edit Profile
        </Link>
      </div>

      <nav className="flex flex-col space-y-1 font-medium">
        <SidebarLink href="/account" icon={<FolderArrowDownIcon />} text="My Fonts" />
        <SidebarLink href="/account/orders" icon={<ReceiptPercentIcon />} text="Order History" />
        <SidebarLink href="/account/change-password" icon={<KeyIcon />} text="Change Password" />
        
        <button 
          onClick={onLogoutClick} // Panggil fungsi wrapper yang baru
          disabled={isPending} 
          className="flex items-center w-full gap-3 p-3 rounded-md hover:bg-red-50 transition-colors text-left text-red-600 disabled:opacity-50"
        >
          <LogoutIcon className="w-5 h-5" />
          <span>{isPending ? 'Logging out...' : 'Logout'}</span>
        </button>
      </nav>
    </div>
  );
}