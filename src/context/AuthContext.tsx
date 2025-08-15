// src/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

// Tipe data Profile dibuat lebih aman (mengizinkan null)
type Profile = {
  full_name: string | null;
  role: string | null;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true); // Mulai dengan loading = true

  // DIPERBARUI: Logika pengambilan data dibuat lebih tangguh dengan try...catch...finally
  useEffect(() => {
    const getSessionAndProfile = async () => {
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
          
          if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = baris tidak ditemukan
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
        // Blok finally akan SELALU dijalankan, baik ada error maupun tidak
        setLoading(false);
      }
    };

    getSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        // Cukup panggil ulang fungsi utama untuk menyinkronkan semua data
        getSessionAndProfile();
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // DIPERBARUI: Fungsi logout dibuat lebih aman dengan try...catch
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.href = '/login'; 
    } catch (error: any) {
      toast.error('Logout failed: ' + error.message);
    }
  };

  const value = { session, user, profile, loading, logout };

  // BARU: Menambahkan "Gerbang Loading" untuk mencegah layar putih
  if (loading) {
    return null; // Atau tampilkan komponen loading satu layar penuh
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