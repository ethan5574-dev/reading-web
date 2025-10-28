'use client';

import { useContextStore } from '@/context/store';
import { Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export const useAuthGuard = () => {
  const { isAuthentication, isProfileLoading } = useContextStore();
  
  return {
    isAuthenticated: isAuthentication,
    isLoading: isProfileLoading,
  };
};

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  fallback,
  redirectTo = '/' 
}) => {
  const { isAuthentication, isProfileLoading } = useContextStore();
  const router = useRouter();

  // Show loading while checking authentication
  if (isProfileLoading) {
    return (
      <div className="min-h-screen mt-16 bg-white text-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600"></div>
          </div>
          <p className="text-zinc-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not authenticated
  if (!isAuthentication) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen mt-16 bg-white text-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-semibold text-zinc-900 mb-2">Access Denied</h1>
          <p className="text-zinc-600 mb-6">You need to be logged in to access this page.</p>
          <button
            onClick={() => router.push(redirectTo)}
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 cursor-pointer"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  // Render children if authenticated
  return <>{children}</>;
};

// Higher-order component version
export const withAuthGuard = <P extends object>(
  Component: React.ComponentType<P>,
  options?: { fallback?: React.ReactNode; redirectTo?: string }
) => {
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard fallback={options?.fallback} redirectTo={options?.redirectTo}>
        <Component {...props} />
      </AuthGuard>
    );
  };
};
