"use client";

import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import BlurText from '@/components/BlurText';

interface FormLoadingOverlayProps {
  message?: string;
}

const FormLoadingOverlay: React.FC<FormLoadingOverlayProps> = ({ 
  message = 'Saving...' 
}) => {
  return (
    <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center z-50 rounded-lg">
      <LoadingSpinner size="lg" className="mb-4" />
      <BlurText
        text={message}
        delay={50}
        animateBy="characters"
        className="text-lg font-semibold text-gray-700"
      />
    </div>
  );
};

export default FormLoadingOverlay;
