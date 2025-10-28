import React, { useEffect } from 'react';
import useResponsive from './useResponsive';

const useScaleLayout = () => {
  const { width }: any = useResponsive();
  useEffect(() => {
    // if (width < 1024) {
    //   (document.documentElement.style as any).zoom = 'unset';
    //   document.documentElement.style.setProperty('--100vh', `100vh`);
    //   return;
    // }
    (document.documentElement.style as any).zoom = `${width / 1920}`;
    document.documentElement.style.setProperty(
      '--100vh',
      `calc(100vh/(${width / 1920}))`
    );
    document.documentElement.style.setProperty(
      '--80vh',
      `calc(80vh/(${width / 1920}))`
    );
  }, [width]);
};

export default useScaleLayout;
