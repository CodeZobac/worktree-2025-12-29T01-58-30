# Project Structure

## Directory Organization

### `/app` - Next.js App Router

- `(auth)/` - Authentication routes (route group, no layout impact)
  - `login/` - Login page
- `(main)/` - Main application routes (shared layout with navbar/sidebar)
  - `family/` - Family management pages
  - `recipes/` - Recipe browsing and management
  - `page.tsx` - Home/dashboard page
- `api/` - API routes and server endpoints
  - `auth/` - NextAuth API routes
  - `family/` - Family-related API endpoints
  - `folders/` - Folder management endpoints
  - `recipes/` - Recipe CRUD endpoints
- `layout.tsx` - Root layout with providers and fonts
- `globals.css` - Global styles and Tailwind directives

### `/components` - React Components

Organized by feature domain with barrel exports (`index.ts`):

- `auth/` - Authentication UI (sign in/out buttons)
- `error/` - Error boundaries and error states
- `family/` - Family member lists and setup prompts
- `layout/` - Navbar, Sidebar, main layout components
- `loading/` - Loading spinners, skeletons, overlays
- `markdown/` - Markdown editor and renderer
- `providers/` - React context providers (session)
- `recipes/` - Recipe cards, forms, folders, image upload
- `toast/` - Toast notification system
- Root-level: Reusable animated components (AnimatedList, BlurText, CountUp, Magnet)

### `/lib` - Utilities and Services

- `auth/` - NextAuth configuration and server actions
- `supabase/` - Supabase client, API helpers, and types
- `utils/` - Utility functions (caching, IDs, images, performance)
- `validations/` - Zod schemas for data validation
- `utils.ts` - Common utilities (cn for class merging)

### `/types` - TypeScript Definitions

- `next-auth.d.ts` - NextAuth type extensions
- `index.ts` - Shared type definitions

### `/public` - Static Assets

SVG icons and images served directly

### `/specs` - Feature Specifications

Structured feature documentation and implementation plans

## Architectural Patterns

### Route Groups

Use parentheses for route groups that don't affect URL structure:
- `(auth)` - Public authentication pages
- `(main)` - Protected app pages with shared layout

### Component Organization

- Feature-based folders with barrel exports
- Separate concerns: UI components, providers, loading states, errors
- Co-locate related components (e.g., all recipe components together)

### Data Flow

- Server Components by default
- Client Components marked with `"use client"`
- Server Actions in `lib/auth/actions.ts` and API routes
- Supabase client for database operations
- NextAuth middleware for route protection

### Styling Conventions

- Tailwind utility classes
- CSS variables for theming
- `cn()` utility for conditional class merging
- shadcn/ui component patterns

### Import Aliases

Use `@/` prefix for all imports:
```typescript
import { Component } from "@/components/feature"
import { helper } from "@/lib/utils"
```
