'use client';

import { createContext, useContext, useEffect, useMemo, useState, useTransition } from 'react';
import { deleteAllCookies, getCookie } from '@/utils/cookie';
import { QueryClient, useQuery } from '@tanstack/react-query';
import { getProfile } from '@/fetching/auth';
import { checkAndCleanExpiredToken } from '@/utils/token';

const storeContext = createContext<any>(null);
export const useContextStore = () => useContext(storeContext);

const ContextStoreProvider = ({ children }: any) => {
  const [isPending, startTransition] = useTransition();
  const [isAuthentication, setIsAuthentication] = useState<boolean>(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    // Check if token exists and is not expired
    const token = getCookie('accessToken');
    if (token) {
      const wasExpired = checkAndCleanExpiredToken();
      setIsAuthentication(!wasExpired);
    } else {
      setIsAuthentication(false);
    }
  }, []);

  const { data: profileData, isLoading: isProfileLoading, isError: isProfileError, refetch: refetchProfile } = useQuery({
    queryKey: ['me'],
    queryFn: getProfile,
    enabled: isAuthentication,
    staleTime: 5 * 60 * 1000,
    retry: false, // Don't retry on 401
  });

  // Update profile when profileData changes
  useEffect(() => {
    if (profileData) {
      setProfile(profileData?.data);
    }
  }, [profileData]);

  // Handle profile error (401 - token expired)
  useEffect(() => {
    if (isProfileError && isAuthentication) {
      console.log('Profile fetch failed, token might be expired');
      logout();
    }
  }, [isProfileError, isAuthentication]);

  const logout = () => {
    setIsAuthentication(false);
    setProfile(null);
    deleteAllCookies();
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    
    // Redirect to home page
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const value = useMemo(() => ({
    isPending,
    startTransition,
    isAuthentication,
    setIsAuthentication,
    profile,
    setProfile,
    isProfileLoading,
    isProfileError,
    refetchProfile,
    logout,
  }), [isPending, startTransition, isAuthentication, profile, isProfileLoading, isProfileError, refetchProfile, logout, profileData]);
  return (
    <storeContext.Provider value={value}>
      {children}
    </storeContext.Provider>
  );
};
export default ContextStoreProvider;
