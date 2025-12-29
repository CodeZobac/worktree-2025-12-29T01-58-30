"use client";

import React, { ReactNode } from 'react';
import { motion } from 'motion/react';

interface AnimatedListProps {
  children: ReactNode;
  stagger?: number;
  duration?: number;
  initial?: { opacity?: number; y?: number; x?: number };
  animate?: { opacity?: number; y?: number; x?: number };
  exit?: { opacity?: number; y?: number; x?: number };
  className?: string;
}

const AnimatedList: React.FC<AnimatedListProps> = ({
  children,
  stagger = 0.1,
  duration = 0.4,
  initial = { opacity: 0, y: 20 },
  animate = { opacity: 1, y: 0 },
  exit = { opacity: 0, y: -20 },
  className = '',
}) => {
  const childrenArray = React.Children.toArray(children);

  return (
    <div className={className}>
      {childrenArray.map((child, index) => (
        <motion.div
          key={index}
          initial={initial}
          animate={animate}
          exit={exit}
          transition={{
            duration,
            delay: index * stagger,
            ease: 'easeOut',
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
};

export default AnimatedList;
