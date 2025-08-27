// src/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation'; // Impor useRouter

type Profile = {
  full_name: string | null;
  role: string | null;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  // FUNGSI BARU: Tambahkan fungsi untuk menangani logout
  handleLogout: () => Promise<void>; 
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const getSessionAndProfile = useCallback(async () => {
    try {
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', currentUser.id)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }
        setProfile(profileData);
      } else {
        setProfile(null);
      }
    } catch (error: any) {
      toast.error("Could not fetch session: " + error.message);
      setProfile(null);
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        // Setiap kali state auth berubah (login/logout),
        // ambil data terbaru dan segarkan state dari server.
        getSessionAndProfile();
        router.refresh(); 
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [getSessionAndProfile, router]);
  
  // FUNGSI BARU: Logika logout terpusat
  const handleLogout = async () => {
    toast.loading('Logging out...');
    const { error } = await supabase.auth.signOut();
    toast.dismiss();

    if (error) {
      toast.error(`Logout failed: ${error.message}`);
    } else {
      toast.success('You have been logged out.');
      // onAuthStateChange akan menangani sisanya (reset state & refresh)
      router.push('/');
    }
  };
  
  const value = { session, user, profile, loading, handleLogout };

  // Mencegah render komponen anak sebelum sesi selesai diperiksa
  if (loading) {
    return null; 
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};