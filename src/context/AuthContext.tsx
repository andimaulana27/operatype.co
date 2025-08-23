// src/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

type Profile = {
  full_name: string | null;
  role: string | null;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  // PERBAIKAN: Fungsi logout dihapus dari context
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

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
          
          if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
          }
          setProfile(profileData);
        } else {
          setProfile(null);
        }
      } catch (error: any) {
        // Menggunakan toast untuk notifikasi error
        toast.error("Could not fetch session: " + error.message);
        setProfile(null);
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    getSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        getSessionAndProfile();
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // PERBAIKAN: Fungsi logout dihapus dari sini
  
  const value = { session, user, profile, loading };

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
