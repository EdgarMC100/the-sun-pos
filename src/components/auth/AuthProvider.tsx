'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Hub } from 'aws-amplify/utils';
import { getCurrentUserData, type UserRole } from '@/lib/amplify/auth-helpers';
import '@/lib/amplify/client'; // Initialize Amplify

/**
 * Auth Context Provider
 *
 * Provides authentication state and user data throughout the app.
 *
 * Features:
 * - Tracks current user and authentication state
 * - Listens to Amplify Hub auth events
 * - Provides role-based helpers (isAdmin, isCashier)
 * - Auto-refreshes on sign-in/sign-out
 *
 * Usage:
 * ```tsx
 * const { user, loading, isAdmin, isCashier } = useAuth();
 * ```
 */

interface AuthContextType {
  user: UserRole | null;
  loading: boolean;
  isAdmin: boolean;
  isCashier: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user data
  const loadUser = async () => {
    setLoading(true);
    const userData = await getCurrentUserData();
    setUser(userData);
    setLoading(false);
  };

  // Initial load
  useEffect(() => {
    loadUser();
  }, []);

  // Listen to Amplify Hub auth events
  useEffect(() => {
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          console.log('User signed in');
          loadUser();
          break;
        case 'signedOut':
          console.log('User signed out');
          setUser(null);
          break;
        case 'tokenRefresh':
          console.log('Token refreshed');
          loadUser();
          break;
        case 'signInWithRedirect':
          console.log('Sign in with redirect');
          loadUser();
          break;
        default:
          break;
      }
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    isAdmin: user?.role === 'admin',
    isCashier: user?.role === 'cashier',
    refreshUser: loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth Hook
 *
 * Access authentication context in any component.
 *
 * @throws Error if used outside AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
