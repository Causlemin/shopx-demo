# Microservices E-Commerce Platform

A distributed, event-driven, realtime e-commerce platform built with modern microservice and micro-frontend architecture principles.

This project demonstrates scalable backend communication, distributed transaction management with the Saga Pattern, realtime cross-application synchronization, CQRS, Onion Architecture, SOLID principles, cookie-based authentication, shared frontend packages, and modern monorepo practices.

----------

# Sections

- Planning & Design Decisions
- Architecture Overview
- Key Features
- Technology Stack
- Frontend Monorepo Structure
- Authentication Architecture
- Cart Synchronization Architecture
- Order Architecture
- Saga Pattern
- CQRS
- Event-Driven Communication
- SOLID Principles
- 12-Factor App Principles
- Onion Architecture
- Security
- Main API Endpoints
- Running the Project
- Test Scenarios
- Deployment & Docker Build
- Troubleshooting
- Project Goals
- Licence

----------

# Planning & Design Decisions

Several architectural and design decisions were made intentionally during the planning phase of the project in order to satisfy scalability, maintainability, realtime communication, and distributed system requirements.

## Why Microservices?

The backend was separated into multiple services to isolate responsibilities and improve scalability.

Examples:

- AuthService → authentication and token management
- ProductService → product and stock management
- OrderService → order lifecycle and cart persistence
- LogService → centralized logging

This separation also improves maintainability and independent deployment capabilities.

## Why API Gateway?

YARP API Gateway was introduced to centralize routing and authentication concerns.

Responsibilities:

- Route forwarding
- JWT forwarding
- Centralized API access
- Decoupling frontend applications from internal services

This allows frontend applications to communicate with a single entry point.

## Why Saga Pattern?

Traditional distributed database transactions were intentionally avoided.

Instead, a choreography-based Saga Pattern was implemented using RabbitMQ and MassTransit.

Reasoning:

- Better scalability
- Loose coupling between services
- Independent service ownership
- Failure recovery through events

This approach is more suitable for distributed systems than tightly coupled database transactions.

## Why SignalR?

Realtime synchronization between micro-frontends was required.

Examples:

- home-app updates cart
- cart-app reflects changes instantly

SignalR was selected because:

- Simple realtime communication model
- Native .NET integration
- Persistent websocket connections
- Efficient event broadcasting

## Why Cart Snapshot Persistence?

Initially, realtime events alone were considered for cart synchronization.

However, this created a problem:

If cart-app is closed while home-app updates the cart,
the cart state would be lost. To solve this, backend cart snapshot persistence was introduced.

Benefits:

- State recovery
- Cross-application consistency
- Stateless frontend applications
- More reliable synchronization

## Why Cookie-Based JWT Authentication?

Instead of storing JWTs directly inside browser localStorage, HttpOnly cookies were used.

Reasons:

- Improved security
- Reduced XSS attack surface
- Centralized token lifecycle
- Automatic browser cookie handling

The API Gateway reads cookies and forwards JWTs internally as Authorization headers.

## Why a Frontend Monorepo?

A Turborepo monorepo architecture was selected because both frontend applications share:

- UI components
- Validation schemas
- API client logic
- Realtime event communication

Benefits:

- Shared code reuse
- Easier maintenance
- Consistent architecture
- Simplified dependency management
- At the same time, both frontend applications remain independently deployable.

## Why Shared Packages?

The following shared packages were intentionally extracted:
@repo/ui
@repo/api-client
@repo/event-bus

This avoids duplicated logic across applications and keeps responsibilities centralized.

Examples:
- Shared API retry logic
- Shared SignalR connection management
- Shared Tailwind UI components

## Why CQRS?

CQRS was introduced inside ProductService to separate read and write operations.

Benefits:

- Cleaner application layer
- Better separation of responsibilities
- Easier scaling in future
- More maintainable handlers

## Why Event-Driven Communication?

RabbitMQ and MassTransit were selected for asynchronous service communication.

Reasons:

- Loose coupling
- Scalability
- Independent service evolution
- Retry capabilities
- Reliable background processing

This architecture allows services to react to domain events instead of calling each other directly.

## Why a Single Order Aggregate?

Initially, separate entities existed for authenticated and guest orders.
Later, the architecture was simplified into a single Order aggregate.

Reasoning:

- Reduced duplication
- Simpler maintenance
- Unified order lifecycle
- Cleaner domain model

Guest orders are represented by nullable UserId values.

## Why Stateless Services?

Services were intentionally designed to remain stateless.

Examples:

- JWT authentication
- Backend cart persistence
- Externalized configuration
- RabbitMQ event communication

Benefits:

- Easier horizontal scaling
- Better containerization
- Simpler recovery and redeployment

-----------

# Architecture Overview

┌──────────────────────────────────────────────────────────────────────┐
│                         API Gateway (YARP)                          │
│              Routing | JWT Forwarding | Rate Limiting               │
│                              :5000                                  │
└──────────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼────────────────────────┐
        ▼                       ▼                        ▼

┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│   AuthService   │   │ ProductService  │   │  OrderService   │
│      :5001      │   │      :5002      │   │      :5004      │
│ JWT + Cookies   │   │ CQRS + Events   │   │ Saga + CartHub  │
└─────────────────┘   └─────────────────┘   └─────────────────┘
                                │
                                ▼
                     ┌──────────────────┐
                     │     RabbitMQ     │
                     │  Event Broker    │
                     └──────────────────┘
                                │
                                ▼
                     ┌──────────────────┐
                     │     LogService   │
                     │       :5003      │
                     └──────────────────┘

Frontend Monorepo

┌──────────────────────────────────────────────────────────────┐
│                       Turborepo Monorepo                    │
├──────────────────────────────────────────────────────────────┤
│ home-app (:3000)                                            │
│ cart-app (:3001)                                            │
│ packages/ui                                                 │
│ packages/api-client                                         │
│ packages/event-bus                                          │
└──────────────────────────────────────────────────────────────┘

Realtime Communication

home-app  ◄──── SignalR / CartHub ────►  cart-app

----------

# Key Features

- Microservice architecture
- Micro-frontend architecture
- Event-driven communication
- Saga Pattern distributed workflow
- CQRS with MediatR
- Onion Architecture
- Realtime cart synchronization
- Shared frontend packages
- Cookie-based JWT authentication
- Refresh token mechanism
- Cart snapshot persistence
- RabbitMQ message broker
- SignalR realtime communication
- Centralized logging
- Shared API client architecture
- Distributed stock synchronization
- SOLID-oriented backend design

---

# Technology Stack

## Backend

| Technology | Purpose |
|---|---|
| .NET 10 | Microservices |
| MongoDB | Database |
| RabbitMQ | Event broker |
| MassTransit | Event abstraction |
| MediatR | CQRS |
| YARP | API Gateway |
| SignalR | Realtime communication |
| Serilog | Structured logging |
| JWT | Authentication |

## Frontend

| Technology | Purpose |
|---|---|
| Next.js | Frontend applications |
| Turborepo | Monorepo management |
| TypeScript | Type safety |
| Zustand | State management |
| TailwindCSS | Styling |
| Shadcn/UI | Shared UI components |
| Axios | HTTP client |
| SignalR Client | Realtime synchronization |

## Services

| Service | Port | Responsibility |
|---|---:|---|
| API Gateway | 5000 | Routing, JWT forwarding, rate limiting |
| AuthService | 5001 | Authentication, JWT, refresh token |
| ProductService | 5002 | Product management, CQRS, stock management |
| LogService | 5003 | Centralized structured logs |
| OrderService | 5004 | Orders, Saga workflow, cart snapshot, CartHub |
| home-app | 3000 | Product listing and add-to-cart |
| cart-app | 3001 | Cart management and checkout |

# Frontend Monorepo Structure

Each frontend application is independently deployable as its own Docker image. Although both applications live inside a Turborepo monorepo and consume shared workspace packages, each app has its own Dockerfile, runtime port, build pipeline, and container definition.

frontend/
├── apps/
│   ├── home-app/
│   └── cart-app/
│
├── packages/
│   ├── ui/
│   ├── api-client/
│   └── event-bus/
│
├── turbo.json
├── pnpm-workspace.yaml
└── package.json

## Shared Packages

### '@repo/ui'

Reusable shared UI component package.

Examples:

- Button
- Card
- Input
- Label
- Dialog
- Select
- Tabs

Both frontend applications consume shared UI components from this package.

### '@repo/api-client'

Centralized API abstraction layer.

Responsibilities:

- Shared Axios instance
- Cookie-based authentication support
- Automatic refresh token retry flow
- Shared typed API methods
- Error normalization
- Centralized communication with API Gateway

### '@repo/event-bus'

Shared realtime communication layer.

Responsibilities:

- SignalR connection management
- Cart synchronization events
- Order completion events
- Cross-application realtime updates

----------

# Authentication Architecture

The project uses cookie-based JWT authentication.

## Login Flow

User logs in
↓
AuthService generates AccessToken and RefreshToken
↓
Tokens are written as HttpOnly cookies
↓
Frontend JavaScript cannot directly read tokens
↓
Browser automatically sends cookies to API Gateway
↓
API Gateway reads accessToken cookie
↓
API Gateway forwards JWT as Authorization header
↓
Downstream services validate JWT normally

## Refresh Token Flow

AccessToken expires
↓
API request returns 401
↓
Axios interceptor calls /auth/refresh
↓
AuthService validates refreshToken from HttpOnly cookie
↓
New accessToken and refreshToken cookies are issued
↓
Original request is retried automatically

This keeps token handling centralized and prevents exposing JWTs directly to browser JavaScript.

----------

# Cart Synchronization Architecture

The system supports realtime cross-application cart synchronization.

## Realtime Flow

home-app adds or updates cart item
↓
Cart snapshot is persisted through backend
↓
SignalR event is emitted through CartHub
↓
cart-app updates instantly

## Snapshot Persistence

Realtime events are not treated as the only source of truth. Cart state is also persisted in backend.

cart-app is closed
↓
User adds products in home-app
↓
Cart snapshot is stored in OrderService
↓
cart-app opens later
↓
cart-app fetches /cart
↓
Cart state is restored

This solves the problem where one micro-frontend is not running when the other one updates the cart.

## CartHub

OrderService hosts a SignalR hub used for realtime communication between frontend applications.

### Realtime Events

| Event | Purpose |
|---|---|
| CartItemAdded | Notify other app about a newly added item |
| CartSynced | Sync full cart snapshot |
| OrderCompleted | Notify home-app to refresh product stock |

----------

# Order Architecture

The project uses a single 'Order' aggregate for both authenticated and guest orders.

## Authenticated Order

UserId != null
IsGuest == false

## Guest Order

UserId == null
IsGuest == true
TrackingNumber != null

This avoids duplicate domain models and keeps the order lifecycle consistent.

----------

# Saga Pattern

A choreography-based Saga Pattern is used for distributed transaction management.

OrderService creates order with Pending status
↓
OrderCreatedEvent is published
↓
ProductService consumes event
↓
ProductService validates stock
↓
If stock is available:
    StockReservedEvent is published
    OrderService marks order as confirmed
↓
If stock is insufficient:
    StockFailedEvent is published
    OrderService marks order as cancelled

This avoids direct distributed database transactions across services.

----------

# CQRS

ProductService uses CQRS with MediatR.

Commands and queries are separated to keep write and read responsibilities clean.

Examples:

- CreateProductCommand
- UpdateProductStockCommand
- GetAllProductsQuery
- GetProductByIdQuery

----------

# Event-Driven Communication

RabbitMQ and MassTransit are used for asynchronous service-to-service communication.

Example:

OrderCreatedEvent
↓
RabbitMQ
↓
ProductService Consumer
↓
Stock validation
↓
StockReservedEvent / StockFailedEvent
↓
OrderService Consumer
↓
Order status update

----------

# SOLID Principles

The project follows SOLID principles across backend services.

## Single Responsibility Principle

Each class has one clear responsibility.

Examples:

- 'CreateOrderCommandHandler' handles order creation workflow.
- 'TokenService' handles token generation.
- 'CartSnapshotRepository' handles cart snapshot persistence.
- 2ProductRepository2 handles product data access.

## Open/Closed Principle

The system can be extended without modifying core logic.

Examples:

- New RabbitMQ consumers can be added without changing existing consumers.
- New realtime SignalR events can be added through 'event-bus'.
- Additional order workflow steps can be added through events.


## Liskov Substitution Principle

Application code depends on abstractions instead of concrete implementations.

Examples:

- IOrderRepository
- IProductRepository
- ITokenService

Concrete implementations can be replaced without changing application-level logic.

## Interface Segregation Principle

Interfaces are focused on specific responsibilities.

Examples:

- IOrderRepository
- IOrderStatusRepository
- ICartSnapshotRepository
- ITokenService

Each interface exposes only the operations needed by its consumers.

## Dependency Inversion Principle

High-level modules depend on abstractions.

Example:

- "CreateOrderCommandHandler(IOrderRepository orderRepository, IPublishEndpoint publishEndpoint)"

Handlers do not directly instantiate infrastructure dependencies.

----------

# 12-Factor App Principles

The project was designed with 12-Factor App methodology in mind.

## Codebase
Each service belongs to a version-controlled codebase, while frontend applications are managed inside a Turborepo monorepo.

## Dependencies

All dependencies are explicitly declared through:

- NuGet
- pnpm workspace
- package.json
- Docker containers

## Config

Configuration is stored in environment variables rather than hardcoded values.

Examples:
- JWT secrets
- MongoDB connection strings
- RabbitMQ configuration

## Backing Services

MongoDB and RabbitMQ are treated as attached resources and accessed through configuration.

## Build, Release, Run

Frontend applications use multi-stage Docker builds to separate build and runtime stages.

## Processes

Services are designed to be stateless.
Authentication uses JWT cookies and cart state is persisted in backend storage.

## Port Binding

Each service exposes itself through explicit port binding.

## Concurrency

Microservices can be scaled independently.

## Logs

Logs are treated as event streams and centralized through Serilog and MongoDB.

----------

# Onion Architecture

Each backend service follows Onion Architecture.

API
↓
Application
↓
Domain
↓
Infrastructure

Benefits:

- Separation of concerns
- Testability
- Maintainability
- Loose coupling
- Framework-independent domain layer

----------

# Security

- HttpOnly cookie-based JWT authentication
- Refresh token rotation
- Password hashing
- Role-based authorization
- API Gateway JWT forwarding
- Frontend does not directly access JWT tokens

----------

# Main API Endpoints

## Auth

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /auth/register | Register user |
| POST | /auth/login | Login and set auth cookies |
| POST | /auth/refresh | Refresh JWT cookies |
| POST | /auth/logout | Clear auth cookies |
| GET | /auth/me | Get authenticated user |

## Products

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /products | Get all products |
| GET | /products/{id} | Get product detail |
| POST | /products | Create product |
| PUT | /products/{id}/stock | Update product stock |

## Orders

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /orders | Create authenticated order |
| POST | /orders/guest | Create guest order |
| GET | /orders/my | Get current user's orders |
| GET | /orders/{id} | Get order detail |

## Cart

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /cart | Get cart snapshot |
| PUT | /cart | Sync cart snapshot |
| DELETE | /cart | Clear cart snapshot |

----------

# Running the Project

## Requirements

- Docker Desktop
- Node.js
- pnpm
- .NET 10 SDK
- MongoDB Atlas or local MongoDB
- RabbitMQ

## Environment Variables

Create a '.env' file in the project root:

AUTH_MONGO_CONNECTION_STRING=mongodb+srv://...
PRODUCT_MONGO_CONNECTION_STRING=mongodb+srv://...
ORDER_MONGO_CONNECTION_STRING=mongodb+srv://...
LOG_MONGO_CONNECTION_STRING=mongodb+srv://...

JWT_SECRET=your-super-secret-key-at-least-32-characters-long-for-all-services

Note: 'appsettings.json' files contain placeholder values only. Actual configuration values are injected through environment variables.

## Backend Startup

Run each service in a separate terminal:

cd backend/AuthService/API
dotnet run

cd backend/ProductService/API
dotnet run

cd backend/LogService/API
dotnet run

cd backend/OrderService/API
dotnet run

cd backend/ApiGateway
dotnet run

## Frontend Startup

cd frontend
pnpm install
pnpm dev

This starts both frontend applications through Turborepo:

- home-app: http://localhost:3000
- cart-app: http://localhost:3001

----------

# Deployment & Docker Build

The project supports both full-stack deployment and independently deployable services/applications.

## Full System Build & Run

From the project root run:

- docker compose down -v
- docker compose build
- docker compose up

Or in detached mode run:

- docker compose up --build -d

This starts:

- RabbitMQ
- AuthService
- ProductService
- OrderService
- LogService
- API Gateway
- home-app
- cart-app

## Build Individual Backend Services

- docker compose build auth-service
- docker compose build product-service
- docker compose build order-service
- docker compose build log-service
- docker compose build api-gateway

Run a single backend service example:

- docker compose up auth-service

## Build Individual Frontend Applications

Each frontend application is independently deployable as its own Docker image.

- docker compose build home-app
- docker compose build cart-app

Run individually:

- docker compose up home-app
- docker compose up cart-app

## Rebuild a Single Service After Changes

- docker compose build order-service
- docker compose up order-service

For frontend:

- docker compose build home-app
- docker compose up home-app

----------

# Test Scenarios

## Cart Sync

1. Open home-app.
2. Add product to cart.
3. Open cart-app.
4. Cart should be restored from backend snapshot.
5. Change quantity in cart-app.
6. Return to home-app.
7. Product card quantity should be synchronized.

## Auth Sync

1. Login in home-app.
2. Open cart-app.
3. cart-app calls '/auth/me'.
4. User state is restored through HttpOnly cookie auth.

## Checkout

1. Add products to cart.
2. Open cart-app checkout page.
3. Submit checkout form.
4. Order is created.
5. Cart snapshot is cleared.
6. Product stock refresh event is emitted.


## Refresh Token

1. Login.
2. Wait until access token expires.
3. Trigger protected API call.
4. Request returns 401.
5. Axios interceptor calls '/auth/refresh'.
6. Original request is retried automatically.

# Troubleshooting

## MongoDB Connection Error

Check:

- MongoDB connection string
- Atlas IP whitelist
- Database name
- Environment variables

## RabbitMQ Connection Error

docker restart rabbitmq

## Frontend Build Issues

rm -rf node_modules
rm -rf apps/home-app/.next
rm -rf apps/cart-app/.next
pnpm install
pnpm dev

## Cookie Auth Not Working

Check:

- 'withCredentials: true' in Axios
- API Gateway CORS allows credentials
- AuthService returns 'Set-Cookie'
- Browser is not in private mode
- API Gateway forwards JWT from cookie to Authorization header

----------

# Project Goals

This project was developed to demonstrate:

- Distributed systems knowledge
- Microservice communication
- Realtime application architecture
- Event-driven design
- Saga Pattern implementation
- Scalable frontend/backend architecture
- SOLID principles
- Secure cookie-based authentication
- Micro-frontend synchronization
- Monorepo shared package design

----------

# License

Educational / technical assessment project.
