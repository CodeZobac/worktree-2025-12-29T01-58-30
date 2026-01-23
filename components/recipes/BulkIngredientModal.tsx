"use client";

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { parseIngredient } from 'parse-ingredient';
import { ClipboardPaste, Check, X, AlertCircle, Trash2 } from 'lucide-react';

interface ParsedIngredient {
  original: string;
  formatted: string;
  quantity: number | null;
  quantity2: number | null;
  unitOfMeasure: string | null;
  description: string;
  isGroupHeader: boolean;
}

interface BulkIngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (ingredients: string[]) => void;
}

const BulkIngredientModal: React.FC<BulkIngredientModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [rawText, setRawText] = useState('');
  const [parsedIngredients, setParsedIngredients] = useState<ParsedIngredient[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Format a parsed ingredient back to a readable string
  const formatIngredient = (parsed: ReturnType<typeof parseIngredient>[0]): string => {
    if (parsed.isGroupHeader) {
      return parsed.description;
    }

    const parts: string[] = [];

    // Handle quantity (including ranges like "1-2")
    if (parsed.quantity !== null) {
      if (parsed.quantity2 !== null && parsed.quantity2 !== parsed.quantity) {
        parts.push(`${formatQuantity(parsed.quantity)}-${formatQuantity(parsed.quantity2)}`);
      } else {
        parts.push(formatQuantity(parsed.quantity));
      }
    }

    // Add unit of measure
    if (parsed.unitOfMeasure) {
      parts.push(parsed.unitOfMeasure);
    }

    // Add description (ingredient name)
    if (parsed.description) {
      parts.push(parsed.description);
    }

    return parts.join(' ');
  };

  // Format quantity to avoid ugly decimals (0.5 -> 1/2, 0.333 -> 1/3, etc.)
  const formatQuantity = (num: number): string => {
    // Common fractions
    const fractions: Record<string, string> = {
      '0.125': '⅛',
      '0.25': '¼',
      '0.333': '⅓',
      '0.375': '⅜',
      '0.5': '½',
      '0.625': '⅝',
      '0.667': '⅔',
      '0.75': '¾',
      '0.875': '⅞',
    };

    // Check if it's a whole number
    if (Number.isInteger(num)) {
      return num.toString();
    }

    // Check if it's a simple fraction
    const decimal = (num % 1).toFixed(3);
    if (fractions[decimal]) {
      const whole = Math.floor(num);
      return whole > 0 ? `${whole}${fractions[decimal]}` : fractions[decimal];
    }

    // Otherwise round to 2 decimal places
    return num.toFixed(2).replace(/\.?0+$/, '');
  };

  // Parse the raw text into ingredients
  const handleParse = useCallback(() => {
    if (!rawText.trim()) return;

    setIsParsing(true);

    try {
      // Split by newlines and filter empty lines
      const lines = rawText
        .split(/\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0);

      // Parse each line
      const parsed = lines.map(line => {
        const results = parseIngredient(line);
        if (results.length > 0) {
          const result = results[0];
          return {
            original: line,
            formatted: formatIngredient(result),
            quantity: result.quantity,
            quantity2: result.quantity2,
            unitOfMeasure: result.unitOfMeasure,
            description: result.description,
            isGroupHeader: result.isGroupHeader,
          };
        }
        // If parsing fails, use the original line as-is
        return {
          original: line,
          formatted: line,
          quantity: null,
          quantity2: null,
          unitOfMeasure: null,
          description: line,
          isGroupHeader: false,
        };
      });

      setParsedIngredients(parsed);
      setShowPreview(true);
    } catch (error) {
      console.error('Error parsing ingredients:', error);
    } finally {
      setIsParsing(false);
    }
  }, [rawText]);

  // Remove a single parsed ingredient from preview
  const removeIngredient = (index: number) => {
    setParsedIngredients(prev => prev.filter((_, i) => i !== index));
  };

  // Confirm import
  const handleImport = () => {
    const ingredients = parsedIngredients
      .filter(ing => !ing.isGroupHeader) // Skip group headers
      .map(ing => ing.formatted);

    onImport(ingredients);
    handleClose();
  };

  // Reset and close
  const handleClose = () => {
    setRawText('');
    setParsedIngredients([]);
    setShowPreview(false);
    onClose();
  };

  // Go back to input mode
  const handleBack = () => {
    setShowPreview(false);
  };

  // Handle paste from clipboard
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setRawText(text);
    } catch (error) {
      console.error('Failed to read clipboard:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={handleClose}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {showPreview ? 'Review Ingredients' : 'Paste Ingredients'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {showPreview
                        ? `${parsedIngredients.filter(i => !i.isGroupHeader).length} ingredients ready to import`
                        : 'Paste your ingredient list, one per line'}
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 -m-2"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <AnimatePresence mode="wait">
                  {!showPreview ? (
                    <motion.div
                      key="input"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      {/* Paste button */}
                      <button
                        type="button"
                        onClick={handlePasteFromClipboard}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-400 hover:text-orange-600 transition-colors"
                      >
                        <ClipboardPaste className="w-5 h-5" />
                        Paste from Clipboard
                      </button>

                      {/* Textarea */}
                      <div>
                        <textarea
                          value={rawText}
                          onChange={(e) => setRawText(e.target.value)}
                          placeholder={`Enter ingredients, one per line:\n\n2 cups all-purpose flour\n1 tsp baking powder\n½ cup butter, softened\n1-2 eggs\nPinch of salt`}
                          rows={10}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none font-mono text-sm"
                          autoFocus
                        />
                      </div>

                      {/* Tips */}
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex gap-3">
                          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-amber-800">
                            <p className="font-medium mb-1">Tips for best results:</p>
                            <ul className="list-disc list-inside space-y-1 text-amber-700">
                              <li>One ingredient per line</li>
                              <li>Fractions like ½, ⅓, ¾ are supported</li>
                              <li>Common units are recognized (cups, tbsp, tsp, oz, etc.)</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-3"
                    >
                      {parsedIngredients.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          No ingredients to preview
                        </div>
                      ) : (
                        <ul className="divide-y divide-gray-100">
                          {parsedIngredients.map((ingredient, index) => (
                            <motion.li
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.03 }}
                              className={`flex items-center gap-3 py-3 ${
                                ingredient.isGroupHeader ? 'bg-gray-50 -mx-6 px-6' : ''
                              }`}
                            >
                              {/* Status indicator */}
                              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                                ingredient.isGroupHeader
                                  ? 'bg-gray-200 text-gray-600'
                                  : 'bg-green-100 text-green-600'
                              }`}>
                                {ingredient.isGroupHeader ? (
                                  <span className="text-xs font-bold">#</span>
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <p className={`${
                                  ingredient.isGroupHeader
                                    ? 'font-semibold text-gray-700'
                                    : 'text-gray-900'
                                }`}>
                                  {ingredient.formatted}
                                </p>
                                {ingredient.original !== ingredient.formatted && !ingredient.isGroupHeader && (
                                  <p className="text-xs text-gray-400 truncate">
                                    Original: {ingredient.original}
                                  </p>
                                )}
                              </div>

                              {/* Remove button */}
                              {!ingredient.isGroupHeader && (
                                <button
                                  type="button"
                                  onClick={() => removeIngredient(index)}
                                  className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 transition-colors"
                                  aria-label={`Remove ${ingredient.formatted}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </motion.li>
                          ))}
                        </ul>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex-shrink-0">
                <div className="flex gap-3">
                  {showPreview ? (
                    <>
                      <button
                        type="button"
                        onClick={handleBack}
                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        Back
                      </button>
                      <motion.button
                        type="button"
                        onClick={handleImport}
                        disabled={parsedIngredients.filter(i => !i.isGroupHeader).length === 0}
                        className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Check className="w-5 h-5" />
                        Import {parsedIngredients.filter(i => !i.isGroupHeader).length} Ingredients
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleClose}
                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <motion.button
                        type="button"
                        onClick={handleParse}
                        disabled={!rawText.trim() || isParsing}
                        className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isParsing ? 'Parsing...' : 'Preview'}
                      </motion.button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BulkIngredientModal;
