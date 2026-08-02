# RentHub - Project Details & Technology Stack

This document provides a comprehensive overview of the technical stack, architecture, and tools used (and planned) for the RentHub project.

## 1. Core Architecture
RentHub follows a **Clean Architecture** approach, separating concerns into four distinct layers:
- **Presentation**: API Routers (FastAPI) & WebSockets
- **Application**: Services, Use-Cases, and Data Transfer Objects (DTOs)
- **Domain**: Entities, Value Objects, and Business Rules
- **Infrastructure**: Database, Redis, Storage, Email, and External APIs

## 2. Frontend Technologies
- **Framework**: **Next.js 15** utilizing the App Router for optimal Server-Side Rendering (SSR) and routing.
- **Language**: **TypeScript** for strong type safety and better developer experience.
- **Styling**: **Tailwind CSS** for utility-first styling.
- **UI Components**: **shadcn/ui** for accessible, customizable, and unstyled base components.
- **API Client**: **Axios** (configured with interceptors for token management).
- **Testing (Planned)**: **React Testing Library** for component testing.

## 3. Backend Technologies
- **Framework**: **FastAPI** (Python 3.12) - Chosen for high performance, async I/O, and auto-generated OpenAPI documentation.
- **Data Validation**: **Pydantic v2** for robust request/response schema validation.
- **ORM**: **SQLAlchemy 2.0** utilizing async sessions.
- **Database Migrations**: **Alembic** for managing database schema changes.
- **Testing**: **Pytest** with an async test client (targeting 80%+ coverage).
- **Authentication**: **JWT** (JSON Web Tokens) for access tokens, coupled with HTTPOnly cookies for Refresh Tokens.
- **RBAC**: Database-stored roles and permissions enforced via middleware guards.

## 4. Database & Caching
- **Primary Database**: **PostgreSQL 16** (Provides ACID compliance, rich indexing, and robust relational data structures).
- **Caching & Pub/Sub**: **Redis 7** (Used for rate limiting, caching sessions, and real-time messaging pub/sub).

## 5. DevOps & Infrastructure
- **Containerization**: **Docker** & **Docker Compose** for reproducible environments and easy scaling.
- **Reverse Proxy**: **Nginx** 1.25 for routing traffic, SSL termination, and serving static assets.
- **Storage**: A `StorageBackend` interface is designed to use the **Local Filesystem** initially, with a planned swap to **AWS S3** compatible storage as the app grows.

## 6. Realtime & Notifications (Planned)
- **WebSockets**: Handled natively by FastAPI for real-time messaging and notifications between Owners and Renters.
- **Message Broker**: Redis Pub/Sub to scale WebSocket connections across multiple workers.

## 7. Upcoming / Planned Integrations
These are critical integrations identified in the roadmap that will be implemented as development progresses:
- **Payment Gateway**: Integration with Stripe, PayPal, or local providers (e.g., SSLCommerz/bKash) for secure transactions.
- **Email Provider**: SMTP integration (via SendGrid, Mailgun, or standard services) for transactional emails.
- **Mapping & Location**: Google Maps API or OpenStreetMap (Leaflet) for displaying product locations.
- **Identity Verification (KYC)**: Manual admin review process or integration with a 3rd-party KYC provider for verifying Owners and Renters.
