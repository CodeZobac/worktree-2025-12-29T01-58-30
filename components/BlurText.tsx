"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

interface BlurTextProps {
  text: string;
  delay?: number;
  animateBy?: 'words' | 'characters';
  direction?: 'top' | 'bottom' | 'left' | 'right';
  threshold?: number;
  className?: string;
}

const BlurText: React.FC<BlurTextProps> = ({
  text,
  delay = 150,
  animateBy = 'words',
  direction = 'top',
  threshold = 0.1,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);

  const getInitialPosition = () => {
    switch (direction) {
      case 'top':
        return { y: -20 };
      case 'bottom':
        return { y: 20 };
      case 'left':
        return { x: -20 };
      case 'right':
        return { x: 20 };
      default:
        return { y: -20 };
    }
  };

  const segments = animateBy === 'words' ? text.split(' ') : text.split('');

  return (
    <div ref={ref} className={className}>
      {segments.map((segment, index) => (
        <motion.span
          key={index}
          initial={{
            opacity: 0,
            filter: 'blur(10px)',
            ...getInitialPosition(),
          }}
          animate={
            isVisible
              ? {
                  opacity: 1,
                  filter: 'blur(0px)',
                  y: 0,
                  x: 0,
                }
              : {}
          }
          transition={{
            duration: 0.5,
            delay: index * (delay / 1000),
            ease: 'easeOut',
          }}
          style={{ display: 'inline-block', whiteSpace: 'pre' }}
        >
          {segment}
          {animateBy === 'words' && index < segments.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </div>
  );
};

export default BlurText;
