# Recipe Components Documentation

This folder contains all the recipe-related components for the Family Recipes application.

## Components Overview

### 1. RecipeCard.tsx
The original grid-style recipe card component with an image, title, description, and metadata.

**Features:**
- Image display with fallback gradient
- Recipe name and description
- User attribution
- Cooking time display
- Responsive design
- Hover animations

**Usage:**
```tsx
import RecipeCard from '@/components/recipes/RecipeCard';

<RecipeCard recipe={recipe} />
```

---

### 2. RecipeFileCard.tsx ✨ NEW
A file-like card component that displays recipes as documents/files, similar to a file manager.

**Features:**
- File icon with recipe badge
- Dynamic file size calculation based on content
- Creation date display
- Quick stats (cooking time, servings, creator)
- Folder indicator if recipe is in a folder
- Compact layout for list views

**Usage:**
```tsx
import RecipeFileCard from '@/components/recipes/RecipeFileCard';

<RecipeFileCard recipe={recipe} />
```

---

### 3. RecipeMarkdownViewer.tsx ✨ NEW
A dynamic markdown-style viewer that displays recipe content in a readable, scrollable format with a floating table of contents.

**Features:**
- Automatically generates sections from recipe data:
  - Overview (from description)
  - Quick Info (cooking time, servings, creator)
  - Ingredients (numbered list)
  - Instructions (step-by-step)
  - Category (folder information)
- Floating navigation widget with:
  - Scroll progress indicator
  - Expandable table of contents
  - Click-to-scroll navigation
  - Flash animation on section navigation
- Responsive design
- No hardcoded content - fully dynamic based on recipe data

**Usage:**
```tsx
import { RecipeMarkdownViewer } from '@/components/recipes/RecipeMarkdownViewer';

<RecipeMarkdownViewer recipe={recipe} />
```

---

### 4. RecipeList.tsx (Enhanced)
Updated to support both grid and file view modes with a toggle button.

**Features:**
- Grid view (original RecipeCard)
- File view (new RecipeFileCard)
- View mode toggle button
- Animated transitions
- Empty state handling

**Usage:**
```tsx
import RecipeList from '@/components/recipes/RecipeList';

<RecipeList 
  recipes={recipes} 
  emptyMessage="No recipes found" 
  defaultView="grid" // or "file"
/>
```

---

### 5. RecipeDetail.tsx
The detailed recipe view with full information display.

**Features:**
- Large image display
- Animated title with BlurText
- Meta information (creator, time, servings)
- Description
- Edit/Delete buttons for owners
- Ingredients list with animated entrance
- Instructions display
- Creation/update timestamps

**Usage:**
```tsx
import RecipeDetail from '@/components/recipes/RecipeDetail';

<RecipeDetail 
  recipe={recipe}
  isOwner={isOwner}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

---

## Recipe Detail Page Integration

The recipe detail page (`/app/(main)/recipes/[id]/page.tsx`) now includes:

### View Mode Toggle
Switch between two viewing modes:
- **Card View**: Traditional detailed card layout (RecipeDetail)
- **Reader View**: Markdown-style reading experience (RecipeMarkdownViewer)

**Toggle Button Location:**
Fixed position in the top-right corner with icons:
- 📊 Grid icon for Card view
- 📄 File icon for Reader view

---

## Implementation Guide

### Adding File Cards to Your Recipe List

1. **Grid View (Default)**
```tsx
<RecipeList recipes={recipes} defaultView="grid" />
```

2. **File View**
```tsx
<RecipeList recipes={recipes} defaultView="file" />
```

3. **Users can toggle between views** using the built-in toggle buttons.

### Adding Markdown Viewer to Recipe Details

The markdown viewer is already integrated into the recipe detail page. Users can toggle between:
- Traditional card view with edit/delete buttons
- Markdown reading view with table of contents

### Customizing the Markdown Viewer

The `RecipeMarkdownViewer` automatically generates sections from your recipe data. To customize sections, you can:

1. **Modify section generation** in `RecipeMarkdownViewer.tsx`:
```tsx
const sections: Section[] = React.useMemo(() => {
  // Add your custom sections here
  return customSections;
}, [recipe]);
```

2. **Add new recipe fields** to include more content in the viewer.

---

## Component Dependencies

All components require:
- `motion` (framer-motion alternative) for animations
- `lucide-react` for icons
- Next.js routing hooks
- Recipe types from `@/types`

---

## Styling

All components use:
- Tailwind CSS for styling
- CSS-in-JS for animations (flash effect)
- Responsive breakpoints (sm, md, lg)
- Consistent color scheme with orange accents

---

## Accessibility

All components include:
- Proper ARIA labels
- Keyboard navigation support
- Focus states
- Screen reader friendly markup
- Touch-friendly tap targets (min 44px)

---

## Performance Considerations

- **RecipeFileCard**: Calculates file size client-side (minimal overhead)
- **RecipeMarkdownViewer**: Uses React.useMemo for section generation
- **Image optimization**: Next.js Image component with lazy loading
- **Animations**: Hardware-accelerated transforms
- **Scroll tracking**: Debounced scroll events

---

## Browser Support

Tested and working on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

---

## Future Enhancements

Potential improvements:
1. Markdown syntax support in recipe instructions
2. Printable recipe format
3. Export to PDF
4. Share recipe as markdown file
5. Custom color themes for different folders
6. Recipe difficulty indicators in file cards
7. Tags/categories filtering

---

## Troubleshooting

### File cards not showing folder colors
Make sure the recipe object includes the populated `folder` field with `color` property.

### Markdown viewer showing empty sections
Ensure your recipe has at least one of: description, ingredients, or instructions.

### Scroll progress not updating
Check that the container ref is properly attached and scroll events are firing.

---

For more information, see the main project README or contact the development team.
