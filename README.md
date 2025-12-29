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

### Local Development

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

### Production Deployment

Deploy to your own VM with automated Terraform setup:

```bash
# Quick start
cp terraform/terraform.tfvars.example terraform/terraform.tfvars
# Edit terraform.tfvars with your configuration
make init
make deploy
```

See [QUICK-START.md](QUICK-START.md) for a quick deployment guide or [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive documentation.

**Deployment Features:**
- 🚀 One-command deployment with `make deploy`
- 🔒 Automatic SSL certificate management with Let's Encrypt
- 🐳 Docker containerization with multi-stage builds
- 🌐 Nginx reverse proxy with security headers
- ⚡ Zero-downtime updates

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
- `/terraform` - Infrastructure as Code (Terraform)
- `/deploy` - Deployment configurations (Docker, Nginx)

## Deployment

This project includes a complete automated deployment solution:

- **Terraform** for infrastructure provisioning
- **Docker & Docker Compose** for containerization
- **Nginx** as reverse proxy with SSL
- **Certbot** for automatic SSL certificate management
- **Makefile** for simple deployment commands

Quick deployment: `make deploy`

Documentation: [DEPLOYMENT.md](DEPLOYMENT.md) | [QUICK-START.md](QUICK-START.md)

## Contributing

This is a family project, but suggestions and improvements are welcome!
