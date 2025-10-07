// src/app/(auth)/login/page.tsx
import type { Metadata } from 'next';
import LoginForm from './LoginForm'; // Impor komponen klien yang baru

// Ekspor metadata untuk halaman ini
export const metadata: Metadata = {
  title: 'Login or Register',
  description: 'Login to your Operatype account to access your purchased fonts, or create a new account to start your creative journey.',
};

// Komponen halaman ini sekarang hanya bertugas me-render komponen form
export default function LoginPage() {
  return <LoginForm />;
}