"use client";

import { motion, useMotionValue, useTransform, type PanInfo } from 'motion/react';
import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';

interface CardRotateProps {
  children: React.ReactNode;
  onSendToBack: () => void;
  sensitivity: number;
  disableDrag?: boolean;
}

function CardRotate({ children, onSendToBack, sensitivity, disableDrag = false }: CardRotateProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [60, -60]);
  const rotateY = useTransform(x, [-100, 100], [-60, 60]);

  function handleDragEnd(_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    if (Math.abs(info.offset.x) > sensitivity || Math.abs(info.offset.y) > sensitivity) {
      onSendToBack();
    } else {
      x.set(0);
      y.set(0);
    }
  }

  if (disableDrag) {
    return (
      <motion.div className="absolute inset-0 cursor-pointer" style={{ x: 0, y: 0 }}>
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="absolute inset-0 cursor-grab"
      style={{ x, y, rotateX, rotateY }}
      drag
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.6}
      whileTap={{ cursor: 'grabbing' }}
      onDragEnd={handleDragEnd}
    >
      {children}
    </motion.div>
  );
}

export interface StackRef {
  shuffle: () => void;
  getTopCardIndex: () => number;
}

interface StackProps {
  randomRotation?: boolean;
  sensitivity?: number;
  sendToBackOnClick?: boolean;
  cards?: React.ReactNode[];
  animationConfig?: { stiffness: number; damping: number };
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  mobileClickOnly?: boolean;
  mobileBreakpoint?: number;
  onCardClick?: (index: number) => void;
}

const Stack = forwardRef<StackRef, StackProps>(({
  randomRotation = false,
  sensitivity = 200,
  cards = [],
  animationConfig = { stiffness: 260, damping: 20 },
  sendToBackOnClick = false,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
  mobileClickOnly = false,
  mobileBreakpoint = 768,
  onCardClick
}, ref) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  const [stack, setStack] = useState<{ id: number; content: React.ReactNode; originalIndex: number }[]>([]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [mobileBreakpoint]);

  const shouldDisableDrag = mobileClickOnly && isMobile;
  const shouldEnableClick = sendToBackOnClick || shouldDisableDrag;

  useEffect(() => {
    if (cards.length) {
      setStack(cards.map((content, index) => ({ id: index + 1, content, originalIndex: index })));
    }
  }, [cards]);

  const sendToBack = (id: number) => {
    setStack(prev => {
      const newStack = [...prev];
      const index = newStack.findIndex(card => card.id === id);
      const [card] = newStack.splice(index, 1);
      newStack.unshift(card);
      return newStack;
    });
  };

  // Shuffle function for the random button
  const shuffle = () => {
    if (stack.length <= 1 || isShuffling) return;
    
    setIsShuffling(true);
    
    // Fisher-Yates shuffle algorithm with better randomization
    const shuffled = [...stack];
    const now = Date.now();
    for (let i = shuffled.length - 1; i > 0; i--) {
      // Use a more random seed by combining Math.random with timestamp
      const random = Math.random() * (now % 1000) / 1000 + Math.random();
      const j = Math.floor((random % 1) * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Ensure we actually got a different order by checking top card
    if (shuffled.length > 1 && shuffled[shuffled.length - 1].id === stack[stack.length - 1].id) {
      // Swap last two if top card didn't change
      const lastIdx = shuffled.length - 1;
      [shuffled[lastIdx], shuffled[lastIdx - 1]] = [shuffled[lastIdx - 1], shuffled[lastIdx]];
    }
    
    setStack(shuffled);
    
    // Reset shuffling state after animation
    setTimeout(() => {
      setIsShuffling(false);
    }, 500);
  };

  // Get the original index of the top card
  const getTopCardIndex = () => {
    if (stack.length === 0) return -1;
    return stack[stack.length - 1].originalIndex;
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    shuffle,
    getTopCardIndex
  }));

  const handleCardClick = (id: number, originalIndex: number) => {
    if (onCardClick) {
      // Check if this is the top card
      const isTopCard = stack[stack.length - 1].id === id;
      if (isTopCard) {
        onCardClick(originalIndex);
        return;
      }
    }
    
    // If not top card or no onCardClick, send to back as normal
    if (shouldEnableClick) {
      sendToBack(id);
    }
  };

  useEffect(() => {
    if (autoplay && stack.length > 1 && !isPaused && !isShuffling) {
      const interval = setInterval(() => {
        const topCardId = stack[stack.length - 1].id;
        sendToBack(topCardId);
      }, autoplayDelay);

      return () => clearInterval(interval);
    }
  }, [autoplay, autoplayDelay, stack, isPaused, isShuffling]);

  return (
    <div
      className="relative w-full h-full"
      style={{
        perspective: 600
      }}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      {stack.map((card, index) => {
        const randomRotate = randomRotation ? Math.random() * 10 - 5 : 0;
        const isTopCard = index === stack.length - 1;
        
        return (
          <CardRotate
            key={card.id}
            onSendToBack={() => sendToBack(card.id)}
            sensitivity={sensitivity}
            disableDrag={shouldDisableDrag}
          >
            <motion.div
              className="rounded-2xl overflow-hidden w-full h-full shadow-xl"
              onClick={() => handleCardClick(card.id, card.originalIndex)}
              animate={{
                rotateZ: isShuffling 
                  ? (Math.random() * 30 - 15) 
                  : (stack.length - index - 1) * 4 + randomRotate,
                scale: isShuffling 
                  ? 0.9 + Math.random() * 0.1 
                  : 1 + index * 0.06 - stack.length * 0.06,
                x: isShuffling ? (Math.random() * 40 - 20) : 0,
                y: isShuffling ? (Math.random() * 40 - 20) : 0,
                transformOrigin: '90% 90%'
              }}
              initial={false}
              transition={{
                type: 'spring',
                stiffness: isShuffling ? 400 : animationConfig.stiffness,
                damping: isShuffling ? 30 : animationConfig.damping
              }}
              style={{
                cursor: isTopCard && onCardClick ? 'pointer' : 'grab'
              }}
            >
              {card.content}
            </motion.div>
          </CardRotate>
        );
      })}
    </div>
  );
});

Stack.displayName = 'Stack';

export default Stack;
