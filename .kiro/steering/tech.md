# Tech Stack

## Framework & Runtime

- Next.js 15 (App Router with React Server Components)
- React 19
- TypeScript 5 (strict mode enabled)
- Node.js (ES2017 target)

## UI & Styling

- Tailwind CSS 4 with CSS variables
- shadcn/ui components (New York style)
- Lucide React icons
- Motion (Framer Motion) for animations
- Custom animated components (BlurText, CountUp, AnimatedList, Magnet)

## Backend & Database

- Supabase (PostgreSQL database, storage, and API)
- NextAuth v5 (beta) for authentication
- Google OAuth provider
- Server Actions for mutations

## Key Libraries

- `zod` for validation schemas
- `react-markdown` with `remark-gfm` for markdown rendering
- `rehype-raw` and `rehype-sanitize` for safe HTML in markdown
- `browser-image-compression` for client-side image optimization
- `@paralleldrive/cuid2` for ID generation
- `class-variance-authority` and `clsx` for conditional styling
- `tailwind-merge` for merging Tailwind classes
- `sonner` for toast notifications

## Build Tools

- Babel React Compiler (experimental)
- ESLint 9 with Next.js config
- PostCSS with Tailwind

## Common Commands

```bash
# Development
npm run dev          # Start dev server on localhost:3000

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## Configuration Notes

- Path alias `@/*` maps to project root
- Image optimization configured for Google user avatars and Supabase storage
- React Compiler enabled for performance optimization
- Compression and production optimizations enabled
