'use client';

import { createContext, useContext, useEffect, useMemo, useState, useTransition } from 'react';
import { deleteAllCookies, getCookie } from '@/utils/cookie';
import { QueryClient, useQuery } from '@tanstack/react-query';
import { checkAndCleanExpiredToken } from '@/utils/token';

const storeContext = createContext<any>(null);
export const useContextStore = () => useContext(storeContext);

const ContextStoreProvider = ({ children }: any) => {


 

  const value = useMemo(() => ({
    
  }), []);
  return (
    <storeContext.Provider value={value}>
      {children}
    </storeContext.Provider>
  );
};
export default ContextStoreProvider;
