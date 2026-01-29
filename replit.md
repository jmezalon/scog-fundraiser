# Salvation Church of God - Hoodie Fundraiser

## Overview

This is a church fundraiser web application for Salvation Church of God, allowing visitors to order custom hoodies to support the church's new location. The application features a product showcase with color/size selection, an order form, and order management through a REST API.

The stack uses React with TypeScript on the frontend, Express.js on the backend, and PostgreSQL with Drizzle ORM for data persistence. The UI is built with shadcn/ui components and Tailwind CSS with a custom gold and dark theme designed for the church branding.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and data fetching
- **Forms**: React Hook Form with Zod validation
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Animations**: Framer Motion for UI animations
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Framework**: Express.js 5 with TypeScript
- **API Design**: RESTful endpoints under `/api/*` prefix
- **Request Handling**: JSON body parsing with raw body preservation for webhooks
- **Static Serving**: Serves built frontend assets in production, Vite dev server in development

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` - shared between frontend and backend
- **Migrations**: Drizzle Kit for schema migrations (`npm run db:push`)
- **Current Storage**: In-memory storage class (`MemStorage`) as default implementation, designed to be swapped with database storage

### Shared Code Pattern
The `shared/` directory contains code used by both frontend and backend:
- Database schema definitions
- Zod validation schemas (generated from Drizzle schemas via drizzle-zod)
- TypeScript types for orders, users, and product options
- Constants like hoodie colors, sizes, and pricing

### Build System
- **Development**: `tsx` for running TypeScript directly
- **Production Build**: Custom build script using esbuild for server bundling and Vite for client bundling
- **Output**: Server bundle in `dist/index.cjs`, client assets in `dist/public/`

## External Dependencies

### Database
- **PostgreSQL**: Primary database, configured via `DATABASE_URL` environment variable
- **connect-pg-simple**: Session storage for Express sessions (available but not currently active)

### UI Libraries
- **Radix UI**: Full suite of accessible, unstyled UI primitives
- **Embla Carousel**: Carousel/slider functionality
- **cmdk**: Command menu component
- **Vaul**: Drawer component
- **Recharts**: Charting library (available for future analytics)

### Development Tools
- **Replit Plugins**: Runtime error overlay, cartographer, and dev banner for Replit environment
- **PostCSS/Autoprefixer**: CSS processing for Tailwind

### Fonts
- Google Fonts: DM Sans, Architects Daughter, Fira Code, Geist Mono (loaded via CDN in index.html)