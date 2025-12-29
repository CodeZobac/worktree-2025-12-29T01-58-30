"use client";

import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import BlurText from '@/components/BlurText';

interface PageLoadingStateProps {
  message?: string;
}

const PageLoadingState: React.FC<PageLoadingStateProps> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center">
      <LoadingSpinner size="lg" className="mb-4" />
      <BlurText
        text={message}
        delay={50}
        animateBy="characters"
        className="text-xl font-semibold text-gray-700"
      />
    </div>
  );
};

export default PageLoadingState;
