# Family Recipes

A modern web application for sharing and discovering family recipes. Keep your family's culinary traditions alive by creating, organizing, and browsing recipes within your family group.

## Features

- **Family Groups** - Create or join a family group to share recipes with your loved ones
- **Recipe Management** - Create, edit, and organize recipes with folders
- **Rich Markdown Support** - Write recipe instructions with full markdown formatting
- **Image Upload** - Add beautiful photos to your recipes with automatic optimization
- **3D Recipe Cards** - Browse recipes with animated, interactive card displays
- **Google Authentication** - Secure sign-in with your Google account

## Tech Stack

- **Framework**: Next.js 15 with App Router and React Server Components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth v5 with Google OAuth
- **UI**: Tailwind CSS 4, shadcn/ui components, Motion animations
- **Language**: TypeScript 5 (strict mode)

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables (copy `.env.example` to `.env.local` and fill in your values)

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## Project Structure

- `/app` - Next.js App Router pages and API routes
- `/components` - React components organized by feature
- `/lib` - Utilities, services, and business logic
- `/types` - TypeScript type definitions
- `/public` - Static assets

## Contributing

This is a family project, but suggestions and improvements are welcome!
