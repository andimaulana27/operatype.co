// src/app/(auth)/layout.tsx
import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-brand-white min-h-screen flex flex-col">
      <header className="container mx-auto">
        <div className="flex justify-between items-center p-6">
          <Link href="/">
            <Image
              src="/logo.svg"
              alt="Operatype.co Logo"
              width={150}
              height={40}
              priority
            />
          </Link>
          {/* PERBAIKAN: Warna teks diubah */}
          <span className="text-sm text-brand-black">
            Log in to Operatype.co
          </span>
        </div>
        {/* PERBAIKAN: Garis bawah ditambahkan */}
        <div className="border-b border-brand-black"></div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        {children}
      </main>
      
      <footer className="text-center py-6">
        {/* PERBAIKAN: Warna teks diubah */}
        <div className="text-sm text-brand-black">
          <Link href="/terms-of-service" className="hover:text-brand-orange">Terms of Service</Link>
          <span className="mx-2">|</span>
          <Link href="/privacy-policy" className="hover:text-brand-orange">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}
