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

const AUTH_STORAGE_KEY = 'fo_solar_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // Fetch profile for role
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();

            setUser({
              id: session.user.id,
              email: session.user.email || 'user@firstoptionsolar.ng',
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Staff Member',
              role: (profile?.role as UserRole) || 'viewer',
            });
          }
        } catch (err) {
          console.error('Supabase auth initialization error:', err);
        }
      } else {
        // Local mode session check
        const saved = localStorage.getItem(AUTH_STORAGE_KEY);
        if (saved) {
          try {
            setUser(JSON.parse(saved));
          } catch (e) {
            console.error('Invalid saved user in local storage');
          }
        } else {
          // Default demo admin user for immediate seamless access
          const defaultAdmin: AuthUser = {
            id: 'admin-local',
            email: 'admin@firstoptionsolar.ng',
            name: 'FirstOption Admin',
            role: 'admin',
          };
          setUser(defaultAdmin);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultAdmin));
        }
      }
      setIsLoading(false);
    }

    initAuth();

    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      const { data: { subscription } } = client.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const { data: profile } = await client
            .from('user_profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Staff Member',
            role: (profile?.role as UserRole) || 'viewer',
          });
        } else {
          setUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const login = async (email: string, password = ''): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || email,
            name: data.user.user_metadata?.full_name || email.split('@')[0],
            role: (profile?.role as UserRole) || 'viewer',
          };
          setUser(authUser);
          setIsLoading(false);
          return { success: true };
        }
      } catch (err: any) {
        setIsLoading(false);
        return { success: false, error: err.message || 'Login failed' };
      }
    }

    // Local / Offline demo login mode
    const role: UserRole = email.toLowerCase().includes('viewer') ? 'viewer' : 'admin';
    const mockUser: AuthUser = {
      id: `usr-${Date.now()}`,
      email,
      name: email.split('@')[0] || 'Solar Team',
      role,
    };
    setUser(mockUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
    setIsLoading(false);
    return { success: true };
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    if (user) {
      const updated = { ...user, role: newRole };
      setUser(updated);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const role: UserRole = user?.role || 'viewer';
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAdmin,
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
