"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FormLoadingOverlay } from '@/components/loading';
import ImageUpload from './ImageUpload';
import CreateFolderModal from './CreateFolderModal';
import { TrixEditor, useTrixAttachment, type TrixEditorRef } from '@/react-trix';
import { Recipe, RecipeFormData, RecipeFolder, RecipeFolderFormData } from '@/types';
import { Check, Plus, X } from 'lucide-react';

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
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-5 sm:space-y-6 relative" aria-label={recipe ? 'Edit recipe form' : 'Create recipe form'}>
        {isSubmitting && <FormLoadingOverlay message={recipe ? 'Updating recipe...' : 'Creating recipe...'} />}
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
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent touch-manipulation ${errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="Enter recipe name"
          />
          {errors.name && <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">{errors.name}</p>}
        </div>

        {/* Categories Selection - Multi-select */}
        <div>
          <div className="flex justify-between items-center mb-2">
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
              {/* Category chips */}
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
              
              {/* Selected categories summary */}
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

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <TrixEditor
            ref={descriptionEditorRef}
            initialValue={formData.description || ''}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, description: value }))}
            placeholder="Brief description of the recipe"
            aria-label="Recipe description"
            className="min-h-[120px]"
          />
        </div>

        {/* Ingredients */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" id="ingredients-label">
            Ingredients *
          </label>
          <div className="space-y-2" role="group" aria-labelledby="ingredients-label">
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={ingredient}
                  onChange={(e) => handleIngredientChange(index, e.target.value)}
                  aria-label={`Ingredient ${index + 1}`}
                  aria-required="true"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent touch-manipulation"
                  placeholder={`Ingredient ${index + 1}`}
                />
                {formData.ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="px-3 py-3 text-red-600 hover:bg-red-50 active:bg-red-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors touch-manipulation min-w-[44px]"
                    aria-label={`Remove ingredient ${index + 1}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addIngredient}
            aria-label="Add another ingredient"
            className="mt-2 text-sm text-orange-600 hover:text-orange-700 active:text-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded font-medium touch-manipulation py-2 px-2"
          >
            + Add Ingredient
          </button>
          {errors.ingredients && <p className="mt-1 text-sm text-red-600" role="alert">{errors.ingredients}</p>}
        </div>

        {/* Instructions */}
        <div>
          <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
            Instructions *
          </label>
          <TrixEditor
            ref={instructionsEditorRef}
            initialValue={formData.instructions}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, instructions: value }))}
            placeholder="Step-by-step instructions"
            aria-required={true}
            aria-invalid={!!errors.instructions}
            aria-describedby={errors.instructions ? 'instructions-error' : undefined}
            className={`min-h-[300px] ${errors.instructions ? 'border-red-500' : ''}`}
          />
          {errors.instructions && <p id="instructions-error" className="mt-1 text-sm text-red-600" role="alert">{errors.instructions}</p>}
        </div>

        {/* Cooking Time and Servings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
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
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent touch-manipulation ${errors.cookingTime ? 'border-red-500' : 'border-gray-300'
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
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent touch-manipulation ${errors.servings ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="4"
            />
            {errors.servings && <p className="mt-1 text-sm text-red-600">{errors.servings}</p>}
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipe Image
          </label>
          <ImageUpload
            value={recipe?.imageUrl}
            onChange={handleImageChange}
            onError={handleImageError}
            maxSizeMB={5}
          />
          {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg" role="alert" aria-live="assertive">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
          <motion.button
            type="submit"
            disabled={isSubmitting}
            aria-label={recipe ? 'Update recipe' : 'Create recipe'}
            className="w-full sm:flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 active:bg-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium touch-manipulation min-h-[44px]"
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </span>
            ) : (
              recipe ? 'Update Recipe' : 'Create Recipe'
            )}
          </motion.button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            aria-label="Cancel and go back"
            className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation min-h-[44px]"
          >
            Cancel
          </button>
        </div>
      </form>

      <CreateFolderModal
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        onSubmit={handleCreateFolder}
      />
    </>
  );
};

export default RecipeForm;
