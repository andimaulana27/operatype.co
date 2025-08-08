// src/app/cart/layout.tsx
import Image from "next/image";
import Link from "next/link";

// PERBAIKAN: Menghapus tag <html>, <body>, dan import font
// karena semuanya sudah disediakan oleh RootLayout.

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-brand-white min-h-screen flex flex-col">
      {/* Header Minimalis */}
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
          <div className="flex items-center gap-2 text-sm text-brand-black">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            <span>Secure Checkout</span>
          </div>
        </div>
        <div className="border-b border-brand-black"></div>
      </header>

      <main className="flex-grow">
        {children}
      </main>
      
      <footer className="text-center py-6">
        <div className="text-sm text-brand-gray-1">
          <Link href="/terms-of-service" className="hover:text-brand-orange">Terms of Service</Link>
          <span className="mx-2">|</span>
          <Link href="/privacy-policy" className="hover:text-brand-orange">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}
