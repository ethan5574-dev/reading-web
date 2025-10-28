'use client';
import React from 'react';

const Loading = () => {
  return (
    <div className='scale_layout fixed inset-0 z-[99999] flex h-[var(--100vh)] w-full flex-col items-center justify-center gap-[0.5rem] bg-white max-sm:px-[16px]'>
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-gray-300 border-t-black animate-spin"></div>
        <div className="absolute inset-2 rounded-full bg-white"></div>
      </div>
      <span className="mt-4 text-black text-lg font-medium">Loading...</span>
    </div>
    </div>
  );
};

export default Loading;
