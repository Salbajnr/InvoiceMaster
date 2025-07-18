# Invoice Management System

## Overview

This is a comprehensive full-stack invoice management application built with React, Express.js, and PostgreSQL. The application allows users to create, manage, and track invoices with support for 10 different invoice types (proforma, standard, commercial, etc.). It features a modern UI built with shadcn/ui components, professional letterhead design capabilities, and a standalone transaction simulation system for testing various payment scenarios. The app uses Drizzle ORM for database operations and includes advanced styling features like logos, stamps, and animations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **API Style**: RESTful API with JSON responses
- **Session Management**: Express sessions with PostgreSQL store

### Development Setup
- **Monorepo Structure**: Shared schema and types between client and server
- **Hot Reloading**: Vite HMR for frontend, tsx for backend development
- **Type Safety**: Full TypeScript coverage across the stack

## Key Components

### Database Schema (shared/schema.ts)
- **Clients Table**: Stores customer information (name, email, address, phone, tax ID)
- **Invoices Table**: Main invoice data with support for different types and statuses
- **Line Items Table**: Individual items/services within invoices
- **Type-specific Data**: JSON field for storing invoice type-specific information

### Transaction System (client/src/lib/transaction-types.ts)
- **Payment Methods**: Support for 10+ payment types (bank transfer, credit/debit cards, Bitcoin, Ethereum, PayPal, Stripe, etc.)
- **Transaction Statuses**: 9 different status types (pending, processing, completed, failed, declined, on hold, cancelled, refunded, partial refund)
- **Mock Transaction Generator**: Creates realistic transaction data with processing fees, reference IDs, and gateway responses
- **Failure Scenarios**: Common failure reasons and suggested solutions for testing error handling
- **Status Visualization**: Color-coded badges and icons for different transaction states

### API Endpoints (server/routes.ts)
- **GET /api/clients**: Retrieve all clients
- **POST /api/clients**: Create new client
- **GET /api/invoices**: Retrieve all invoices with details
- **GET /api/invoices/:id**: Retrieve specific invoice
- **POST /api/invoices**: Create new invoice
- **PUT /api/invoices/:id**: Update existing invoice
- **DELETE /api/invoices/:id**: Delete invoice

### Storage Layer (server/storage.ts)
- **Interface-based Design**: IStorage interface for different storage implementations
- **Memory Storage**: In-memory storage for development/testing
- **Database Storage**: PostgreSQL implementation (to be added)
- **Auto-generated Invoice Numbers**: Sequential invoice numbering system

### Invoice Types System (client/src/lib/invoice-types.ts)
- **Multiple Invoice Types**: Support for proforma, standard, commercial, credit, debit, recurring, timesheet, interim, final, and past due invoices
- **Type-specific Fields**: Each invoice type has specific required and optional fields
- **Flexible Configuration**: Easy to add new invoice types and customize fields

### UI Components
- **InvoiceForm**: Main form for creating/editing invoices with dynamic fields based on type
- **LineItemForm**: Dynamic form for adding/removing line items
- **InvoicePreview**: Real-time preview of invoice calculations
- **RecentInvoices**: Dashboard widget showing recent invoices with status badges
- **TransactionManager**: Standalone transaction simulator for testing payment scenarios
- **LetterheadDesigner**: Professional letterhead creation with logo/stamp upload capabilities
- **Header**: Navigation component with routing between Invoice Editor and Transaction Center

## Data Flow

1. **Client Request**: User interacts with React components
2. **Form Validation**: React Hook Form validates input using Zod schemas
3. **API Call**: TanStack Query sends request to Express backend
4. **Request Processing**: Express routes handle business logic
5. **Database Operation**: Storage layer performs CRUD operations
6. **Response**: JSON data returned to client
7. **UI Update**: React components re-render with new data

## External Dependencies

### Frontend Dependencies
- **UI Framework**: React with comprehensive Radix UI component set
- **Form Management**: React Hook Form with Zod for validation
- **HTTP Client**: Fetch API with TanStack Query for caching
- **PDF Generation**: Custom PDF generation utility
- **Date Handling**: date-fns for date manipulation
- **Routing**: Wouter for lightweight routing

### Backend Dependencies
- **Web Framework**: Express.js with TypeScript support
- **Database**: Drizzle ORM with PostgreSQL dialect
- **Session Management**: connect-pg-simple for PostgreSQL session store
- **Environment**: tsx for TypeScript execution in development

### Development Dependencies
- **Build Tools**: Vite for frontend, esbuild for backend
- **CSS Framework**: Tailwind CSS with PostCSS processing
- **Type Checking**: TypeScript compiler with strict mode
- **Database Migrations**: Drizzle Kit for schema management

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx with auto-restart on file changes
- **Database**: Local PostgreSQL or Neon development database
- **Environment**: All services run locally with hot reloading

### Production
- **Frontend**: Static files built with Vite and served by Express
- **Backend**: Compiled JavaScript bundle running on Node.js
- **Database**: Neon serverless PostgreSQL in production
- **Environment**: Single server deployment with static file serving

### Build Process
1. **Frontend Build**: Vite compiles React app to static files
2. **Backend Build**: esbuild bundles server code with external dependencies
3. **Database Setup**: Drizzle migrations applied to production database
4. **Asset Serving**: Express serves both API and static frontend files

The architecture emphasizes type safety, developer experience, and scalability while maintaining simplicity in deployment and maintenance.