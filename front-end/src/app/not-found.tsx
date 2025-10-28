'use client';

import useCustomRouter from '@/hook/useCustomRouter';
import React, { useEffect } from 'react';

const NotFound = () => {
  const customRouter = useCustomRouter();
  useEffect(() => {
    customRouter.push('/');
  }, [customRouter]);
  return <div>not-found</div>;
};

export default NotFound;
