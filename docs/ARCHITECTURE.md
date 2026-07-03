# Dukaan Architecture Deep-Dive

**File:** `docs/ARCHITECTURE.md`
**Scope:** Cross-service architecture, data flow, decisions

---

## Architecture Decision Records

### ADR-001: Multi-Tenancy via Shared Database + EF Filters

**Context:** Need tenant isolation without per-tenant databases.
**Decision:** Shared PostgreSQL database with `ITenantEntity` + EF Core `HasQueryFilter` + `TenantInterceptor` for auto-stamping `TenantId`.
**Consequence:**
- Pros: Single database, easy migrations, connection pooling
- Cons: No hard isolation between tenants (query filter is application-level)

### ADR-002: Inter-Service Communication

**Context:** Services need to communicate without HTTP coupling.
**Decision:**
- Dukaan → Media: **HTTP polling** (background Hangfire job every 30s)
- Dukaan → Notification: **Redis Streams** (async at-least-once delivery)
- Notification → Frontend: **SignalR WebSocket** (real-time push)
**Consequence:** Async communication allows services to be independently scaled and maintained.

### ADR-003: CQRS via MediatR

**Context:** Need consistent command/query separation and a pipeline for cross-cutting concerns.
**Decision:** All business logic in MediatR Handlers inside `Features/` folders. `ValidationBehavior<T,R>` pipeline for FluentValidation.
**Consequence:** Controllers are thin (one-liner `await mediator.Send()`).

### ADR-004: Image Processing on Upload

**Context:** Need optimized images (WebP) for storefront performance.
**Decision:** Upload chunks → MinIO → background job converts to WebP (original, display at 800px, thumbnail at 200px).
**Consequence:** User must wait for background processing. Frontend polls via Dukaan API's `MediaResolutionJob`.

### ADR-005: Notification Strategy Pattern

**Context:** Multiple delivery channels (in-app, signal, email) with different persistence and delivery semantics.
**Decision:** `INotificationDispatcher` interface with `ChannelType` property. `NotificationDispatchManager` selects dispatchers by `notification_types` in the event payload.
**Consequence:** Adding a new channel = new dispatcher class, no changes to consumer or manager.

---

## Data Flow Diagrams

### Request Flow — Merchant Creates Product

```
Browser                           Dukaan API                         PostgreSQL
  │                                    │                                │
  │ POST /api/products                  │                                │
  │ Authorization: Bearer <jwt>         │                                │
  │────────────────────────────────────▶│                                │
  │                                    │  Validate JWT                   │
  │                                    │  Extract tenant_id from claims  │
  │                                    │  Set TenantProvider             │
  │                                    │                                │
  │                                    │  CreateProductCommand           │
  │                                    │  ─── ValidationBehavior ────    │
  │                                    │  ─── Handler ───────────────    │
  │                                    │  Product product = new(...)     │
  │                                    │  repo.AddAsync(product) ───────▶│
  │                                    │  INSERT INTO products (...)     │
  │                                    │◀────────── OK ─────────────────│
  │◀─────── 201 Created ──────────────│                                │
```

### Request Flow — Customer Browses Storefront

```
Browser                           Dukaan API                         PostgreSQL
  │                                    │                                │
  │ GET /api/storefront/products        │                                │
  │ x-tenant-slug: demo-store           │                                │
  │────────────────────────────────────▶│                                │
  │                                    │  ResolveTenantMiddleware        │
  │                                    │  Slug → TenantId query         │
  │                                    │────────────────────────────────▶│
  │                                    │◀──────── TenantId ─────────────│
  │                                    │                                │
  │                                    │  GetStorefrontProductsQuery    │
  │                                    │  WHERE TenantId = @tid          │
  │                                    │  AND IsActive = true            │
  │                                    │────────────────────────────────▶│
  │                                    │◀──────── Products ─────────────│
  │◀─────── 200 + ProductDto[] ──────│                                │
```

### Request Flow — Order Placed (Notification Chain)

```
Browser                       Dukaan API          Redis            Notification
  │                              │                 │                    │
  │ POST /api/orders             │                 │                    │
  │─────────────────────────────▶│                 │                    │
  │                              │ Create order in DB                  │
  │                              │                 │                    │
  │                              │ StreamAdd "order-events" ──────────▶│
  │                              │                 │                    │
  │◀──── 201 Created ──────────│                 │                    │
  │                                                 │                    │
  │                                                 │ OrderEventConsumer │
  │                    (async)                      │  reads stream ────▶│
  │                                                 │                    │
  │                    SignalR Push via Notification Hub                 │
  │◀═══════════════════════════════ WebSocket ─════════════════════════├
  │                    "Notification" event          │                    │
  │                    "Signal" event               │                    │
  │                                                 │                    │
  │                    Email (SMTP via MailHog)      │                    │
  │                    ────────────────────────────────▶  MailHog Web UI │
```

---

## Layer-by-Layer Architecture (per Service)

### Dukaan API — Layer Breakdown

| Layer | Project | Key Files | Responsibilities |
|-------|---------|-----------|-----------------|
| **Domain** | `Dukaan.Domain` | `Product.cs`, `Category.cs`, `Cart.cs`, `Order.cs`, `ITenantEntity.cs`, `AddressType.cs`, `OrderStatus.cs` | Entity definitions, value objects, enums, domain interfaces |
| **Application** | `Dukaan.Application` | `Features/{Feature}/Commands/*.cs`, `Queries/*.cs`, `Dtos/*.cs`, `Interfaces/IRepository.cs`, `Core/Behaviors/ValidationBehavior.cs`, `Observability/DukaanMetrics.cs` | CQRS handlers, DTOs, validation, app interfaces, custom metrics |
| **Infrastructure** | `Dukaan.Infrastructure` | `Data/DbContext/ApplicationDbContext.cs`, `Data/Repositories/Repository.cs`, `Services/TenantProvider.cs`, `Services/EventBus.cs`, `Services/MediaService.cs`, `Jobs/MediaResolutionJob.cs`, `Interceptors/TenantInterceptor.cs`, `Identity/Services/ApplicationUserManager.cs` | EF Core, repositories, external services, background jobs, identity |
| **Host** | `Dukaan.Host` | `Controllers/{Auth,Products,Categories,Cart,Addresses,Orders,Merchants,Customers,Storefront}Controller.cs`, `Program.cs`, `DependencyInjection.cs`, `Middleware/GlobalExceptionHandler.cs`, `ObservabilityOptions.cs` | ASP.NET pipeline, controllers, DI registration, Swagger, CORS |

### Dukaan.Media — Layer Breakdown

| Layer | Key Files | Responsibilities |
|-------|-----------|-----------------|
| **Domain** | `MediaMetadata.cs`, `MediaChunk.cs`, `MediaVariant.cs`, `MediaStatus.cs` | Media entities + status enum |
| **Application** | `Features/Media/Commands/*`, `Features/Uploads/Commands/*`, `Interfaces/IStorageProvider.cs`, `Interfaces/IImageProcessor.cs`, `Interfaces/IJobDispatcher.cs` | Upload protocol, media queries, validation |
| **Infrastructure** | `Storage/MinioStorageProvider.cs`, `ImageProcessing/SkiaSharpProcessor.cs`, `Jobs/ProcessImageJob.cs`, `Jobs/CleanupStagingJob.cs`, `Data/MediaDbContext.cs` | MinIO storage, image processing, background jobs |
| **Host** | `Controllers/MediaController.cs`, `Middleware/TenantResolutionMiddleware.cs` | REST endpoints, tenant resolution |

### Dukaan.Notification — Layer Breakdown

| Layer | Key Files | Responsibilities |
|-------|-----------|-----------------|
| **Domain** | `Notification.cs`, `NotificationChannelType.cs` | Notification entity + channel type enum |
| **Application** | `Features/Notifications/Commands/*`, `Queries/*`, `Interfaces/INotificationDispatcher.cs`, `Interfaces/INotificationDispatchManager.cs`, `Models/NotificationEventData.cs` | Notification CRUD, dispatcher interfaces, event model |
| **Infrastructure** | `Consumers/OrderEventConsumer.cs`, `Dispatchers/{InApp,Signal,Email}Dispatcher.cs`, `Dispatchers/NotificationDispatchManager.cs`, `Hubs/NotificationHub.cs`, `Services/SmtpEmailService.cs` | Redis Stream consumer, dispatcher implementations, SignalR hub, SMTP |
| **Host** | `Controllers/NotificationsController.cs`, `Middleware/TenantResolutionMiddleware.cs` | REST endpoints, tenant resolution |

---

## Frontend Module Map

```
src/
├── app/
│   ├── (merchant)/merchant/
│   │   ├── (auth)/login/page.tsx         → LoginForm (merchant auth)
│   │   └── (protected)/
│   │       ├── layout.tsx                 → MerchantLayout (sidebar shell)
│   │       ├── dashboard/page.tsx         → DashboardView
│   │       ├── products/page.tsx          → ProductsView (table + form)
│   │       ├── categories/page.tsx        → CategoriesView
│   │       └── orders/page.tsx            → MerchantOrdersView
│   ├── (store)/store/[slug]/
│   │   ├── (main)/layout.tsx              → StoreMainLayout
│   │   ├── (main)/page.tsx               → StorefrontView
│   │   ├── login/page.tsx                → LoginForm (customer)
│   │   ├── register/page.tsx             → RegisterForm
│   │   ├── orders/page.tsx               → OrdersView (customer)
│   │   └── profile/page.tsx              → ProfileView + AddressesTab
│   └── page.tsx                           → Home (landing)
├── components/            → ui/ (shadcn), providers, rich-text-editor, multi-select, spinner
├── hooks/                 → use-mobile (sidebar responsive)
├── lib/                   → http.ts, utils.ts, local-storage.service.ts, query-client.ts
└── modules/
    ├── merchant/          → auth, dashboard, products, categories, orders
    ├── store/             → auth, products, cart, orders, profile
    └── notifications/     → SignalR hub connection, notification bell, types
```

---

## Key Architectural Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Multi-tenancy | Shared DB + EF filters | Simpler ops than per-tenant DBs at this scale |
| CQRS | MediatR | Standard .NET pattern, pipeline behaviors for validation/logging |
| Error handling | ErrorOr Result | Explicit error paths, no exception overhead for expected failures |
| Image processing | SkiaSharp | Cross-platform, no native deps on Linux (libfontconfig1) |
| Storage | MinIO (S3-compatible) | Self-hosted, S3 API compatibility, no cloud lock-in |
| Real-time | SignalR | Native ASP.NET Core, Redis backplane for scale |
| Async comms | Redis Streams | At-least-once delivery, consumer groups for load balancing |
| Observability | OpenTelemetry | Vendor-neutral, single agent for traces/metrics/logs |
| Background jobs | Hangfire | PostgreSQL-backed, built-in retries, cron scheduling |
| Frontend state | TanStack Query | Automatic caching, refetching, optimistic updates |
| Styling | Tailwind v4 + shadcn/ui | Design system out of the box, utility-first |
| Validation | FluentValidation | Declarative rules, pipeline integration with MediatR |
