# Salvation Church of God - Hoodie Fundraiser

## Overview
A professional web application for Salvation Church of God to sell hoodies as a fundraiser for their new church location under construction. The page is designed to be embedded in the church app.

## Current State
- **Fully functional** hoodie ordering system
- Beautiful gold/dark themed UI matching church branding
- Order form with validation
- In-memory order storage (ready for Stripe integration later)

## Features
- Product showcase with image gallery (3 hoodie colors with photos)
- 6 color options: Black, Red, Navy Blue, Dark Grey, Sapphire Blue, Purple
- 7 size options: Youth Medium through XXXL
- Quantity selector (1-10)
- Contact information form with validation
- Order confirmation page
- Responsive design for mobile and desktop

## Technical Architecture

### Frontend (React + Vite)
- **Main Page**: `client/src/pages/home.tsx`
- **Styling**: Gold/dark theme in `client/src/index.css` with Tailwind
- Uses Framer Motion for animations
- Form handling with React Hook Form + Zod validation

### Backend (Express)
- **Routes**: `server/routes.ts`
- **Storage**: `server/storage.ts` (in-memory)
- **Schema**: `shared/schema.ts`

### API Endpoints
- `POST /api/orders` - Create new order
- `GET /api/orders` - List all orders
- `GET /api/orders/:id` - Get specific order

## Hoodie Details
- **Price**: $65 per hoodie
- **Colors**: Black, Red, Navy Blue, Dark Grey, Sapphire Blue, Purple
- **Sizes**: Youth Medium, Youth Large, Medium, Large, XL, XXL, XXXL

## Future Enhancements
- Stripe payment integration (planned)
- Database persistence (PostgreSQL)
- Admin dashboard for order management
- Email notifications

## Running the Project
```bash
npm run dev
```
The app runs on port 5000.
