import React, { useEffect, useRef } from 'react';

const useClickOutSide = ({ action }: { action: () => void }) => {
  const ref = useRef<any>(null);
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (ref.current && !ref.current.contains(event.target)) {
        action();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  return {
    ref,
  };
};

export default useClickOutSide;
