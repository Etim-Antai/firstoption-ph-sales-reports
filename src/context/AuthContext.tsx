
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser, UserRole } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole;
  isAdmin: boolean;
  isLoading: boolean;
  isSupabaseConnected: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      return;
    }

    const client = supabase;

    const loadUser = async (authUser: {
      id: string;
      email?: string;
      user_metadata?: { full_name?: string };
    } | null) => {
      if (!authUser) {
        setUser(null);
        return;
      }

      const { data: profile, error } = await client
        .from('user_profiles')
        .select('role')
        .eq('id', authUser.id)
        .single();

      if (error || !profile || !['admin', 'viewer'].includes(profile.role)) {
        console.error('Unable to load an approved staff profile:', error?.message);
        setUser(null);
        await client.auth.signOut();
        return;
      }

      setUser({
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Staff Member',
        role: profile.role as UserRole,
      });
    };

    let active = true;

    const initialize = async () => {
      try {
        const { data, error } = await client.auth.getSession();

        if (error) throw error;

        if (active) {
          await loadUser(data.session?.user ?? null);
        }
      } catch (error) {
        console.error('Authentication initialization failed:', error);
        if (active) setUser(null);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    const { data: { subscription } } = client.auth.onAuthStateChange(
      (_event, session) => {
        if (!active) return;

        setIsLoading(true);

        setTimeout(() => {
          if (active) {
            void loadUser(session?.user ?? null).finally(() => {
              if (active) setIsLoading(false);
            });
          }
        }, 0);
      }
    );

    void initialize();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (
    email: string,
    password = ''
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        error: 'Supabase is not configured. Please check the deployment environment variables.',
      };
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Login failed. Please try again.' };
      }

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile || !['admin', 'viewer'].includes(profile.role)) {
        await supabase.auth.signOut();
        return {
          success: false,
          error: 'Your staff account has not been approved. Contact your administrator.',
        };
      }

      setUser({
        id: data.user.id,
        email: data.user.email || email,
        name: data.user.user_metadata?.full_name || email.split('@')[0],
        role: profile.role as UserRole,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (supabase && isSupabaseConfigured) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout failed:', error.message);
        return;
      }
    }

    setUser(null);
  };

  // Roles must be assigned in Supabase, not switched locally.
  const switchRole = (_newRole: UserRole) => {
    console.warn('Staff roles must be changed by an administrator in Supabase.');
  };

  const role: UserRole = user?.role || 'viewer';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAdmin: role === 'admin',
        isLoading,
        isSupabaseConnected: isSupabaseConfigured,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
