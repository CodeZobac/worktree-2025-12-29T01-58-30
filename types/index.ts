// Application types based on database schema

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  familyId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Family {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface House {
  id: string;
  familyId: string;
  name: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeFolder {
  id: string;
  userId: string;
  familyId: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
  recipeCount?: number; // Populated via aggregation
}

export interface Recipe {
  id: string;
  userId: string;
  familyId: string;
  name: string;
  description?: string;
  ingredients: string[];
  instructions: string;
  cookingTime?: number;
  servings?: number;
  imageUrl?: string;
  folderId?: string;
  categoryIds?: string[]; // Array of category/folder IDs
  createdAt: Date;
  updatedAt: Date;
  user?: User; // Populated via join
  folder?: RecipeFolder; // Populated via join
}

export interface FamilyMember {
  id: string;
  name: string;
  image?: string;
  recipeCount: number;
  houseId?: string;
  houseName?: string;
}

export interface RecipeFormData {
  name: string;
  description?: string;
  ingredients: string[];
  instructions: string;
  cookingTime?: number;
  servings?: number;
  image?: File;
  folderId?: string;
  categoryIds: string[]; // Required - at least one category
}

export interface RecipeFolderFormData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface MealPlan {
  id: string;
  userId: string;
  familyId: string;
  recipeId: string;
  date: Date;
  mealType: 'LUNCH' | 'DINNER';
  createdAt: Date;
  updatedAt: Date;
  recipe?: Recipe; // Populated via join
}

export interface MealPlanFormData {
  recipeId: string;
  date: Date;
  mealType: 'LUNCH' | 'DINNER';
}
