# LabTrack

Full-stack laboratory operations management platform for inventory, lot tracking, equipment, maintenance, and QR-based item access.

## Overview

LabTrack is a full-stack web application designed to help laboratory teams manage critical operational workflows in a single, secure platform. It brings together inventory visibility, stock movement tracking, batch and expiry monitoring, equipment status management, and preventive maintenance scheduling into one streamlined system.

The application is built for real-world laboratory operations, with authenticated access, database-level controls, and operational workflows that support daily stock and maintenance decision-making.

## Key Features

### Inventory Management

- product and material tracking
- current stock and minimum stock visibility
- low-stock and critical-stock alerts
- stock IN / OUT transaction operations
- recent movement history
- storage location tracking

### Lot & Expiry Management

- lot / batch tracking for materials and consumables
- expiration date monitoring
- active, expiring, and expired batch visibility
- controlled tracking of inventory items with expiry-sensitive usage

### Equipment Management

- equipment catalog and status tracking
- equipment detail pages
- operational location and metadata tracking
- service readiness monitoring

### Maintenance Management

- maintenance records
- maintenance scheduling
- maintenance history tracking
- upcoming service visibility

### QR Code Workflow

- dynamic QR code generation for each inventory item
- QR code download support
- QR links directly to the corresponding inventory detail page at `/inventory/[id]`
- mobile-friendly QR access for field or on-floor usage
- production-ready URL generation using the active application origin

### Security & Authentication

- authenticated access to protected routes
- protected server-side actions
- Supabase Auth integration
- Row Level Security enforced by the database layer
- secure environment variable management for local and deployment environments

## Tech Stack

This project uses the following technologies and platforms:

- Next.js 16
- React
- TypeScript
- Tailwind CSS
- Supabase
- PostgreSQL
- Supabase Auth
- Row Level Security (RLS)
- Next.js Server Actions
- qrcode package
- Vercel deployment

## Architecture

LabTrack follows a reliable application flow designed for operational workflows and secure data access:

```text
User / Mobile QR Scan
        ↓
Next.js UI
        ↓
Server Actions
        ↓
Supabase Auth + RLS
        ↓
PostgreSQL
```

The application is structured around core operational modules:

- Inventory: products, stock quantities, minimum thresholds, and critical stock visibility
- Stock Movements: IN and OUT tracking with historical movement records
- Lots and Expiry: lot-level tracking with expiry dates for controlled materials
- Equipment: device catalog, status, location, and service metadata
- Maintenance: maintenance history and upcoming service scheduling

QR code generation is handled in the application layer and links to the specific item detail route, enabling quick access from mobile devices and production deployments.

## Database

The core database tables used by the platform are:

- `inventory_items` — stores product definitions, stock levels, minimum thresholds, and storage metadata
- `inventory_batches` — stores lot-level records, quantities, received dates, and expiry dates for tracked inventory
- `stock_movements` — records stock inflow and outflow operations with metadata and timestamps
- `equipment` — stores laboratory devices, operational status, maintenance schedule data, and location details
- `maintenance_records` — tracks maintenance actions, dates, descriptions, costs, and next service planning

## Security

The application follows a secure, authenticated pattern for operational workflows:

- Supabase authentication for user sign-in and session handling
- server-side session validation before protected actions run
- Row Level Security enforced by the database layer
- no service-role key exposed to the frontend
- environment variables managed through local configuration files
- protected management routes and authenticated server-side actions

## QR Code Workflow

The QR code functionality is built to support fast, accurate, and mobile-friendly access to inventory records.

- QR code is generated dynamically for each inventory item
- the QR links to the corresponding `/inventory/[id]` detail page
- the QR can be downloaded as an image file
- the generated URL uses the current application origin, ensuring compatibility with production deployment on Vercel
- the workflow is optimized for mobile devices, allowing users to scan and open the correct inventory record quickly in the live application

This makes the QR workflow suitable for field use, rapid identification, and operational scanning in real lab environments.

## Screenshots

Screenshots will be added here as the project evolves and real UI captures are collected.

### Dashboard
<!-- screenshot -->

### Inventory
<!-- screenshot -->

### Inventory QR Code
<!-- screenshot -->

### Inventory Detail
<!-- screenshot -->

### Equipment
<!-- screenshot -->

### Maintenance
<!-- screenshot -->

## Live Demo

LabTrack is deployed on Vercel and available as a live production application.

Production URL:
https://labtrack-topaz.vercel.app

Authentication is required to access protected laboratory management features.

## Getting Started

Follow the steps below to run the project locally:

```bash
git clone https://github.com/aysesilankarabulut/labtrack.git
cd labtrack
npm install
```

Create a local environment file:

```bash
cp .env.local.example .env.local
```

Then configure your Supabase values in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser to access the application.

## Environment Variables

Example `.env.local` configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key-here
```

Replace the sample values with your own Supabase project credentials before running the app.

## Deployment

LabTrack is configured for deployment on Vercel using the GitHub repository as the source of truth.

Deployment workflow:

- GitHub repository connected to Vercel
- `main` branch used for production deployment
- Supabase environment variables configured in the Vercel project settings
- pushes to `main` trigger automatic production deployment

This setup keeps the application ready for production hosting while preserving secure environment configuration.

## Project Status

LabTrack is currently in a portfolio-ready MVP stage. The application includes working core workflows for laboratory inventory management, stock movement tracking, lot and expiry visibility, equipment tracking, maintenance management, and QR-based item access.

## Future Improvements

Planned enhancements for future iterations include:

- advanced inventory analytics
- consumption forecasting
- replenishment forecasting
- role-based permissions
- notification workflows
- barcode scanning
- audit logging
- automated expiry notifications

## Author

Developed by Ayşe Şilan Karabulut

GitHub:
https://github.com/aysesilankarabulut

---

LabTrack is designed to provide operational visibility, disciplined inventory control, and reliable maintenance management for modern laboratory environments.
