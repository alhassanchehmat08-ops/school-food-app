# School Food App (SEA Snack Stop)

A simple school-friendly ordering web app built with **Next.js App Router + TypeScript + Prisma + SQLite**.

Students can browse menu items, add to cart, and place orders with **Pay at counter** checkout.
Admins can log in to view and manage order statuses.

## Features

- Student shop page (`/`)
  - Menu grouped by categories: Noodles, Snacks, Drinks, Other
  - Cart with quantity controls + remove
  - Checkout form (name, class/section, order type, table number for table orders, notes)
  - Order confirmation page with order number like `S-000123`
- Admin dashboard (`/admin`)
  - Password gate using `ADMIN_PASSWORD`
  - Cookie-based simple session
  - Filter tabs: Pending, Preparing, Ready, Completed, Cancelled
  - Update status buttons on each order
  - Ready orders highlighted with large call-out text
- Database model
  - Product, Order, OrderItem with snapshot pricing and names
- Seed data with 7 products (including Buldak and Indomie).

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Prisma ORM
- SQLite

## Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

You can edit values as needed:

- `DATABASE_URL="file:./dev.db"`
- `ADMIN_PASSWORD="changeme"`

### 3) Generate Prisma client

```bash
npm run prisma:generate
```

### 4) Run database migration

```bash
npm run prisma:migrate
```

### 5) Seed products

```bash
npm run prisma:seed
```

### 6) Start development server

```bash
npm run dev
```

Open:

- Student shop: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`

## Scripts

- `npm run dev` - Start local development server
- `npm run build` - Build production app
- `npm run start` - Start production server
- `npm run lint` - Run Next.js lint checks
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Create/apply development migration
- `npm run prisma:seed` - Seed product data

## Notes

- Checkout ends with **Pay at counter** (no online payment integration).
- Admin authentication is intentionally simple for school project use.
- Prices are stored in AED and easy to edit from Prisma seed data.
