// src/app/(main)/account/layout.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useTransition } from 'react';
import Link from 'next/link';
import { FolderArrowDownIcon, ReceiptPercentIcon, KeyIcon, LogoutIcon } from '@/components/icons';
import { logoutAction } from '@/app/actions/authActions';
import toast from 'react-hot-toast';
// HAPUS: import ToastNotifier dari sini karena sudah ada di layout utama

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

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      toast.loading('Logging out...');
      await logoutAction();
      toast.dismiss();
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <p className="text-lg text-gray-500">Loading your account dashboard...</p>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* HAPUS: ToastNotifier dari sini */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-medium text-brand-black">My Dashboard</h1>
          <div className="w-20 h-[3px] bg-brand-orange mx-auto my-6"></div>
          <p className="text-lg text-brand-gray-1">Welcome back, {profile?.full_name || user.email}!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-12">
          <aside className="lg:col-span-1">
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
                <form action={handleLogout}>
                  <button 
                    type="submit" 
                    disabled={isPending} 
                    className="flex items-center w-full gap-3 p-3 rounded-md hover:bg-red-50 transition-colors text-left text-red-600 disabled:opacity-50"
                  >
                    <LogoutIcon className="w-5 h-5" />
                    <span>{isPending ? 'Logging out...' : 'Logout'}</span>
                  </button>
                </form>
              </nav>
            </div>
          </aside>

          <main className="lg:col-span-3 mt-12 lg:mt-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
