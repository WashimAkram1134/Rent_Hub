# RentHub — Production-Ready Rental Marketplace

## Overview

RentHub is a full-stack rental marketplace connecting **Owners** (lenders) and **Renters** (customers). It is built for the web first, with every backend API designed RESTfully for future mobile consumption.

This plan breaks the project into **18 sequential modules**. Each module is self-contained with BA, database changes, API design, backend code, frontend pages, and tests — waiting for approval before moving to the next.

---

## Technology Decisions & Rationale

| Concern | Choice | Why |
|---|---|---|
| Frontend | Next.js 15 + TypeScript + Tailwind + shadcn/ui | App Router, SSR/SSG, type safety, accessible components |
| Backend | Python 3.12 + FastAPI | Async I/O, auto OpenAPI docs, Pydantic v2 native |
| ORM | SQLAlchemy 2.0 (async) | Type-safe, async sessions, future-proof |
| Migrations | Alembic | Industry standard for SQLAlchemy migrations |
| Database | PostgreSQL 16 | ACID compliance, rich indexing, full-text search |
| Auth | JWT (access) + Refresh Tokens (httpOnly cookie) | Stateless API, secure refresh strategy |
| RBAC | DB-stored roles + permissions + middleware guards | Fine-grained, extensible |
| Cache | Redis 7 | Session, rate limiting, real-time pub/sub |
| Realtime | WebSocket via FastAPI + Redis pub/sub | Notifications & messaging |
| Storage | Local filesystem → AWS S3 compatible abstraction | `StorageBackend` interface, swap without code change |
| Containerization | Docker + Docker Compose + Nginx | Reproducible, production-grade |
| Architecture | Clean Architecture (4 layers) | Separation of concerns, testability |

---

## Architecture — Clean Layers

```
┌──────────────────────────────────┐
│     Presentation (API / WS)      │  ← FastAPI routers, WebSocket handlers
├──────────────────────────────────┤
│         Application              │  ← Services, Use-Cases, DTOs
├──────────────────────────────────┤
│           Domain                 │  ← Entities, Value Objects, Business Rules
├──────────────────────────────────┤
│        Infrastructure            │  ← DB, Redis, Email, Storage, External APIs
└──────────────────────────────────┘
```

### Backend Directory Layout

```
backend/
├── app/
│   ├── api/                  # Routers (v1/)
│   │   └── v1/
│   │       ├── auth.py
│   │       ├── users.py
│   │       ├── products.py
│   │       ├── bookings.py
│   │       ├── payments.py
│   │       ├── reviews.py
│   │       ├── notifications.py
│   │       ├── categories.py
│   │       ├── favorites.py
│   │       ├── messages.py
│   │       └── admin.py
│   ├── auth/
│   │   ├── jwt.py
│   │   ├── password.py
│   │   └── dependencies.py
│   ├── core/
│   │   ├── config.py         # Settings (pydantic-settings)
│   │   ├── logging.py
│   │   ├── exceptions.py
│   │   └── constants.py
│   ├── database/
│   │   ├── base.py           # Declarative base
│   │   ├── session.py        # Async engine + session factory
│   │   └── redis.py
│   ├── models/               # SQLAlchemy ORM models (Domain entities)
│   ├── schemas/              # Pydantic request/response DTOs
│   ├── services/             # Business logic
│   ├── repositories/         # Data access layer
│   ├── middleware/           # Rate limiting, request ID, audit
│   ├── utils/                # Helpers, pagination, filters
│   ├── websocket/            # WS connection manager
│   ├── storage/              # StorageBackend interface + Local impl
│   └── main.py
├── alembic/
├── tests/
├── Dockerfile
├── .env.example
└── requirements.txt
```

### Frontend Directory Layout

```
frontend/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   ├── products/
│   │   ├── bookings/
│   │   └── admin/
│   ├── components/           # Shared UI components
│   │   ├── ui/               # shadcn/ui wrappers
│   │   └── common/
│   ├── features/             # Feature-specific components
│   │   ├── auth/
│   │   ├── products/
│   │   ├── bookings/
│   │   ├── dashboard/
│   │   └── admin/
│   ├── hooks/                # Custom React hooks
│   ├── services/             # API client functions
│   ├── lib/                  # axios instance, utils, validators
│   ├── types/                # TypeScript interfaces
│   └── layouts/              # Shared page layouts
├── public/
├── Dockerfile
├── next.config.ts
└── tailwind.config.ts
```

---

## Database — Full Schema Overview

```
users ──────────────────────────────────────────────────┐
  id, email, phone, password_hash, first_name,           │
  last_name, avatar_url, is_verified, is_identity_verified│
  is_active, created_at, updated_at, deleted_at          │
                                                         │
roles                    permissions                     │
  id, name, description    id, name, resource, action    │
                                                         │
user_roles               role_permissions                │
  user_id, role_id          role_id, permission_id       │
                                                         │
addresses                                               │
  id, user_id, label, street, city, state,              │
  country, postal_code, lat, lng, is_default             │
                                                         │
categories                                              │
  id, name, slug, description, icon, parent_id          │
                                                         │
products                                               │
  id, owner_id → users, category_id, title, slug,       │
  description, price_per_day, security_deposit,         │
  condition, delivery_option, is_active, view_count,    │
  address_id, created_at, updated_at, deleted_at        │
                                                         │
product_images                                         │
  id, product_id, url, order, is_primary                │
                                                         │
product_availability                                   │
  id, product_id, date, is_available                    │
                                                         │
bookings                                               │
  id, product_id, renter_id, owner_id,                  │
  start_date, end_date, total_days, daily_rate,         │
  subtotal, security_deposit, delivery_fee, total_amount│
  status, delivery_option, delivery_address_id,         │
  notes, created_at, updated_at                        │
                                                         │
booking_status_history                                 │
  id, booking_id, status, changed_by, notes, created_at│
                                                         │
payments                                               │
  id, booking_id, user_id, amount, method,             │
  status, reference, metadata, created_at              │
                                                         │
transactions                                           │
  id, payment_id, type, amount, currency, description, │
  created_at                                           │
                                                         │
reviews                                               │
  id, booking_id, reviewer_id, reviewee_id, product_id,│
  rating, comment, type, created_at                    │
                                                         │
favorites                                             │
  id, user_id, product_id, created_at                  │
                                                         │
notifications                                         │
  id, user_id, type, title, body, is_read,             │
  reference_id, reference_type, created_at             │
                                                         │
messages                                              │
  id, booking_id, sender_id, receiver_id, content,    │
  is_read, created_at                                  │
                                                         │
audit_logs                                            │
  id, user_id, action, resource, resource_id,          │
  ip_address, user_agent, payload, created_at          │
```

---

## Development Modules & Order

| # | Module | Status |
|---|---|---|
| 1 | Project Setup (FastAPI + Next.js + Supabase + Redis) | ✅ Completed |
| 2 | Authentication & RBAC | ✅ Completed |
| 3 | User Profile | ✅ Completed |
| 4 | Categories (All Categories & Category Detail Pages) | ✅ Completed |
| 5 | **Product Management** (Listings, Models, Detail Page Redesign) | ✅ Completed |
| 6 | Image Uploads & Gallery (Unsplash + Primary/Thumbnails) | ✅ Completed |
| 7 | Search & Filters (Location, Price, Type, Rating, Sort) | ✅ Completed |
| 8 | **Booking System** (Request to Book, My Bookings, Owner Approval, Details View) | ✅ Completed |
| 9 | **Deals & Offers System** (/offers page, Hero Banner, Flash Deals, Promos) | ✅ Completed |
| 10 | **Wishlist System** (useWishlistStore, Love toggle on all cards, Saved items) | ✅ Completed |
| 11 | **Owner Dashboard** (Aligned Topbar/Sidebar, Lister Portal, Booking Requests) | ✅ Completed |
| 12 | **Customer Dashboard** (Hero Slider, Trending, Recommended, Deals Widget) | ✅ Completed |
| 13 | **Admin Panel** (CMS Slides, Deals, Cities, Moderation) | ✅ Completed |
| 14 | **Payment Integration** (Payment Gateway Modal, bKash/Nagad/Card, Escrow & Printable Invoice) | ✅ Completed |
| 15 | Realtime Notifications & Messaging (WebSockets) | 🔜 Next Module |
| 16 | Production Deployment | Pending |
| 17 | E2E Testing & Verification | Pending |
| 18 | Final Documentation | Pending |

---

## Module 1 — Project Setup (Detailed)

### What Gets Built

| Layer | Deliverable |
|---|---|
| Infrastructure | `docker-compose.yml` with PostgreSQL, Redis, backend, frontend, Nginx |
| Backend | FastAPI app skeleton, core config, DB session, Redis, logging, exception handlers, health check, base repository |
| Frontend | Next.js 15 app, Tailwind + shadcn/ui configured, API client (axios), base layout, home page shell |
| DevOps | Dockerfiles, `.env.example`, Nginx reverse proxy config |

### Module 1 — Files to be Created

**Backend**
- `backend/app/main.py` — FastAPI app with CORS, middleware, routers, lifespan
- `backend/app/core/config.py` — pydantic-settings, all env vars
- `backend/app/core/exceptions.py` — custom exception hierarchy + handlers
- `backend/app/core/logging.py` — structured JSON logging
- `backend/app/core/constants.py` — enums, magic values
- `backend/app/database/base.py` — declarative base, TimestampMixin, SoftDeleteMixin
- `backend/app/database/session.py` — async engine, session factory, `get_db` dependency
- `backend/app/database/redis.py` — Redis connection pool
- `backend/app/repositories/base.py` — generic CRUD repository
- `backend/app/utils/pagination.py` — `PageParams`, `PagedResponse`
- `backend/app/api/v1/health.py` — `/health` endpoint
- `backend/alembic/` — migration environment
- `backend/requirements.txt`
- `backend/Dockerfile`
- `backend/.env.example`

**Frontend**
- `frontend/src/lib/axios.ts` — axios instance with interceptors, token refresh
- `frontend/src/types/index.ts` — global TypeScript interfaces
- `frontend/src/app/layout.tsx` — root layout, fonts, providers
- `frontend/src/app/page.tsx` — landing page shell
- `frontend/src/components/ui/` — shadcn/ui components
- `frontend/Dockerfile`
- `frontend/next.config.ts`
- `frontend/tailwind.config.ts`

**DevOps**
- `docker-compose.yml`
- `nginx/nginx.conf`
- `.env.example` (root)

### API Endpoints — Module 1

```
GET  /api/v1/health          → { status, version, db, redis }
```

### Environment Variables

```env
# App
APP_NAME=RentHub
APP_ENV=development
APP_VERSION=1.0.0
DEBUG=true
SECRET_KEY=

# Database
DATABASE_URL=postgresql+asyncpg://user:pass@db:5432/renthub

# Redis
REDIS_URL=redis://redis:6379/0

# JWT
JWT_SECRET_KEY=
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# Email
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=

# Storage
STORAGE_BACKEND=local
LOCAL_STORAGE_PATH=/app/uploads
AWS_S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

---

## Current Progress Audit & Accomplishments

### ✅ 1. Product Management (Fully Implemented)
- **Database Schema**: `products`, `product_images`, `categories`, `users`, `bookings` fully mapped in Supabase PostgreSQL.
- **Backend Endpoints**:
  - `GET /api/v1/products` (supports filtering by `category_slug`, `city`, `area`, `price_min`, `price_max`, `rating`, `is_featured`, `is_trending`, pagination).
  - `GET /api/v1/products/{slug}` (fetches product, owner details, image gallery, condition, delivery options, average rating, review count).
  - `POST /api/v1/products` & `PUT /api/v1/products/{id}`.
- **Frontend Views**:
  - Category Product Grid (`/categories/[slug]`) with 6 vehicle subcategory filters (Car, Motorcycle, Bicycle, CNG, Bus, Truck), ratings filter, sort dropdown, 4-column grid/list view toggle, **discount badges (`20% OFF`)**, **strikethrough original prices**, and **Wishlist store (`useWishlistStore`)** integration.
  - Redesigned Product Detail Page (`/products/[slug]`) matching reference design: full gallery with thumbnails, highlights chips, specs, owner card, review breakdown, similar cars section, and complete booking widget.
  - Add New Product Listing (`/products/new`).

### ✅ 2. Deals & Offers System (`/offers`)
- **Hero Banner**: Custom uploaded banner graphic (`/images/deals-hero-banner.png`) featuring Toyota Land Cruiser Prado, Canon EOS R6, MacBook Pro, Apartment, Armchair, and Mountain Bike.
- **Category Filters**: Interactive category pills (`All Deals`, `Vehicles`, `Electronics`, `Furniture`, `Cameras`, `Apartments`, `Sports`, `Books`).
- **Deals Grid**: 3-column cards with discount badges (`30% OFF`, `25% OFF`), strikethrough original prices, ratings, owner details, countdown timer (`2d 14h left`), and **Wishlist love icon toggle (`useWishlistStore`)**.
- **Sidebar Widgets**: ⚡ Today's Flash Deals with live ticking countdown timer (`08 : 14 : 36`), `SAVE20` coupon code box with copy button, up to 40% OFF limited time offer card, and Recommended items.
- **Promotional Banners**: Eid Special (`Up to 35% OFF`), Winter Adventure Rentals (`Up to 30% OFF`), and Student Discount Week (`Up to 40% OFF`) matching uploaded reference designs with clear high-definition subject images and hover zoom animations.
- **Home Integration**: Linked Home page "Deals of the Week", "View all", and "Grab Now" buttons directly to `/offers`.

### ✅ 3. Wishlist System (`/wishlist`, `useWishlistStore`)
- Global Zustand store with `localStorage` persistence (`renthub-wishlist-storage`).
- Heart/Love icon on all cards across Home, Category, Offers, and Detail pages toggles items in Wishlist.
- Dedicated Wishlist page (`/wishlist`) showing user saved items with quick actions.

### ✅ 4. Booking System & Request Flow (`/bookings`, `/owner/dashboard/booking-requests`)
- Redesigned Booking Request page matching reference UI layout.
- Status Tabs: `All Requests`, `Pending Approval` (with Accept / Reject action buttons), `Active / Ongoing`, `Completed`, `Cancelled`.
- Renter My Bookings page (`/bookings`) with tabs (`Upcoming`, `Active`, `Completed`, `Cancelled`), summary panel (Total Active Rentals, Upcoming Returns, Total Spent, Reward Points), and View Details redirection.

### ✅ 5. Dashboards (Customer, Owner, Admin)
- **Customer Dashboard**: Left sidebar (`#5B5CEB` active pill, badge counts, Refer & Earn widget), topbar with search, language toggle (বাংলা / English), notifications, hero slider, category grid, trending listings, recommended items, and deals widget.
- **Owner Dashboard**: Standardized topbar and sidebar matching Customer Dashboard layout, earnings widgets, listings overview, and booking requests portal.
- **Admin Dashboard**: Moderation controls, CMS slide manager, CMS deals manager, categories manager, and system health overview.

---

## What's Next — Payment Integration & Realtime Features

1. **Payment Gateway Integration (SSLCommerz / bKash / Stripe)**:
   - Connect checkout modal for approved bookings.
   - Payment status tracking (Pending → Paid → Released to Owner upon rental completion).

2. **Realtime Chat & Notifications**:
   - WebSocket connection for instant owner-renter messaging.
   - Notification dropdown on topbar for booking updates.

3. **Reviews & Rating System**:
   - Renter review submission modal after booking completion.
   - Dynamic calculation of owner and product ratings.
