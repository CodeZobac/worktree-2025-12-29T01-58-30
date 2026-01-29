"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import BlurText from '@/components/BlurText';
import AnimatedList from '@/components/AnimatedList';
import CountUp from '@/components/CountUp';
import Magnet from '@/components/Magnet';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { TrixContent } from '@/react-trix';
import { Recipe } from '@/types';
import { PLACEHOLDERS } from '@/lib/utils/image-placeholders';
import {
  Clock,
  Users,
  ChefHat,
  Share2,
  Printer,
  Copy,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minus,
  Plus,
  Bookmark,
  Heart,
  ArrowLeft,
  ZoomIn,
  Folder,
  Tag,
} from 'lucide-react';

interface RecipeDetailProps {
  recipe: Recipe;
  isOwner: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onBack?: () => void;
}

// Utility to parse ingredient quantities for scaling
const parseIngredient = (ingredient: string): { quantity: number | null; unit: string; rest: string } => {
  // Match patterns like "2 cups", "1/2 tsp", "1.5 kg", etc.
  const match = ingredient.match(/^([\d./]+)\s*([a-zA-Z]*)\s*(.*)$/);
  if (match) {
    const [, qty, unit, rest] = match;
    // Handle fractions like "1/2"
    let quantity: number | null = null;
    if (qty.includes('/')) {
      const [num, denom] = qty.split('/');
      quantity = parseFloat(num) / parseFloat(denom);
    } else {
      quantity = parseFloat(qty);
    }
    if (!isNaN(quantity)) {
      return { quantity, unit, rest };
    }
  }
  return { quantity: null, unit: '', rest: ingredient };
};

// Format number nicely (e.g., 0.5 -> "1/2", 1.5 -> "1 1/2")
const formatQuantity = (num: number): string => {
  const fractions: { [key: string]: string } = {
    '0.125': '1/8',
    '0.25': '1/4',
    '0.333': '1/3',
    '0.375': '3/8',
    '0.5': '1/2',
    '0.625': '5/8',
    '0.666': '2/3',
    '0.75': '3/4',
    '0.875': '7/8',
  };
  
  const whole = Math.floor(num);
  const decimal = num - whole;
  
  // Find closest fraction
  let closestFraction = '';
  let minDiff = 1;
  for (const [key, value] of Object.entries(fractions)) {
    const diff = Math.abs(decimal - parseFloat(key));
    if (diff < minDiff && diff < 0.05) {
      minDiff = diff;
      closestFraction = value;
    }
  }
  
  if (whole === 0 && closestFraction) return closestFraction;
  if (closestFraction) return `${whole} ${closestFraction}`;
  if (decimal === 0) return whole.toString();
  return num.toFixed(1).replace(/\.0$/, '');
};

// Cooking Mode Component
const CookingMode: React.FC<{
  recipe: Recipe;
  isOpen: boolean;
  onClose: () => void;
  scaledIngredients: string[];
}> = ({ recipe, isOpen, onClose, scaledIngredients }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [timer, setTimer] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showIngredients, setShowIngredients] = useState(true);

  // Parse instructions into steps (split by numbered lines or paragraphs)
  const steps = useMemo(() => {
    const html = recipe.instructions;
    // Remove HTML tags and split by common step patterns
    const text = html.replace(/<[^>]*>/g, '\n').trim();
    const rawSteps = text
      .split(/(?:\n\s*\n|\n(?=\d+[.)\s])|\n(?=Step\s+\d+))/)
      .map(s => s.replace(/^\d+[.)\s]*|^Step\s+\d+[.:]\s*/i, '').trim())
      .filter(s => s.length > 10);
    return rawSteps.length > 0 ? rawSteps : [text];
  }, [recipe.instructions]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && timer !== null && timer > 0) {
      interval = setInterval(() => {
        setTimer(t => (t !== null && t > 0 ? t - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timer]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        setCurrentStep(s => Math.min(s + 1, steps.length - 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentStep(s => Math.max(s - 1, 0));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, steps.length, onClose]);

  const toggleIngredient = (index: number) => {
    setCheckedIngredients(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <motion.button
          onClick={onClose}
          className="p-2 hover:bg-muted rounded-full transition-colors"
          aria-label="Exit cooking mode"
          whileHover={{ scale: 1.1, y: -4 }}
          whileTap={{ scale: 0.9, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <X className="w-6 h-6" />
        </motion.button>
        <h2 className="text-lg font-semibold truncate px-4">{recipe.name}</h2>
        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => setShowIngredients(!showIngredients)}
            className={`p-2 rounded-full transition-colors ${showIngredients ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            aria-label="Toggle ingredients"
            whileHover={{ scale: 1.1, y: -4 }}
            whileTap={{ scale: 0.9, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <ChefHat className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Ingredients sidebar (collapsible) */}
        <AnimatePresence>
          {showIngredients && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-r border-border bg-card overflow-y-auto"
            >
              <div className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <ChefHat className="w-4 h-4" /> Ingredients
                </h3>
                <ul className="space-y-2">
                  {scaledIngredients.map((ing, idx) => (
                    <li
                      key={idx}
                      onClick={() => toggleIngredient(idx)}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                        checkedIngredients.has(idx)
                          ? 'bg-primary/10 line-through text-muted-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          checkedIngredients.has(idx)
                            ? 'bg-primary border-primary'
                            : 'border-muted-foreground'
                        }`}
                      >
                        {checkedIngredients.has(idx) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-sm">{ing}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step content */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
          <div className="max-w-2xl w-full text-center">
            {/* Step indicator */}
            <div className="mb-8">
              <span className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
              </span>
              <div className="flex justify-center gap-1 mt-2">
                {steps.map((_, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => setCurrentStep(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentStep ? 'bg-primary w-6' : idx < currentStep ? 'bg-primary/50' : 'bg-muted'
                    }`}
                    aria-label={`Go to step ${idx + 1}`}
                    whileHover={{ scale: 1.3 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  />
                ))}
              </div>
            </div>

            {/* Step text */}
            <motion.p
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-2xl md:text-3xl leading-relaxed"
            >
              {steps[currentStep]}
            </motion.p>

            {/* Timer */}
            <div className="mt-8">
              {timer !== null ? (
                <div className="flex items-center justify-center gap-4">
                  <span className="text-4xl font-mono font-bold text-primary">
                    {formatTime(timer)}
                  </span>
                  <motion.button
                    onClick={() => setTimerRunning(!timerRunning)}
                    className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90"
                    whileHover={{ scale: 1.1, y: -4 }}
                    whileTap={{ scale: 0.9, y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    {timerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setTimer(null);
                      setTimerRunning(false);
                    }}
                    className="p-3 bg-muted rounded-full hover:bg-muted/80"
                    whileHover={{ scale: 1.1, y: -4 }}
                    whileTap={{ scale: 0.9, y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <RotateCcw className="w-5 h-5" />
                  </motion.button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-muted-foreground">Quick timer:</span>
                  {[1, 5, 10, 15].map(min => (
                    <motion.button
                      key={min}
                      onClick={() => {
                        setTimer(min * 60);
                        setTimerRunning(true);
                      }}
                      className="px-3 py-1 bg-muted hover:bg-muted/80 rounded-full text-sm"
                      whileHover={{ scale: 1.1, y: -4 }}
                      whileTap={{ scale: 0.9, y: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      {min}m
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation footer */}
      <div className="flex items-center justify-between p-4 border-t border-border bg-card">
        <motion.button
          onClick={() => setCurrentStep(s => Math.max(s - 1, 0))}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          whileHover={{ scale: 1.05, x: -4 }}
          whileTap={{ scale: 0.95, x: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <ChevronLeft className="w-5 h-5" /> Previous
        </motion.button>
        <span className="text-muted-foreground">
          Use arrow keys or swipe to navigate
        </span>
        <motion.button
          onClick={() => setCurrentStep(s => Math.min(s + 1, steps.length - 1))}
          disabled={currentStep === steps.length - 1}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          whileHover={{ scale: 1.05, x: 4 }}
          whileTap={{ scale: 0.95, x: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          Next <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
};

// Image Lightbox Component
const ImageLightbox: React.FC<{
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}> = ({ src, alt, isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleEscape);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors"
        aria-label="Close lightbox"
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <X className="w-8 h-8" />
      </motion.button>
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="relative max-w-5xl max-h-[90vh] w-full h-full"
        onClick={e => e.stopPropagation()}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain"
          sizes="100vw"
          priority
        />
      </motion.div>
    </motion.div>
  );
};

// Share Modal Component
const ShareModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe;
}> = ({ isOpen, onClose, recipe }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async (platform: string) => {
    const text = `Check out this recipe: ${recipe.name}`;
    const urls: { [key: string]: string } = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${shareUrl}`)}`,
      email: `mailto:?subject=${encodeURIComponent(recipe.name)}&body=${encodeURIComponent(`${text}\n\n${shareUrl}`)}`,
    };
    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'noopener,noreferrer');
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="relative bg-card rounded-2xl shadow-2xl max-w-md w-full p-6"
        onClick={e => e.stopPropagation()}
      >
        <motion.button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-muted rounded-full transition-colors"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <X className="w-5 h-5" />
        </motion.button>
        <h3 className="text-xl font-bold mb-4">Share Recipe</h3>
        
        {/* Copy link */}
        <div className="flex items-center gap-2 mb-4 p-3 bg-muted rounded-lg">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 bg-transparent text-sm outline-none truncate"
          />
          <motion.button
            onClick={handleCopy}
            className="p-2 hover:bg-background rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </motion.button>
        </div>

        {/* Social buttons */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            onClick={() => handleShare('whatsapp')}
            className="flex items-center justify-center gap-2 p-3 bg-[#25D366]/10 text-[#25D366] rounded-lg hover:bg-[#25D366]/20 transition-colors"
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.97, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </motion.button>
          <motion.button
            onClick={() => handleShare('email')}
            className="flex items-center justify-center gap-2 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.97, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const RecipeDetail: React.FC<RecipeDetailProps> = ({
  recipe,
  isOwner,
  onEdit,
  onDelete,
  onBack,
}) => {
  // State
  const [servingsMultiplier, setServingsMultiplier] = useState(1);
  const [showCookingMode, setShowCookingMode] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());

  // Parallax scroll effect for hero
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 400], [0, 100]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  // Calculate scaled ingredients
  const scaledIngredients = useMemo(() => {
    return recipe.ingredients.map(ing => {
      const parsed = parseIngredient(ing);
      if (parsed.quantity !== null) {
        const scaled = parsed.quantity * servingsMultiplier;
        return `${formatQuantity(scaled)} ${parsed.unit} ${parsed.rest}`.trim();
      }
      return ing;
    });
  }, [recipe.ingredients, servingsMultiplier]);

  // Current servings
  const currentServings = recipe.servings ? Math.round(recipe.servings * servingsMultiplier) : null;

  // Print handler
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Toggle ingredient check
  const toggleIngredient = (index: number) => {
    setCheckedIngredients(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <>
      <article className="max-w-4xl mx-auto print:max-w-none" aria-label={`Recipe: ${recipe.name}`}>
        {/* Back Button - Sticky on scroll */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-4 print:hidden"
        >
          {onBack && (
            <motion.button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              whileHover={{ scale: 1.03, x: -4 }}
              whileTap={{ scale: 0.97, x: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to recipes
            </motion.button>
          )}
        </motion.div>

        {/* Hero Section with Parallax Image */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full h-72 sm:h-96 md:h-[28rem] rounded-2xl overflow-hidden mb-8 shadow-xl print:h-64 print:shadow-none"
          role="img" 
          aria-label={recipe.imageUrl ? `Photo of ${recipe.name}` : 'No recipe photo available'}
        >
          {recipe.imageUrl ? (
            <>
              <motion.div
                style={{ y: heroY, opacity: heroOpacity }}
                className="absolute inset-0 scale-110"
              >
                <Image
                  src={recipe.imageUrl}
                  alt={recipe.name}
                  fill
                  className="object-cover cursor-zoom-in"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  placeholder="blur"
                  blurDataURL={PLACEHOLDERS.detail}
                  onClick={() => setShowLightbox(true)}
                />
              </motion.div>
              {/* Gradient overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              {/* Zoom hint */}
              <motion.button
                onClick={() => setShowLightbox(true)}
                className="absolute bottom-4 right-4 p-2 bg-black/40 backdrop-blur-sm text-white rounded-full hover:bg-black/60 transition-colors print:hidden"
                aria-label="View full image"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <ZoomIn className="w-5 h-5" />
              </motion.button>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <svg
                  className="w-28 h-28 text-primary/60 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-label="No recipe image"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-primary/70 font-medium text-lg">No image available</p>
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Recipe Header */}
        <div className="mb-6">
          <BlurText
            text={recipe.name}
            delay={100}
            animateBy="words"
            direction="top"
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-5 leading-tight print:text-3xl"
          />

          {/* Category/Folder badges */}
          {(recipe.folder || (recipe.categoryIds && recipe.categoryIds.length > 0)) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="flex flex-wrap gap-2 mb-4 print:hidden"
            >
              {recipe.folder && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  <Folder className="w-3.5 h-3.5" />
                  {recipe.folder.name}
                </span>
              )}
            </motion.div>
          )}

          {/* Meta Pills */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex flex-wrap items-center gap-3"
          >
            {recipe.user && (
              <div className="inline-flex items-center px-4 py-2 bg-card rounded-full shadow-sm border border-border">
                {recipe.user.image ? (
                  <Image
                    src={recipe.user.image}
                    alt={recipe.user.name}
                    width={24}
                    height={24}
                    className="w-6 h-6 rounded-full mr-2"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                    <svg className="w-3.5 h-3.5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <span className="text-sm font-medium text-foreground">{recipe.user.name}</span>
              </div>
            )}
            {recipe.cookingTime && (
              <div className="inline-flex items-center px-4 py-2 bg-card rounded-full shadow-sm border border-border">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center mr-2">
                  <Clock className="w-3.5 h-3.5 text-accent" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  <CountUp end={recipe.cookingTime} duration={1} suffix=" min" />
                </span>
              </div>
            )}
            {currentServings && (
              <div className="inline-flex items-center px-4 py-2 bg-card rounded-full shadow-sm border border-border">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                  <Users className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  <CountUp end={currentServings} duration={0.5} suffix=" servings" />
                </span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Quick Actions Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="flex flex-wrap items-center gap-2 mb-6 p-4 bg-card rounded-xl border border-border print:hidden"
        >
          {/* Servings Adjuster */}
          {recipe.servings && (
            <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
              <span className="text-sm font-medium text-muted-foreground">Servings:</span>
              <motion.button
                onClick={() => setServingsMultiplier(m => Math.max(0.5, m - 0.5))}
                className="p-1 hover:bg-background rounded transition-colors"
                aria-label="Decrease servings"
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Minus className="w-4 h-4" />
              </motion.button>
              <span className="w-8 text-center font-semibold">{currentServings}</span>
              <motion.button
                onClick={() => setServingsMultiplier(m => Math.min(10, m + 0.5))}
                className="p-1 hover:bg-background rounded transition-colors"
                aria-label="Increase servings"
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Plus className="w-4 h-4" />
              </motion.button>
              {servingsMultiplier !== 1 && (
                <motion.button
                  onClick={() => setServingsMultiplier(1)}
                  className="ml-1 p-1 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Reset servings"
                  whileHover={{ scale: 1.2, rotate: -180 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </motion.button>
              )}
            </div>
          )}

          <div className="flex-1" />

          {/* Action Buttons */}
          <Magnet padding={30} magnetStrength={3}>
            <motion.button
              onClick={() => setShowCookingMode(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <ChefHat className="w-4 h-4" />
              <span className="hidden sm:inline">Cook Mode</span>
            </motion.button>
          </Magnet>

          <motion.button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`p-2 rounded-lg transition-colors ${
              isFavorite ? 'bg-red-100 text-red-500' : 'hover:bg-muted text-muted-foreground'
            }`}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            whileHover={{ scale: 1.15, y: -4 }}
            whileTap={{ scale: 0.9, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </motion.button>

          <motion.button
            onClick={() => setShowShareModal(true)}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
            aria-label="Share recipe"
            whileHover={{ scale: 1.15, y: -4 }}
            whileTap={{ scale: 0.9, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Share2 className="w-5 h-5" />
          </motion.button>

          <motion.button
            onClick={handlePrint}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
            aria-label="Print recipe"
            whileHover={{ scale: 1.15, y: -4 }}
            whileTap={{ scale: 0.9, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Printer className="w-5 h-5" />
          </motion.button>
        </motion.div>

        {/* Description Card */}
        {recipe.description && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="mb-8 p-6 bg-gradient-to-br from-card to-card/80 rounded-2xl shadow-md border border-border"
          >
            <div className="prose prose-warm max-w-none">
              <TrixContent html={recipe.description} className="recipe-content" />
            </div>
          </motion.div>
        )}

        {/* Action Buttons (Edit/Delete) */}
        {isOwner && (onEdit || onDelete) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 mb-8 print:hidden" 
            role="group" 
            aria-label="Recipe actions"
          >
            {onEdit && (
              <motion.button
                onClick={onEdit}
                aria-label={`Edit ${recipe.name}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 active:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all font-medium shadow-md hover:shadow-lg touch-manipulation min-h-[48px]"
                whileHover={{ scale: 1.02, y: -8 }}
                whileTap={{ scale: 0.95, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Recipe
              </motion.button>
            )}
            {onDelete && (
              <motion.button
                onClick={onDelete}
                aria-label={`Delete ${recipe.name}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl hover:bg-destructive hover:text-destructive-foreground active:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all font-medium touch-manipulation min-h-[48px]"
                whileHover={{ scale: 1.02, y: -8 }}
                whileTap={{ scale: 0.95, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Recipe
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8 print:grid-cols-2 print:gap-4">
          {/* Ingredients Section - Sidebar */}
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="lg:col-span-2 bg-card rounded-2xl shadow-md border border-border overflow-hidden print:col-span-1 print:shadow-none print:border" 
            aria-labelledby="ingredients-heading"
          >
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-4 border-b border-border print:bg-primary/5">
              <h2 id="ingredients-heading" className="text-xl font-bold text-foreground flex items-center gap-2">
                <svg className="w-6 h-6 text-primary print:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Ingredients
                <span className="ml-auto text-sm font-normal text-muted-foreground bg-background px-2 py-0.5 rounded-full">
                  {recipe.ingredients.length} items
                </span>
              </h2>
              {servingsMultiplier !== 1 && (
                <p className="text-xs text-primary mt-1 print:hidden">
                  Scaled for {currentServings} servings ({servingsMultiplier}x)
                </p>
              )}
            </div>
            <div className="p-5">
              <AnimatedList stagger={0.04} duration={0.25}>
                <ul className="space-y-1" role="list">
                  {scaledIngredients.map((ingredient, index) => (
                    <motion.li
                      key={index}
                      className={`flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors group cursor-pointer print:cursor-default print:py-1 ${
                        checkedIngredients.has(index)
                          ? 'bg-primary/5 line-through text-muted-foreground'
                          : 'hover:bg-muted/50'
                      }`}
                      whileHover={{ x: 6, scale: 1.01 }}
                      whileTap={{ scale: 0.98, x: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      onClick={() => toggleIngredient(index)}
                    >
                      <span
                        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors print:w-5 print:h-5 print:text-[10px] ${
                          checkedIngredients.has(index)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground'
                        }`}
                      >
                        {checkedIngredients.has(index) ? <Check className="w-3 h-3" /> : index + 1}
                      </span>
                      <span className="text-foreground print:text-sm">{ingredient}</span>
                    </motion.li>
                  ))}
                </ul>
              </AnimatedList>
            </div>
          </motion.section>

          {/* Instructions Section - Main Content */}
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="lg:col-span-3 bg-card rounded-2xl shadow-md border border-border overflow-hidden print:col-span-1 print:shadow-none print:border" 
            aria-labelledby="instructions-heading"
          >
            <div className="bg-gradient-to-r from-accent/10 to-primary/10 px-6 py-4 border-b border-border print:bg-accent/5">
              <h2 id="instructions-heading" className="text-xl font-bold text-foreground flex items-center gap-2">
                <svg className="w-6 h-6 text-accent print:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                Instructions
              </h2>
            </div>
            <div className="p-6 print:p-4">
              <div className="prose prose-warm max-w-none print:prose-sm">
                <TrixContent html={recipe.instructions} className="recipe-content recipe-instructions" />
              </div>
            </div>
          </motion.section>
        </div>

        {/* Recipe Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="mt-10 pt-6 border-t border-border print:mt-4 print:pt-2"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>
                Created {new Date(recipe.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            {recipe.updatedAt && recipe.updatedAt !== recipe.createdAt && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>
                  Updated {new Date(recipe.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </article>

      {/* Modals */}
      <AnimatePresence>
        {showCookingMode && (
          <CookingMode
            recipe={recipe}
            isOpen={showCookingMode}
            onClose={() => setShowCookingMode(false)}
            scaledIngredients={scaledIngredients}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLightbox && recipe.imageUrl && (
          <ImageLightbox
            src={recipe.imageUrl}
            alt={recipe.name}
            isOpen={showLightbox}
            onClose={() => setShowLightbox(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showShareModal && (
          <ShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            recipe={recipe}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default RecipeDetail;
