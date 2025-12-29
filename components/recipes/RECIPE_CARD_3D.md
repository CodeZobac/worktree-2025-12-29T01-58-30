# Recipe Card 3D Component

## Overview

This is the **single, unified recipe card component** for the Family Recipes application. It uses a 3D tilted card effect based on the React Bits TiltedCard component, designed to resemble an A4 file with a modern, interactive experience.

---

## Component: RecipeCard3D

### Features

✨ **3D Perspective Tilt Effect**
- Card rotates based on mouse position
- Smooth spring animations
- Subtle depth perception

📄 **A4-Like Design**
- Portrait aspect ratio (210:297)
- Professional file-like appearance
- Clean, minimal design

🎨 **Three Key Elements**
1. **Recipe Title** - Top-left corner, bold white text with drop shadow
2. **Recipe Image** - Full card background with gradient overlays
3. **Preparation Time** - Bottom-right corner in a pill badge

🖼️ **Image Handling**
- Full-card background image
- Next.js Image optimization
- Placeholder gradient for recipes without images
- Lazy loading for performance

✨ **Interactive Elements**
- Hover scale animation (1.05x)
- 3D tilt on mouse movement
- Orange border highlight on hover/focus
- Smooth spring physics

♿ **Accessibility**
- Keyboard navigation support
- ARIA labels
- Focus states
- Semantic HTML

---

## Usage

### Basic Usage

```tsx
import RecipeCard3D from '@/components/recipes/RecipeCard3D';

<RecipeCard3D recipe={recipe} />
```

### With Custom Settings

```tsx
<RecipeCard3D 
  recipe={recipe}
  scaleOnHover={1.08}
  rotateAmplitude={10}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `recipe` | `Recipe` | Required | Recipe object with all data |
| `scaleOnHover` | `number` | `1.05` | Scale multiplier on hover |
| `rotateAmplitude` | `number` | `8` | Degrees of rotation range |

---

## Design Specifications

### Layout

```
┌─────────────────────────────────┐
│ Recipe Title                    │  ← Top-left
│                                 │
│                                 │
│       [Recipe Image]            │  ← Full background
│                                 │
│                                 │
│                    [⏱️ 30 min]  │  ← Bottom-right
└─────────────────────────────────┘
```

### Aspect Ratio
- **A4 Portrait**: 210:297 (1:1.414)
- Maintains ratio across all screen sizes
- Responsive height based on container width

### Text Overlays
- **Top**: Black gradient overlay (60% opacity)
- **Bottom**: Black gradient overlay (60% opacity)
- **Middle**: Transparent for image visibility

### Title Styling
- Font: Bold, responsive (xl → 2xl → 3xl)
- Color: White with drop shadow
- Max lines: 2 (line-clamp)
- Z-depth: translateZ(20px)

### Time Badge
- Background: White 90% opacity with backdrop blur
- Border radius: Full (pill shape)
- Icon: Clock from lucide-react
- Color: Orange-600
- Z-depth: translateZ(20px)

---

## Grid Layout

The RecipeList component displays cards in a responsive grid:

```tsx
// Mobile (< 640px)     : 1 column
// Tablet (640-1024px)  : 2 columns
// Desktop (1024-1280px): 3 columns
// Large (> 1280px)     : 4 columns
```

Grid classes:
```css
grid-cols-1 
sm:grid-cols-2 
lg:grid-cols-3 
xl:grid-cols-4
```

Gap spacing: `gap-6 md:gap-8`

---

## Animation Details

### Spring Physics

```tsx
damping: 30
stiffness: 100
mass: 2
```

### Rotation Behavior
- Mouse position calculates offset from center
- Offset maps to rotation angle (-8° to +8°)
- X-axis rotation: up/down mouse movement
- Y-axis rotation: left/right mouse movement

### Scale Transition
- Idle: scale(1)
- Hover: scale(1.05)
- Smooth spring interpolation

### Transform Origin
- Center of card
- Maintains 3D perspective

---

## Code Structure

```tsx
RecipeCard3D
├── Container (div)
│   ├── Event handlers (mouse move/enter/leave)
│   ├── Perspective container
│   └── Motion wrapper
│       ├── Image layer (background)
│       │   ├── Next.js Image OR gradient placeholder
│       │   └── Gradient overlays
│       ├── Title (top-left, translateZ(20px))
│       └── Time badge (bottom-right, translateZ(20px))
```

---

## Performance Optimizations

✅ **Image Optimization**
- Next.js Image component
- Lazy loading
- Blur placeholder
- Responsive sizes

✅ **Animation Performance**
- Hardware-accelerated transforms
- `will-change-transform` hint
- `transform: translateZ(0)` for layer promotion

✅ **Memory Management**
- useRef for DOM reference
- useSpring for smooth animations
- Cleanup on unmount

---

## Browser Compatibility

### Desktop
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)

### Mobile
- ✅ iOS Safari
- ✅ Chrome Android
- ⚠️ 3D effects are subtle on mobile (optimized for desktop)

---

## Customization

### Change Aspect Ratio

```tsx
// In RecipeCard3D.tsx, modify:
style={{
  aspectRatio: '210 / 297' // Change to desired ratio
}}
```

### Adjust Tilt Sensitivity

```tsx
<RecipeCard3D 
  recipe={recipe}
  rotateAmplitude={12} // Higher = more tilt
/>
```

### Modify Hover Scale

```tsx
<RecipeCard3D 
  recipe={recipe}
  scaleOnHover={1.1} // Higher = more zoom
/>
```

### Change Colors

Edit the badge background:
```tsx
className="bg-white/90 backdrop-blur-sm" // Change opacity/color
```

Edit the border highlight:
```tsx
className="border-orange-500" // Change to any color
```

---

## Accessibility Features

✅ **Keyboard Navigation**
- Tab to focus card
- Enter/Space to navigate

✅ **Screen Readers**
- Proper ARIA labels
- Descriptive alt text
- Semantic HTML

✅ **Focus Management**
- Visible focus states
- Orange border on focus
- High contrast

✅ **Touch Targets**
- Full card is clickable
- Adequate size on mobile

---

## Dependencies

```json
{
  "motion": "^12.23.24",      // For animations
  "next": "^15.5.6",          // For Image component
  "lucide-react": "^0.546.0"  // For Clock icon
}
```

All dependencies are already installed in your project.

---

## File Locations

```
components/recipes/
├── RecipeCard3D.tsx        ← Main card component
├── RecipeList.tsx          ← Grid layout
└── index.ts                ← Exports
```

---

## Migration from Old Cards

### What Changed
- ❌ Removed: RecipeCard (old grid card)
- ❌ Removed: RecipeFileCard (file-style card)
- ❌ Removed: RecipeMarkdownViewer (markdown reader)
- ✅ Added: RecipeCard3D (single unified card)

### No Breaking Changes
- Same Recipe type interface
- Same navigation behavior
- Same accessibility features
- Just better visual design!

---

## Example Recipe Object

```tsx
const recipe: Recipe = {
  id: "abc123",
  name: "Homemade Pasta",
  imageUrl: "https://example.com/pasta.jpg",
  cookingTime: 30,
  // ... other fields
}
```

---

## Future Enhancements

Potential improvements:
1. Add recipe difficulty indicator
2. Add servings count display
3. Add favorite/bookmark icon
4. Add category badge
5. Add user avatar
6. Add hover preview overlay
7. Add animation on card entry
8. Add optional video background

---

## Troubleshooting

### Card not tilting
- Ensure `motion` package is installed
- Check browser supports 3D transforms
- Verify mouse events are firing

### Image not showing
- Check `imageUrl` is valid
- Verify Next.js Image domains are configured
- Check network requests

### Performance issues
- Reduce `rotateAmplitude` value
- Lower `scaleOnHover` value
- Check for too many cards rendering

### Layout issues
- Verify grid classes are correct
- Check container width/height
- Ensure aspect ratio is set

---

## Support

For issues or questions:
1. Check this documentation
2. Review component code comments
3. Test with sample recipe data
4. Verify all dependencies are installed

---

**Component Status:** ✅ Production Ready  
**Last Updated:** October 29, 2025  
**Version:** 1.0.0

Enjoy your modern 3D recipe cards! 🎴✨
