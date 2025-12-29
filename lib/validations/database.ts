import { z } from 'zod';
import { isCuid } from '@paralleldrive/cuid2';

/**
 * Zod schemas for type-safe database operations
 * These schemas validate data before insert/update operations
 * and ensure type safety throughout the application
 * 
 * Note: All IDs use CUID2 format instead of UUID
 */

// Custom CUID validator
const cuidSchema = z.string().refine((val) => isCuid(val), {
  message: 'Invalid CUID format',
});

// User schemas
export const userInsertSchema = z.object({
  id: cuidSchema, // CUID2 - required on insert
  email: z.string().email(),
  name: z.string().nullable().optional(),
  image: z.string().url().nullable().optional(),
  family_id: cuidSchema.nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const userUpdateSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().nullable().optional(),
  image: z.string().url().nullable().optional(),
  family_id: cuidSchema.nullable().optional(),
  updated_at: z.string().datetime().optional(),
});

export const userSelectSchema = z.object({
  id: cuidSchema,
  email: z.string().email(),
  name: z.string().nullable(),
  image: z.string().nullable(),
  family_id: cuidSchema.nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Family schemas
export const familyInsertSchema = z.object({
  id: cuidSchema, // CUID2 - required on insert
  name: z.string().min(1).max(255),
  created_by: cuidSchema.nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const familyUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  created_by: cuidSchema.nullable().optional(),
  updated_at: z.string().datetime().optional(),
});

export const familySelectSchema = z.object({
  id: cuidSchema,
  name: z.string(),
  created_by: cuidSchema.nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Recipe schemas
export const recipeInsertSchema = z.object({
  id: cuidSchema, // CUID2 - required on insert
  user_id: cuidSchema,
  family_id: cuidSchema,
  name: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  ingredients: z.array(z.string()).min(1),
  instructions: z.string().min(1),
  cooking_time: z.number().int().positive().nullable().optional(),
  servings: z.number().int().positive().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  folder_id: cuidSchema.nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const recipeUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  ingredients: z.array(z.string()).min(1).optional(),
  instructions: z.string().min(1).optional(),
  cooking_time: z.number().int().positive().nullable().optional(),
  servings: z.number().int().positive().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  folder_id: cuidSchema.nullable().optional(),
  updated_at: z.string().datetime().optional(),
});

export const recipeSelectSchema = z.object({
  id: cuidSchema,
  user_id: cuidSchema,
  family_id: cuidSchema,
  name: z.string(),
  description: z.string().nullable(),
  ingredients: z.array(z.string()),
  instructions: z.string(),
  cooking_time: z.number().nullable(),
  servings: z.number().nullable(),
  image_url: z.string().nullable(),
  folder_id: cuidSchema.nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Infer TypeScript types from schemas
export type UserInsert = z.infer<typeof userInsertSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
export type UserSelect = z.infer<typeof userSelectSchema>;

export type FamilyInsert = z.infer<typeof familyInsertSchema>;
export type FamilyUpdate = z.infer<typeof familyUpdateSchema>;
export type FamilySelect = z.infer<typeof familySelectSchema>;

export type RecipeInsert = z.infer<typeof recipeInsertSchema>;
export type RecipeUpdate = z.infer<typeof recipeUpdateSchema>;
export type RecipeSelect = z.infer<typeof recipeSelectSchema>;

/**
 * Helper function to safely parse and validate data
 * Returns validated data or throws a descriptive error
 */
export function validateData<T>(
  schema: z.ZodType<T>,
  data: unknown,
  errorContext?: string
): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errorMessage = result.error.issues
      .map((err) => `${err.path.join('.')}: ${err.message}`)
      .join(', ');
    
    throw new Error(
      `Validation error${errorContext ? ` in ${errorContext}` : ''}: ${errorMessage}`
    );
  }
  
  return result.data;
}

/**
 * Helper function to safely parse and validate data with error handling
 * Returns an object with either data or error
 */
export function safeValidateData<T>(
  schema: z.ZodType<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errorMessage = result.error.issues
      .map((err) => `${err.path.join('.')}: ${err.message}`)
      .join(', ');
    
    return { success: false, error: errorMessage };
  }
  
  return { success: true, data: result.data };
}
