import { useState, useRef, useEffect } from 'react';

function useDebounce(callback: any, delay: any) {
  const timeoutRef = useRef(null);

  const debouncedFunction = (...args: any) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    (timeoutRef.current as any) = setTimeout(() => {
      callback(...args);
    }, delay);
  };

  return debouncedFunction;
}

export default useDebounce;
