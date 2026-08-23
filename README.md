# LabTrack

LabTrack is a full-stack laboratory operations management platform designed to help teams manage inventory, stock movements, lot and expiry tracking, equipment status, and preventive maintenance in a single operational workflow.

## Overview

LabTrack helps laboratory teams maintain visibility across the operational core of the business:

- laboratory inventory visibility
- stock movement tracking and reconciliation
- low-stock monitoring and replenishment planning
- lot and expiration tracking for batch-sensitive materials
- equipment tracking and operational status monitoring
- preventive maintenance scheduling and maintenance history

The platform is built around real operational data, with authenticated access and database-level controls for day-to-day laboratory management.

## Features

The current application includes the following working features:

- Authentication
- Protected routes
- Inventory management
- Low stock alerts
- Stock IN / OUT operations
- Stock movement history
- Lot tracking
- Expiration monitoring
- Equipment management
- Equipment detail views
- Maintenance records
- Maintenance scheduling
- Dashboard metrics
- Operational alerts
- Recent activity feed

## Tech Stack

This project uses the following technologies and platforms:

- Next.js 16
- React
- TypeScript
- Tailwind CSS
- Supabase
- PostgreSQL
- Supabase Auth
- Row Level Security
- Next.js Server Actions

## Architecture

LabTrack follows a simple and reliable application flow:

```text
User
  ↓
Next.js UI
  ↓
Server Actions
  ↓
Supabase Auth + RLS
  ↓
PostgreSQL
```

The app is structured around core operational modules:

- Inventory: products, stock quantities, minimum thresholds, and critical-stock visibility
- Stock Movements: IN and OUT transaction tracking with historical movement records
- Lots and Expiry: batch-level tracking with lot numbers and expiration dates for controlled materials
- Equipment: device catalog, operational status, location, and service information
- Maintenance: maintenance records, upcoming service dates, and maintenance history

## Database

The core database tables used by the platform are:

- inventory_items — stores product definitions, stock levels, minimum thresholds, and storage metadata
- inventory_batches — stores lot-level records, quantities, received dates, and expiry dates for tracked inventory
- stock_movements — records stock inflow and outflow operations with metadata and timestamps
- equipment — stores laboratory devices, system status, maintenance schedule data, and location details
- maintenance_records — tracks maintenance actions, dates, descriptions, costs, and next service planning

## Security

The application follows a secure, authenticated pattern for operational workflows:

- Supabase authentication for user sign-in and session handling
- server-side session validation before protected actions run
- Row Level Security enforced by the database layer
- no service-role key exposed to the frontend
- environment variables managed through local configuration files
- protected management routes and authenticated server-side actions

## Screenshots

Screenshots will be added here as the project evolves and real UI captures are collected.

### Dashboard
<!-- screenshot -->

### Inventory
<!-- screenshot -->

### Equipment
<!-- screenshot -->

### Maintenance
<!-- screenshot -->

## Getting Started

Follow the steps below to run the project locally:

```bash
git clone <repository-url>
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

## Project Status

LabTrack is currently in a core platform complete / portfolio-ready MVP stage. The application includes the main operational workflows needed to manage laboratory inventory, stock movement history, lot and expiry visibility, equipment tracking, and maintenance management in a working full-stack setup.

## Future Improvements

Planned enhancements for future iterations include:

- QR-based equipment access and quick identification
- advanced consumption analytics and usage forecasting
- inventory forecasting and replenishment insights
- role-based permissions and richer access control
- notification and alerting workflows for critical events

These items are intentionally listed as future improvements and are not part of the current feature set.

## Author / Portfolio

This project is presented as a portfolio-ready laboratory operations application.

Portfolio information and contact details can be added here when publishing the project publicly.

---

LabTrack is designed for operational visibility, disciplined inventory control, and reliable maintenance management in modern laboratory environments.
