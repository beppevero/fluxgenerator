# Flux | Smart Quote

## Overview
A fleet quote generator application (Flux Smart Quote) for digital transformation in fleet management. Built with React, Vite, TypeScript, Tailwind CSS, and Shadcn UI components. Originally created in Lovable, now migrated to Replit.

## Recent Changes
- 2026-02-20: Migrated from Lovable to Replit environment
  - Updated Vite config to serve on port 5000 with allowedHosts enabled
  - Removed lovable-tagger plugin reference
  - Configured static deployment

## Project Architecture
- **Frontend only** (no backend server)
- **Framework**: React 18 + TypeScript + Vite 5
- **Styling**: Tailwind CSS 3 + Shadcn UI components
- **Routing**: react-router-dom v6
- **State/Forms**: react-hook-form + zod validation
- **Data Fetching**: @tanstack/react-query
- **PDF Export**: html2pdf.js

## Project Structure
```
src/
  App.tsx              - Main app component
  main.tsx             - Entry point
  index.css            - Global styles / Tailwind
  assets/              - Logos and certification images
  components/
    NavLink.tsx        - Navigation link component
    quote/             - Quote-related form components
      ClientDataForm.tsx
      PaymentForm.tsx
      QuotePreview.tsx
      ServicesForm.tsx
      TotalsSummary.tsx
    ui/                - Shadcn UI primitives
  data/
    defaults.ts        - Default values
    services.ts        - Services data
  hooks/               - Custom hooks
  lib/utils.ts         - Utility functions
  pages/
    Index.tsx          - Main page
    NotFound.tsx       - 404 page
  types/quote.ts       - TypeScript types for quotes
```

## User Preferences
- Language: Italian (app UI is in Italian)

## Running the Project
- `npm run dev` starts the Vite dev server on port 5000
- `npm run build` creates production build in `dist/`
