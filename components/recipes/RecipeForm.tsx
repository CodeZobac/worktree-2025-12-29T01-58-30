"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FormLoadingOverlay } from '@/components/loading';
import ImageUpload from './ImageUpload';
import CreateFolderModal from './CreateFolderModal';
import BulkIngredientModal from './BulkIngredientModal';
import { TrixEditor, useTrixAttachment, type TrixEditorRef } from '@/react-trix';
import { Recipe, RecipeFormData, RecipeFolder, RecipeFolderFormData } from '@/types';
import { Check, Plus, X, ChevronLeft, ChevronRight, ClipboardPaste, BookOpen, UtensilsCrossed, ListOrdered, Settings } from 'lucide-react';
import { toast } from 'sonner';

// Predefined categories with Portuguese names
const PREDEFINED_CATEGORIES = [
  { name: 'Sobremesa', icon: '🍰', color: '#ec4899' },
  { name: 'Entrada', icon: '🥗', color: '#10b981' },
  { name: 'Prato Principal', icon: '🍽️', color: '#f97316' },
  { name: 'Peixe', icon: '🐟', color: '#3b82f6' },
  { name: 'Carne', icon: '🥩', color: '#ef4444' },
  { name: 'Vegetariano', icon: '🥬', color: '#22c55e' },
  { name: 'Lanche', icon: '🥪', color: '#f59e0b' },
  { name: 'Pequeno Almoço', icon: '🥐', color: '#8b5cf6' },
];

interface RecipeFormProps {
  recipe?: Recipe;
  onSubmit: (data: RecipeFormData) => Promise<void>;
  onCancel: () => void;
  initialFolderId?: string;
  hideFolderSelector?: boolean;
}

// Wizard step configuration
const WIZARD_STEPS = [
  { id: 1, name: 'Basics', icon: BookOpen, description: 'Name & categories' },
  { id: 2, name: 'Ingredients', icon: UtensilsCrossed, description: 'What you need' },
  { id: 3, name: 'Instructions', icon: ListOrdered, description: 'How to make it' },
  { id: 4, name: 'Details', icon: Settings, description: 'Time, servings & image' },
];

// LocalStorage key for auto-save
const DRAFT_STORAGE_KEY = 'recipe-form-draft';

const RecipeForm: React.FC<RecipeFormProps> = ({
  recipe,
  onSubmit,
  onCancel,
  initialFolderId,
  hideFolderSelector = false
}) => {
  const [formData, setFormData] = useState<RecipeFormData>({
    name: recipe?.name || '',
    description: recipe?.description || '',
    ingredients: recipe?.ingredients || [''],
    instructions: recipe?.instructions || '',
    cookingTime: recipe?.cookingTime || undefined,
    servings: recipe?.servings || undefined,
    folderId: initialFolderId || recipe?.folderId || undefined,
    categoryIds: recipe?.categoryIds || [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [folders, setFolders] = useState<RecipeFolder[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isBulkIngredientModalOpen, setIsBulkIngredientModalOpen] = useState(false);
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [draftRecovered, setDraftRecovered] = useState(false);
  
  // Draft recovery modal state
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<{
    formData: RecipeFormData;
    currentStep: number;
    savedAt: string;
  } | null>(null);

  // Refs for Trix editors
  const descriptionEditorRef = useRef<TrixEditorRef>(null);
  const instructionsEditorRef = useRef<TrixEditorRef>(null);

  // Setup image upload handler for Trix attachments
  const uploadHandler = async (
    file: File,
    { setProgress, setAttributes }: { setProgress: (n: number) => void; setAttributes: (attrs: Record<string, unknown>) => void }
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      setProgress(10);
      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });
      setProgress(80);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }
      
      const { url, href } = await response.json();
      setAttributes({ url, href });
      setProgress(100);
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  };

  useTrixAttachment(descriptionEditorRef, {
    onUpload: uploadHandler,
    maxFileSize: 5 * 1024 * 1024,
    allowedTypes: ['image/*'],
  });

  useTrixAttachment(instructionsEditorRef, {
    onUpload: uploadHandler,
    maxFileSize: 5 * 1024 * 1024,
    allowedTypes: ['image/*'],
  });

  // Auto-save draft to localStorage (only for new recipes)
  useEffect(() => {
    if (recipe) return; // Don't auto-save when editing existing recipe

    const saveDraft = () => {
      try {
        const draftData = {
          formData,
          currentStep,
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
      } catch (error) {
        console.error('Failed to save draft:', error);
      }
    };

    const intervalId = setInterval(saveDraft, 30000); // Save every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [formData, currentStep, recipe]);

  // Check for draft on mount (only for new recipes) - show modal instead of auto-recovering
  useEffect(() => {
    if (recipe) return; // Don't recover draft when editing

    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const draftData = JSON.parse(savedDraft);
        const { formData: draftFormData, savedAt } = draftData;
        
        // Only show modal if draft is less than 24 hours old and has a name
        const savedTime = new Date(savedAt).getTime();
        const now = Date.now();
        const hoursSinceSave = (now - savedTime) / (1000 * 60 * 60);
        
        if (hoursSinceSave < 24 && draftFormData.name) {
          setPendingDraft(draftData);
          setShowDraftModal(true);
        } else if (hoursSinceSave >= 24) {
          // Clear expired drafts automatically
          clearDraft();
        }
      }
    } catch (error) {
      console.error('Failed to check for draft:', error);
    }
  }, [recipe]);

  // Handle draft recovery from modal
  const handleRecoverDraft = () => {
    if (pendingDraft) {
      setFormData(pendingDraft.formData);
      setCurrentStep(pendingDraft.currentStep || 1);
      setDraftRecovered(true);
      toast.success('Draft recovered', {
        description: `Recipe "${pendingDraft.formData.name}" has been restored.`,
      });
    }
    setShowDraftModal(false);
    setPendingDraft(null);
  };

  // Handle starting fresh from modal
  const handleStartFresh = () => {
    clearDraft();
    setFormData({
      name: '',
      description: '',
      ingredients: [''],
      instructions: '',
      cookingTime: undefined,
      servings: undefined,
      folderId: initialFolderId || undefined,
      categoryIds: [],
    });
    setCurrentStep(1);
    setShowDraftModal(false);
    setPendingDraft(null);
  };

  // Clear draft from localStorage
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }, []);

  // Fetch folders on mount
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await fetch('/api/folders');
        if (response.ok) {
          const data = await response.json();
          setFolders(data);
          
          // Initialize predefined categories if they don't exist
          await ensurePredefinedCategories(data);
        }
      } catch (error) {
        console.error('Error fetching folders:', error);
      } finally {
        setLoadingFolders(false);
      }
    };
    fetchFolders();
  }, []);

  // Ensure predefined categories exist in the database
  const ensurePredefinedCategories = async (existingFolders: RecipeFolder[]) => {
    const existingNames = existingFolders.map(f => f.name.toLowerCase());
    const missingCategories = PREDEFINED_CATEGORIES.filter(
      cat => !existingNames.includes(cat.name.toLowerCase())
    );

    // Create missing predefined categories
    for (const category of missingCategories) {
      try {
        const response = await fetch('/api/folders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: category.name,
            icon: category.icon,
            color: category.color,
          }),
        });
        
        if (response.ok) {
          const newFolder = await response.json();
          setFolders(prev => [...prev, newFolder]);
        }
      } catch (error) {
        console.error(`Error creating predefined category ${category.name}:`, error);
      }
    }
  };

  // Update folderId when initialFolderId changes
  useEffect(() => {
    if (initialFolderId && initialFolderId !== formData.folderId) {
      setFormData((prev) => ({ ...prev, folderId: initialFolderId }));
    }
  }, [initialFolderId, formData.folderId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData((prev) => ({ ...prev, ingredients: newIngredients }));
  };

  const addIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, ''],
    }));
  };

  const removeIngredient = (index: number) => {
    if (formData.ingredients.length > 1) {
      const newIngredients = formData.ingredients.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, ingredients: newIngredients }));
    }
  };

  // Handle bulk ingredient import
  const handleBulkIngredientImport = (ingredients: string[]) => {
    // Filter out existing empty ingredients, then add the new ones
    const existingNonEmpty = formData.ingredients.filter(ing => ing.trim());
    const newIngredients = [...existingNonEmpty, ...ingredients];
    
    setFormData((prev) => ({
      ...prev,
      ingredients: newIngredients.length > 0 ? newIngredients : [''],
    }));

    // Clear ingredient errors
    if (errors.ingredients) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.ingredients;
        return newErrors;
      });
    }

    toast.success(`Added ${ingredients.length} ingredients`);
  };

  const handleImageChange = (file: File | null) => {
    setFormData((prev) => ({ ...prev, image: file || undefined }));
  };

  const handleImageError = (error: string) => {
    if (error) {
      setErrors((prev) => ({ ...prev, image: error }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.image;
        return newErrors;
      });
    }
  };

  // Handle category selection (multi-select)
  const toggleCategory = (folderId: string) => {
    setFormData((prev) => {
      const currentIds = prev.categoryIds || [];
      const isSelected = currentIds.includes(folderId);
      
      const newCategoryIds = isSelected
        ? currentIds.filter(id => id !== folderId)
        : [...currentIds, folderId];
      
      return { ...prev, categoryIds: newCategoryIds };
    });
    
    // Clear category error if at least one is selected
    if (errors.categoryIds) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.categoryIds;
        return newErrors;
      });
    }
  };

  // Validate specific step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1: // Basics
        if (!formData.name.trim()) {
          newErrors.name = 'Recipe name is required';
        }
        if (!formData.categoryIds || formData.categoryIds.length === 0) {
          newErrors.categoryIds = 'Please select at least one category';
        }
        break;
      case 2: // Ingredients
        const validIngredients = formData.ingredients.filter((ing) => ing.trim());
        if (validIngredients.length === 0) {
          newErrors.ingredients = 'At least one ingredient is required';
        }
        break;
      case 3: // Instructions
        if (!formData.instructions.trim()) {
          newErrors.instructions = 'Instructions are required';
        }
        break;
      case 4: // Details (optional fields, just validate if provided)
        if (formData.cookingTime && formData.cookingTime < 0) {
          newErrors.cookingTime = 'Cooking time must be positive';
        }
        if (formData.servings && formData.servings < 0) {
          newErrors.servings = 'Servings must be positive';
        }
        break;
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  // Navigate to next step
  const goToNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, WIZARD_STEPS.length));
    }
  };

  // Navigate to previous step
  const goToPreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Navigate to specific step (only if previous steps are valid)
  const goToStep = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step);
    } else if (step > currentStep) {
      // Validate all steps up to the target
      for (let i = currentStep; i < step; i++) {
        if (!validateStep(i)) {
          return;
        }
      }
      setCurrentStep(step);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Recipe name is required';
    }

    const validIngredients = formData.ingredients.filter((ing) => ing.trim());
    if (validIngredients.length === 0) {
      newErrors.ingredients = 'At least one ingredient is required';
    }

    if (!formData.instructions.trim()) {
      newErrors.instructions = 'Instructions are required';
    }

    if (formData.cookingTime && formData.cookingTime < 0) {
      newErrors.cookingTime = 'Cooking time must be positive';
    }

    if (formData.servings && formData.servings < 0) {
      newErrors.servings = 'Servings must be positive';
    }

    // Require at least one category
    if (!formData.categoryIds || formData.categoryIds.length === 0) {
      newErrors.categoryIds = 'Please select at least one category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Filter out empty ingredients and properly parse number fields
      const cleanedData = {
        ...formData,
        ingredients: formData.ingredients.filter((ing) => ing.trim()),
        // Convert string values to numbers for cookingTime and servings
        cookingTime: formData.cookingTime ? Number(formData.cookingTime) : undefined,
        servings: formData.servings ? Number(formData.servings) : undefined,
        // Keep first category as folderId for backward compatibility
        folderId: formData.categoryIds && formData.categoryIds.length > 0 ? formData.categoryIds[0] : undefined,
      };

      await onSubmit(cleanedData);
      
      // Clear draft after successful submission
      clearDraft();
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ submit: 'Failed to save recipe. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateFolder = async (folderData: RecipeFolderFormData) => {
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(folderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create folder');
      }

      const newFolder: RecipeFolder = await response.json();

      // Update folders list
      setFolders((prev) => [...prev, newFolder]);

      // Auto-select the new category
      setFormData((prev) => ({
        ...prev,
        categoryIds: [...(prev.categoryIds || []), newFolder.id],
      }));
      
      // Clear category error if exists
      if (errors.categoryIds) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.categoryIds;
          return newErrors;
        });
      }

    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  };

  // Sort folders: predefined first, then user-created
  const sortedFolders = [...folders].sort((a, b) => {
    const aPredefined = PREDEFINED_CATEGORIES.some(p => p.name.toLowerCase() === a.name.toLowerCase());
    const bPredefined = PREDEFINED_CATEGORIES.some(p => p.name.toLowerCase() === b.name.toLowerCase());
    if (aPredefined && !bPredefined) return -1;
    if (!aPredefined && bPredefined) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <>
      {/* Draft Recovery Modal */}
      <AnimatePresence>
        {showDraftModal && pendingDraft && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => {}} // Prevent closing by clicking outside
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Draft Found
                </h3>
                <p className="text-gray-600">
                  There is a recipe <span className="font-medium text-gray-900">&quot;{pendingDraft.formData.name}&quot;</span> draft stored.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Saved {new Date(pendingDraft.savedAt).toLocaleDateString()} at {new Date(pendingDraft.savedAt).toLocaleTimeString()}
                </p>
              </div>
              
              <p className="text-center text-gray-600 mb-6">
                Do you wish to continue with this draft?
              </p>
              
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <button
                  type="button"
                  onClick={handleStartFresh}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Start Fresh
                </button>
                <button
                  type="button"
                  onClick={handleRecoverDraft}
                  className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  Continue Draft
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative" aria-label={recipe ? 'Edit recipe form' : 'Create recipe form'}>
        {isSubmitting && <FormLoadingOverlay message={recipe ? 'Updating recipe...' : 'Creating recipe...'} />}
        
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {WIZARD_STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              const isClickable = step.id <= currentStep || (step.id === currentStep + 1);
              
              return (
                <React.Fragment key={step.id}>
                  {/* Step indicator */}
                  <button
                    type="button"
                    onClick={() => isClickable && goToStep(step.id)}
                    disabled={!isClickable}
                    className={`flex flex-col items-center gap-2 transition-all ${
                      isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                    }`}
                  >
                    <motion.div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-orange-600 text-white shadow-lg'
                          : isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                      animate={{
                        scale: isActive ? 1.1 : 1,
                      }}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                    </motion.div>
                    <div className="text-center hidden sm:block">
                      <p className={`text-sm font-medium ${isActive ? 'text-orange-600' : 'text-gray-600'}`}>
                        {step.name}
                      </p>
                      <p className="text-xs text-gray-400">{step.description}</p>
                    </div>
                  </button>
                  
                  {/* Connector line */}
                  {index < WIZARD_STEPS.length - 1 && (
                    <div className="flex-1 h-1 mx-2 sm:mx-4 rounded bg-gray-200 relative overflow-hidden">
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-orange-600"
                        initial={{ width: '0%' }}
                        animate={{
                          width: currentStep > step.id ? '100%' : '0%',
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Basics */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Recipe Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Recipe Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  aria-required="true"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent touch-manipulation text-lg ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="What's cooking?"
                  autoFocus
                />
                {errors.name && <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">{errors.name}</p>}
              </div>

              {/* Categories Selection */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Categories * <span className="text-gray-400 font-normal">(select at least one)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCreateFolderModalOpen(true)}
                    className="text-xs font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    New Category
                  </button>
                </div>
                
                {loadingFolders ? (
                  <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 animate-pulse">
                    Loading categories...
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {sortedFolders.map((folder) => {
                        const isSelected = formData.categoryIds?.includes(folder.id);
                        return (
                          <motion.button
                            key={folder.id}
                            type="button"
                            onClick={() => toggleCategory(folder.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border-2 ${
                              isSelected
                                ? 'text-white border-transparent shadow-md'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                            }`}
                            style={isSelected ? { backgroundColor: folder.color } : undefined}
                            whileTap={{ scale: 0.95 }}
                          >
                            <span>{folder.icon}</span>
                            <span>{folder.name}</span>
                            {isSelected && <Check className="w-4 h-4" />}
                          </motion.button>
                        );
                      })}
                    </div>
                    
                    {formData.categoryIds && formData.categoryIds.length > 0 && (
                      <div className="text-sm text-gray-500">
                        Selected: {formData.categoryIds.length} {formData.categoryIds.length === 1 ? 'category' : 'categories'}
                      </div>
                    )}
                  </div>
                )}
                
                {errors.categoryIds && (
                  <p className="mt-2 text-sm text-red-600" role="alert">{errors.categoryIds}</p>
                )}
              </div>

              {/* Description (optional) */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <TrixEditor
                  ref={descriptionEditorRef}
                  initialValue={formData.description || ''}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, description: value }))}
                  placeholder="A brief description of this recipe..."
                  aria-label="Recipe description"
                  className="min-h-[120px]"
                />
              </div>
            </motion.div>
          )}

          {/* Step 2: Ingredients */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700" id="ingredients-label">
                    Ingredients *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsBulkIngredientModalOpen(true)}
                    className="text-xs font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1.5 px-3 py-1.5 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    Paste Multiple
                  </button>
                </div>
                
                <div className="space-y-2" role="group" aria-labelledby="ingredients-label">
                  {formData.ingredients.map((ingredient, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-2"
                    >
                      <div className="flex items-center justify-center w-8 h-12 text-gray-400 text-sm font-medium">
                        {index + 1}.
                      </div>
                      <input
                        type="text"
                        value={ingredient}
                        onChange={(e) => handleIngredientChange(index, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addIngredient();
                            // Focus the new input after a short delay
                            setTimeout(() => {
                              const inputs = document.querySelectorAll('[aria-label^="Ingredient"]');
                              const lastInput = inputs[inputs.length - 1] as HTMLInputElement;
                              lastInput?.focus();
                            }, 50);
                          }
                        }}
                        aria-label={`Ingredient ${index + 1}`}
                        aria-required="true"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent touch-manipulation"
                        placeholder={index === 0 ? "e.g., 2 cups all-purpose flour" : `Ingredient ${index + 1}`}
                      />
                      {formData.ingredients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeIngredient(index)}
                          className="px-3 py-3 text-red-600 hover:bg-red-50 active:bg-red-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors touch-manipulation min-w-[44px]"
                          aria-label={`Remove ingredient ${index + 1}`}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
                
                <div className="flex items-center gap-4 mt-3">
                  <button
                    type="button"
                    onClick={addIngredient}
                    aria-label="Add another ingredient"
                    className="text-sm text-orange-600 hover:text-orange-700 active:text-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded font-medium touch-manipulation py-2 px-2 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Ingredient
                  </button>
                  <span className="text-xs text-gray-400">or press Enter</span>
                </div>
                
                {errors.ingredients && <p className="mt-2 text-sm text-red-600" role="alert">{errors.ingredients}</p>}
              </div>
              
              {/* Tip box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">💡 Tip:</span> Use the "Paste Multiple" button to quickly add ingredients from another source. 
                  Just paste your list and we'll parse it automatically!
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 3: Instructions */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions *
                </label>
                <TrixEditor
                  ref={instructionsEditorRef}
                  initialValue={formData.instructions}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, instructions: value }))}
                  placeholder="Write your step-by-step instructions here...&#10;&#10;Tip: Use numbered lists for clear steps!"
                  aria-required={true}
                  aria-invalid={!!errors.instructions}
                  aria-describedby={errors.instructions ? 'instructions-error' : undefined}
                  className={`min-h-[350px] ${errors.instructions ? 'border-red-500' : ''}`}
                />
                {errors.instructions && <p id="instructions-error" className="mt-2 text-sm text-red-600" role="alert">{errors.instructions}</p>}
              </div>
              
              {/* Writing tips */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800 font-medium mb-2">✍️ Writing great instructions:</p>
                <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                  <li>Number your steps for clarity</li>
                  <li>Include timing (e.g., "bake for 30 minutes")</li>
                  <li>Mention visual cues (e.g., "until golden brown")</li>
                </ul>
              </div>
            </motion.div>
          )}

          {/* Step 4: Details */}
          {currentStep === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Cooking Time and Servings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="cookingTime" className="block text-sm font-medium text-gray-700 mb-2">
                    Cooking Time (minutes)
                  </label>
                  <input
                    type="number"
                    id="cookingTime"
                    name="cookingTime"
                    value={formData.cookingTime || ''}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent touch-manipulation ${
                      errors.cookingTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="30"
                  />
                  {errors.cookingTime && <p className="mt-1 text-sm text-red-600">{errors.cookingTime}</p>}
                </div>

                <div>
                  <label htmlFor="servings" className="block text-sm font-medium text-gray-700 mb-2">
                    Servings
                  </label>
                  <input
                    type="number"
                    id="servings"
                    name="servings"
                    value={formData.servings || ''}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent touch-manipulation ${
                      errors.servings ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="4"
                  />
                  {errors.servings && <p className="mt-1 text-sm text-red-600">{errors.servings}</p>}
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipe Image <span className="text-gray-400 font-normal">(optional but recommended)</span>
                </label>
                <ImageUpload
                  value={recipe?.imageUrl}
                  onChange={handleImageChange}
                  onError={handleImageError}
                  maxSizeMB={5}
                />
                {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
              </div>
              
              {/* Summary */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <h3 className="font-medium text-gray-900 mb-4">Recipe Summary</h3>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-gray-500">Name</dt>
                    <dd className="font-medium text-gray-900 truncate">{formData.name || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Categories</dt>
                    <dd className="font-medium text-gray-900">
                      {formData.categoryIds?.length || 0} selected
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Ingredients</dt>
                    <dd className="font-medium text-gray-900">
                      {formData.ingredients.filter(i => i.trim()).length} items
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Has Instructions</dt>
                    <dd className="font-medium text-gray-900">
                      {formData.instructions.trim() ? '✓ Yes' : '✗ No'}
                    </dd>
                  </div>
                </dl>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Error */}
        {errors.submit && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg" role="alert" aria-live="assertive">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-8 border-t border-gray-200 mt-8">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={goToPreviousStep}
              className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors touch-manipulation min-h-[44px]"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          )}
          
          <div className="flex-1" />
          
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation min-h-[44px]"
          >
            Cancel
          </button>
          
          {currentStep < WIZARD_STEPS.length ? (
            <motion.button
              type="button"
              onClick={goToNextStep}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 active:bg-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors font-medium touch-manipulation min-h-[44px]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          ) : (
            <motion.button
              type="submit"
              disabled={isSubmitting}
              aria-label={recipe ? 'Update recipe' : 'Create recipe'}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 active:bg-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium touch-manipulation min-h-[44px]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  {recipe ? 'Update Recipe' : 'Create Recipe'}
                </>
              )}
            </motion.button>
          )}
        </div>
      </form>

      <CreateFolderModal
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        onSubmit={handleCreateFolder}
      />
      
      <BulkIngredientModal
        isOpen={isBulkIngredientModalOpen}
        onClose={() => setIsBulkIngredientModalOpen(false)}
        onImport={handleBulkIngredientImport}
      />
    </>
  );
};

export default RecipeForm;
