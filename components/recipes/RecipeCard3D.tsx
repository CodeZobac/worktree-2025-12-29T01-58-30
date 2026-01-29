"use client";

import type { SpringOptions } from 'motion/react';
import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Recipe } from '@/types';
import { PLACEHOLDERS } from '@/lib/utils/image-placeholders';
import { Clock } from 'lucide-react';

interface RecipeCard3DProps {
  recipe: Recipe;
  scaleOnHover?: number;
  rotateAmplitude?: number;
}

const springValues: SpringOptions = {
  damping: 30,
  stiffness: 100,
  mass: 2
};

export default function RecipeCard3D({
  recipe,
  scaleOnHover = 1.05,
  rotateAmplitude = 8,
}: RecipeCard3DProps) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  
  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);
  const scale = useSpring(1, springValues);
  const [lastY, setLastY] = useState(0);

  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
    const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude;

    rotateX.set(rotationX);
    rotateY.set(rotationY);
    setLastY(offsetY);
  }

  function handleTouch(e: React.TouchEvent<HTMLDivElement>) {
    if (!ref.current || e.touches.length === 0) return;

    const touch = e.touches[0];
    const rect = ref.current.getBoundingClientRect();
    const offsetX = touch.clientX - rect.left - rect.width / 2;
    const offsetY = touch.clientY - rect.top - rect.height / 2;

    const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
    const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude;

    rotateX.set(rotationX);
    rotateY.set(rotationY);
    scale.set(scaleOnHover);
    setLastY(offsetY);
  }

  function handleTouchEnd() {
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
  }

  function handleMouseEnter() {
    scale.set(scaleOnHover);
  }

  function handleMouseLeave() {
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
  }

  const handleClick = () => {
    // Delay navigation slightly to let the animation complete
    setTimeout(() => {
      router.push(`/recipes/${recipe.id}`);
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      ref={ref}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View recipe: ${recipe.name}`}
      className="relative w-full h-full [perspective:1000px] cursor-pointer group touch-none"
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouch}
      onTouchMove={handleTouch}
      onTouchEnd={handleTouchEnd}
      style={{
        aspectRatio: '210 / 297' // A4 ratio (portrait)
      }}
    >
      <motion.div
        className="relative w-full h-full [transform-style:preserve-3d] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
        style={{
          rotateX,
          rotateY,
          scale
        }}
      >
        {/* Recipe Image - Full card background */}
        <div className="absolute inset-0 w-full h-full">
          {recipe.imageUrl ? (
            <Image
              src={recipe.imageUrl}
              alt={recipe.name}
              fill
              className="object-cover will-change-transform [transform:translateZ(0)]"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="lazy"
              placeholder="blur"
              blurDataURL={PLACEHOLDERS.card}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-100 via-orange-200 to-orange-300 flex items-center justify-center">
              <svg
                className="w-24 h-24 text-orange-400 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
          
          {/* Gradient overlays for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none" />
        </div>

        {/* Title - Top Left */}
        <motion.div 
          className="absolute top-0 left-0 p-4 sm:p-5 md:p-6 z-10 will-change-transform"
          style={{
            transform: 'translateZ(20px)'
          }}
        >
          <h3 className="text-white text-xl sm:text-2xl md:text-3xl font-bold drop-shadow-lg line-clamp-2 leading-tight">
            {recipe.name}
          </h3>
        </motion.div>

        {/* Preparation Time - Bottom Right */}
        {recipe.cookingTime && (
          <motion.div 
            className="absolute bottom-0 right-0 p-4 sm:p-5 md:p-6 z-10 will-change-transform"
            style={{
              transform: 'translateZ(20px)'
            }}
          >
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              <span className="text-gray-900 font-semibold text-sm sm:text-base">
                {recipe.cookingTime} min
              </span>
            </div>
          </motion.div>
        )}

        {/* Hover indicator - subtle pulse */}
        <div className="absolute inset-0 border-2 border-orange-500 rounded-xl opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </motion.div>
    </div>
  );
}
