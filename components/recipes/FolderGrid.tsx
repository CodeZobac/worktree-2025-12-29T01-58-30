"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import Folder from './Folder';
import { RecipeFolder } from '@/types';

interface FolderGridProps {
  folders: RecipeFolder[];
  onFolderClick?: (folder: RecipeFolder) => void;
}

const FOLDER_COLORS = [
  '#5227FF', // Purple
  '#f97316', // Orange
  '#10b981', // Green
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#14b8a6', // Teal
];

const FolderGrid: React.FC<FolderGridProps> = ({ folders, onFolderClick }) => {
  const router = useRouter();

  const handleFolderClick = (folder: RecipeFolder) => {
    if (onFolderClick) {
      onFolderClick(folder);
    }
  };

  if (folders.length === 0) {
    return (
      <div className="text-center py-16">
        <svg
          className="mx-auto h-24 w-24 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No folders yet</h3>
        <p className="mt-2 text-sm text-gray-500">
          Create folders to organize recipes by category
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
      {folders.map((folder, index) => {
        const color = folder.color || FOLDER_COLORS[index % FOLDER_COLORS.length];
        
        return (
          <motion.div
            key={folder.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex flex-col items-center cursor-pointer group"
            onClick={() => handleFolderClick(folder)}
          >
            <div className="relative">
              <Folder 
                color={color} 
                size={1.2}
                items={[
                  <div key="1" className="w-full h-full" />,
                  <div key="2" className="w-full h-full" />,
                  <div key="3" className="w-full h-full" />
                ]}
              />
            </div>
            
            <div className="mt-4 text-center w-full px-2">
              <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-orange-600 transition-colors flex items-center justify-center gap-1">
                {folder.icon && <span className="text-base">{folder.icon}</span>}
                <span>{folder.name}</span>
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {folder.recipeCount || 0} {(folder.recipeCount || 0) === 1 ? 'recipe' : 'recipes'}
              </p>
              {folder.description && (
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                  {folder.description}
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default FolderGrid;
