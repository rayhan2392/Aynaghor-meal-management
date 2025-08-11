# Aynnaghor Meal Management System — Backend Requirements

## 1) Context and Goals
- Purpose: Provide a reliable backend API that mirrors the current frontend behavior and business rules for meal, expense, deposit tracking, and monthly settlement (manager-centric).
- Scope: One group with 5 members + 1 manager, cycle-based (monthly) operations, precise money math, admin-only API for MVP.
- Non-goals (MVP): No public signup/login, no multi-tenant groups, no JWT (custom admin key only), no direct member-to-member transactions.

## 2) Architecture Overview
- Stack: TypeScript, Express.js, MongoDB, Mongoose, Zod, Decimal.js.
- Pattern: Modular MVC (models, services, controllers, routes, validation, middleware, utils, config).
- Frontend integration: RTK Query-ready REST JSON endpoints; CORS enabled for `http://localhost:5173`.

Recommended structure:
```
backend/
  src/
    config/            # server, database, env
    models/            # Mongoose schemas
    services/          # Business logic
    controllers/       # HTTP handlers
    routes/            # Express routers
    validation/        # Zod schemas per resource
    middleware/        # auth, errors, validation, rate limit
    utils/             # money, dates, settlement helpers
    types/             # shared TS interfaces
    index.ts           # app entry
  tests/               # unit + integration (Jest)
  docs/                # OpenAPI/Swagger (optional)
  package.json
  tsconfig.json
  .env.example
  README.md
```

## 3) Data Model (MongoDB/Mongoose)
Use strings for money fields; perform arithmetic via Decimal.js only.

- User
  - _id: ObjectId
  - name: string
  - role: "manager" | "member"
  - active: boolean
  - createdAt, updatedAt: ISO string
  - Constraints: exactly 1 manager, 5 members (configurable later); soft-deactivate members.

- Cycle
  - _id: ObjectId
  - name: string (e.g., "March 2025")
  - month: number (1-12)
  - year: number (YYYY)
  - startDate, endDate: ISO date string (Dhaka TZ boundary)
  - status: "open" | "closed"
  - createdAt, updatedAt
  - Constraints: Only 1 open cycle at a time; closed cycles immutable.

- MealEntry
  - _id: ObjectId
  - cycleId: ObjectId (ref Cycle)
  - date: string (ISO date)
  - userId: ObjectId (ref User)
  - lunch: 0 | 1
  - dinner: 0 | 1
  - guestMeals: integer >= 0
  - note?: string
  - createdAt, updatedAt
  - Constraints: 1 entry per (cycleId, date, userId); max lunch 1, dinner 1 per day; guestMeals unbounded.

- Expense
  - _id: ObjectId
  - cycleId: ObjectId (ref Cycle)
  - date: string (ISO date)
  - amount: string (money)
  - paidFrom: "pool" | "personal"
  - payerUserId?: ObjectId (required if personal)
  - note?: string
  - createdAt, updatedAt
  - Constraints: one regular expense per day; emergency expenses allowed via dashboard quick entry.

- Deposit
  - _id: ObjectId
  - cycleId: ObjectId (ref Cycle)
  - userId: ObjectId (ref User)
  - date: string (ISO date)
  - amount: string (money)
  - note?: string
  - createdAt, updatedAt
  - Constraints: positive amounts only.

- Settlement (generated on close)
  - _id: ObjectId
  - cycleId: ObjectId
  - perMealRate: string
  - totals: { totalDeposits: string; totalExpenses: string; totalMeals: number }
  - perUser: [{ userId, meals, share, deposited, net }]
  - closedAt: ISO string

Indexes (examples):
- MealEntry: { cycleId: 1, date: 1, userId: 1 } unique
- Expense: { cycleId: 1, date: 1 }
- Deposit: { cycleId: 1, userId: 1, date: 1 }
- Cycle: { status: 1 }, { month: 1, year: 1 }, unique (month, year)

## 4) Business Rules
- Users: 5 members + 1 manager. Only manager performs settlements and is the sole counterparty.
- Meals: At most one lunch and one dinner per user per day; guest meals unlimited (count towards user’s total).
- Expenses:
  - Pool: split equally among active members.
  - Personal: treated as the payer’s contribution (credited to their deposit side).
  - One regular expense per day; emergency expenses allowed via dashboard quick entry.
- Deposits: Credited to the specified user; positive amounts; per cycle.
- Settlement:
  - Interim (dashboard): compute up to yesterday; exclude today.
  - Close month: compute final per-meal rate, user shares, net; instructions visible only after close.
  - Rounding: Round final displayed amounts to whole BDT; internal math with Decimal.js.
- Cycles: Only one open cycle; closing locks data; new cycle starts for next month.

## 5) API Design (REST, JSON)
Base URL: `/api/v1`
Auth: MVP uses `x-admin-key` header (server-side env ADMIN_SECRET). Future: JWT.

Common response shape:
```
{ success: true, data, message? }  // success
{ success: false, error, details? } // error
```

### Health
- GET `/health` → { success, env, timestamp, uptime }
- GET `/api/v1` → high-level index of endpoints

### Users
- GET `/users?active=true|false&role=manager|member`
- GET `/users/:id`
- POST `/users` (admin only) create (manager/member)
- PUT `/users/:id` update
- DELETE `/users/:id` soft-deactivate
- GET `/users/active`
- GET `/users/manager`

### Cycles
- GET `/cycles?status=open|closed&month=&year=`
- GET `/cycles/:id`
- GET `/cycles/active`
- POST `/cycles` create new month (enforce single open cycle)
- PUT `/cycles/:id` update (only open)
- POST `/cycles/:id/close` close and generate settlement
- DELETE `/cycles/:id` only when no related data
- GET `/cycles/:id/stats` (days elapsed, remaining, totals)

### Meals
- GET `/meals?cycleId=&date=&userId=&startDate=&endDate=`
- GET `/meals/:id`
- POST `/meals` (upsert create path must enforce 1/day/user rules)
- PUT `/meals/:id`
- DELETE `/meals/:id`
- POST `/meals/bulk` bulk upsert by date for all users
- POST `/meals/copy` copy previous day → { cycleId, fromDate, toDate }
- GET `/meals/summary/:cycleId` totals per user, totalMeals

### Expenses
- GET `/expenses?cycleId=&date=&paidFrom=&payerUserId=&startDate=&endDate=`
- GET `/expenses/:id`
- POST `/expenses` create regular (enforce 1/day rule)
- POST `/expenses/emergency` create bypassing 1/day rule
- PUT `/expenses/:id`
- DELETE `/expenses/:id`
- GET `/expenses/summary/:cycleId` totals (pool/personal)

### Deposits
- GET `/deposits?cycleId=&userId=&date=&startDate=&endDate=`
- GET `/deposits/:id`
- POST `/deposits`
- PUT `/deposits/:id`
- DELETE `/deposits/:id`
- GET `/deposits/summary/:cycleId` totals + per-user breakdown
- GET `/deposits/user/:userId/:cycleId` single user total

### Settlements
- GET `/settlements/interim/:cycleId` interim totals (up to yesterday)
- GET `/settlements/final/:cycleId` final settlement (closed cycles)
- GET `/settlements/dashboard/:cycleId` dashboard summary

## 6) Validation (Zod)
- Validate body, params, and query per route.
- Strong typing of DTOs:
  - Create/Update User, Cycle, MealEntry, Expense, Deposit
  - Query DTOs for filters and pagination
- Validation errors return `{ success: false, error: 'Validation failed', details: [...] }`.

## 7) Money & Precision
- Use `decimal.js` for all arithmetic.
- Persist money as strings.
- Helpers: `addMoney(strings[])`, `multiplyMoney(a, b)`, `formatBDT(string)`.
- Round only for displayed settlement amounts (whole BDT).

## 8) Middleware
- Auth: `x-admin-key` check (optional variant that doesn’t error, sets isAdmin flag).
- Validation: body/query/params via Zod.
- Error handling: normalized JSON errors, dev stack traces.
- Security: helmet, cors (frontend origin), rate limit (100/15min default).
- Logging: morgan in development.

## 9) Services (Business Logic)
- Users: CRUD, getActiveUsers, getManager.
- Cycles: create (enforce single active), update, close (generate settlement), stats.
- Meals: CRUD, range queries, per-user totals, upsert-by-date, copy previous day.
- Expenses: CRUD, daily rule (regular), emergency create, totals per type.
- Deposits: CRUD, per-user totals, cycle totals with breakdown.
- Settlements: interim, final, dashboard summary.

## 10) Error Handling Policy
- 400: validation/cast errors
- 401: missing/invalid admin key
- 403: not admin (future roles)
- 404: not found
- 409: duplicate/conflict
- 500: unhandled

Error payloads always include `success=false`, `error`, and optional `details` (field messages).

## 11) Security
- Enforce CORS for frontend origin only.
- Rate limit defaults: 100 requests / 15 minutes / IP.
- Hide stack traces in production.
- Never log secrets.

## 12) Testing
- Unit tests for: money utils, services, validation.
- Integration tests for: routes via supertest (in-memory Mongo or test DB).
- Seed helpers for deterministic data.
- CI target coverage: 80%+ initially, aim for 90%+.

## 13) Deployment
- Local: `.env`, Node LTS for backend, Vite with Node for frontend (avoid Bun for dev server on Windows), MongoDB local/Atlas.
- Future: Vercel (Node), MongoDB Atlas; configure CORS/ENV.

## 14) Environment Variables (.env)
```
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
ADMIN_SECRET=aynnaghor-admin-2024
MONGODB_URI=mongodb://localhost:27017/aynnaghor
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 15) Implementation Phases
- Phase 1: Server skeleton, health routes, Mongo connect, Users + Cycles CRUD, auth.
- Phase 2: Meals/Expenses/Deposits CRUD + validation + rules.
- Phase 3: Settlement services (interim/final), dashboard summary.
- Phase 4: Hardening, tests, docs, seed scripts.

## 16) API Conventions
- Date fields: ISO date strings (store day precision where appropriate).
- All IDs: stringified ObjectId.
- Pagination (future): `?page=&limit=`; include `pagination` object in response.

## 17) Frontend Contract Notes
- Expose the following for Redux thunks/RTK Query:
  - Meals: list, upsert, delete, bulk, copy, summary
  - Expenses: list, create (regular/emergency), update, delete, summary
  - Deposits: list, create, update, delete, per-user and cycle summaries
  - Cycles: active, stats, close
  - Users: active, manager
- Ensure interim calculations exclude today and highlight yesterday in history tables.

## 18) Readiness Checklist (Definition of Done)
- [ ] Endpoints return correct shapes and status codes
- [ ] Money math uses Decimal.js everywhere
- [ ] Zod validation on all inputs
- [ ] Error handler returns normalized payloads
- [ ] Admin auth enforced for all protected routes
- [ ] Unit + integration tests pass
- [ ] ENV documented with .env.example
- [ ] README updated with run instructions

# Aynnaghor Meal Management System - Backend Requirements Document

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Data Models](#data-models)
4. [API Endpoints](#api-endpoints)
5. [Business Logic Requirements](#business-logic-requirements)
6. [Authentication & Authorization](#authentication--authorization)
7. [Data Validation](#data-validation)
8. [Error Handling](#error-handling)
9. [Performance Requirements](#performance-requirements)
10. [Security Requirements](#security-requirements)
11. [Testing Requirements](#testing-requirements)
12. [Deployment Requirements](#deployment-requirements)
13. [Technical Specifications](#technical-specifications)

## Project Overview

### Purpose
The Aynnaghor Meal Management System is a comprehensive solution for managing shared living expenses, meal tracking, and financial settlements for groups of 5-6 people living together (hostels, apartments, group houses).

### Key Features
- **Meal Tracking**: Daily meal entries (lunch, dinner, guest meals) for each user
- **Expense Management**: Shared and personal expenses with categorization
- **Deposit Tracking**: Individual contributions from members
- **Financial Settlement**: Monthly cycle-based settlements with precise calculations
- **Dashboard Analytics**: Real-time overview of current month's status
- **User Management**: Fixed user base with role-based access

### Target Users
- **5 Regular Members**: Active participants in meal sharing
- **1 Manager/Admin**: System administrator with full access
- **Future**: Scalable to support multiple groups/locations

## System Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React +      │◄──►│   (Express +    │◄──►│   (MongoDB +    │
│    Redux)       │    │    TypeScript)  │    │    Mongoose)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack
- **Backend Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Custom admin key system (MVP), JWT-ready (future)
- **Validation**: Zod schema validation
- **Testing**: Jest with supertest
- **Documentation**: OpenAPI/Swagger
- **Deployment**: Local development, future Vercel

### Project Structure
```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── models/          # Database schemas
│   ├── middleware/      # Custom middleware
│   ├── routes/          # API route definitions
│   ├── validation/      # Zod validation schemas
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── index.ts         # Application entry point
├── tests/               # Test files
├── docs/                # API documentation
└── package.json         # Dependencies and scripts
```

## Data Models

### Core Entities

#### 1. User Model
```typescript
interface User {
  _id: ObjectId;
  name: string;                    // Full name
  role: 'manager' | 'member';      // User role
  active: boolean;                 // Account status
  createdAt: string;               // ISO timestamp
  updatedAt: string;               // ISO timestamp
}
```

**Business Rules:**
- Only one manager allowed per system
- Users cannot be deleted, only deactivated
- Historical data preserved when users are deactivated

#### 2. Cycle Model
```typescript
interface Cycle {
  _id: ObjectId;
  name: string;                    // "March 2025"
  month: number;                   // 1-12
  year: number;                    // 4-digit year
  startDate: string;               // ISO timestamp (start of month)
  endDate: string;                 // ISO timestamp (end of month)
  status: 'open' | 'closed';       // Cycle status
  createdAt: string;               // ISO timestamp
  updatedAt: string;               // ISO timestamp
}
```

**Business Rules:**
- Only one active cycle allowed at a time
- Cycles represent monthly periods
- Cannot modify closed cycles
- Automatic cycle creation for new months

#### 3. MealEntry Model
```typescript
interface MealEntry {
  _id: ObjectId;
  cycleId: ObjectId;               // Reference to Cycle
  date: string;                    // ISO date string
  userId: ObjectId;                // Reference to User
  lunch: number;                   // 0 or 1
  dinner: number;                  // 0 or 1
  guestMeals: number;              // Integer >= 0
  note?: string;                   // Optional note
  createdAt: string;               // ISO timestamp
  updatedAt: string;               // ISO timestamp
}
```

**Business Rules:**
- Maximum 2 meals per user per day (1 lunch + 1 dinner)
- Guest meals unlimited but count under user's total
- One entry per user per date per cycle
- Cannot modify entries from closed cycles

#### 4. Expense Model
```typescript
interface Expense {
  _id: ObjectId;
  cycleId: ObjectId;               // Reference to Cycle
  date: string;                    // ISO date string
  amount: string;                   // Money as string for precision
  paidFrom: 'pool' | 'personal';   // Expense type
  payerUserId?: ObjectId;          // Required if personal
  note?: string;                   // Expense description
  createdAt: string;               // ISO timestamp
  updatedAt: string;               // ISO timestamp
}
```

**Business Rules:**
- One expense entry per day (excluding emergency expenses)
- Pool expenses split equally among active members
- Personal expenses credited to specific user's deposits
- Emergency expenses bypass daily limit (dashboard only)

#### 5. Deposit Model
```typescript
interface Deposit {
  _id: ObjectId;
  cycleId: ObjectId;               // Reference to Cycle
  userId: ObjectId;                // Reference to User
  date: string;                    // ISO date string
  amount: string;                   // Money as string for precision
  note?: string;                   // Optional note
  createdAt: string;               // ISO timestamp
  updatedAt: string;               // ISO timestamp
}
```

**Business Rules:**
- Deposits are always positive amounts
- Deposits credited to specific user
- Cannot modify deposits from closed cycles
- Historical deposit data preserved

#### 6. Settlement Model
```typescript
interface Settlement {
  _id: ObjectId;
  cycleId: ObjectId;               // Reference to Cycle
  perMealRate: string;             // Calculated rate
  totals: {
    totalDeposits: string;
    totalExpenses: string;
    totalMeals: number;
  };
  perUser: Array<{
    userId: ObjectId;
    meals: number;
    share: string;                 // Final rounded amount
    deposited: string;
    net: string;                   // deposited - share
  }>;
  closedAt: string;                // ISO timestamp
}
```

**Business Rules:**
- Generated only when cycle is closed
- Per-meal rate = total expenses / total meals
- Final amounts rounded to whole BDT
- All transactions flow through manager

## API Endpoints

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Headers
```
x-admin-key: {admin_secret_key}
```

### 1. Health & System Endpoints

#### GET /health
- **Purpose**: System health check
- **Response**: Server status, uptime, environment info
- **Authentication**: None required

#### GET /api/v1
- **Purpose**: API information and available endpoints
- **Response**: API version, status, endpoint list
- **Authentication**: None required

### 2. User Management Endpoints

#### GET /users
- **Purpose**: List all users
- **Query Parameters**: 
  - `active`: boolean (filter by status)
  - `role`: 'manager' | 'member' (filter by role)
- **Response**: Array of User objects
- **Authentication**: Admin required

#### GET /users/:id
- **Purpose**: Get specific user details
- **Response**: User object
- **Authentication**: Admin required

#### POST /users
- **Purpose**: Create new user
- **Body**: CreateUserDTO
- **Response**: Created User object
- **Authentication**: Admin required

#### PUT /users/:id
- **Purpose**: Update user information
- **Body**: UpdateUserDTO
- **Response**: Updated User object
- **Authentication**: Admin required

#### DELETE /users/:id
- **Purpose**: Deactivate user (soft delete)
- **Response**: Success message
- **Authentication**: Admin required

#### GET /users/active
- **Purpose**: Get all active users
- **Response**: Array of active User objects
- **Authentication**: Admin required

#### GET /users/manager
- **Purpose**: Get current manager
- **Response**: Manager User object
- **Authentication**: Admin required

### 3. Cycle Management Endpoints

#### GET /cycles
- **Purpose**: List all cycles
- **Query Parameters**:
  - `status`: 'open' | 'closed' (filter by status)
  - `month`: number (filter by month)
  - `year`: number (filter by year)
- **Response**: Array of Cycle objects
- **Authentication**: Admin required

#### GET /cycles/:id
- **Purpose**: Get specific cycle details
- **Response**: Cycle object
- **Authentication**: Admin required

#### POST /cycles
- **Purpose**: Create new cycle
- **Body**: CreateCycleDTO
- **Response**: Created Cycle object
- **Authentication**: Admin required

#### PUT /cycles/:id
- **Purpose**: Update cycle information
- **Body**: UpdateCycleDTO
- **Response**: Updated Cycle object
- **Authentication**: Admin required

#### POST /cycles/:id/close
- **Purpose**: Close a cycle and generate settlement
- **Response**: Settlement object
- **Authentication**: Admin required

#### DELETE /cycles/:id
- **Purpose**: Delete cycle (only if no related data)
- **Response**: Success message
- **Authentication**: Admin required

#### GET /cycles/active
- **Purpose**: Get current active cycle
- **Response**: Active Cycle object
- **Authentication**: Admin required

#### GET /cycles/:id/stats
- **Purpose**: Get cycle statistics
- **Response**: CycleStats object
- **Authentication**: Admin required

### 4. Meal Management Endpoints

#### GET /meals
- **Purpose**: List meal entries
- **Query Parameters**:
  - `cycleId`: string (required)
  - `date`: string (filter by date)
  - `userId`: string (filter by user)
  - `startDate`: string (date range start)
  - `endDate`: string (date range end)
- **Response**: Array of MealEntry objects
- **Authentication**: Admin required

#### GET /meals/:id
- **Purpose**: Get specific meal entry
- **Response**: MealEntry object
- **Authentication**: Admin required

#### POST /meals
- **Purpose**: Create meal entry
- **Body**: CreateMealEntryDTO
- **Response**: Created MealEntry object
- **Authentication**: Admin required

#### PUT /meals/:id
- **Purpose**: Update meal entry
- **Body**: UpdateMealEntryDTO
- **Response**: Updated MealEntry object
- **Authentication**: Admin required

#### DELETE /meals/:id
- **Purpose**: Delete meal entry
- **Response**: Success message
- **Authentication**: Admin required

#### POST /meals/bulk
- **Purpose**: Bulk create/update meal entries
- **Body**: BulkMealEntryDTO
- **Response**: Array of MealEntry objects
- **Authentication**: Admin required

#### POST /meals/copy
- **Purpose**: Copy meals from one date to another
- **Body**: CopyMealsDTO
- **Response**: Array of copied MealEntry objects
- **Authentication**: Admin required

#### GET /meals/summary/:cycleId
- **Purpose**: Get meal summary for a cycle
- **Response**: MealSummary object
- **Authentication**: Admin required

### 5. Expense Management Endpoints

#### GET /expenses
- **Purpose**: List expenses
- **Query Parameters**:
  - `cycleId`: string (required)
  - `date`: string (filter by date)
  - `paidFrom`: 'pool' | 'personal' (filter by type)
  - `payerUserId`: string (filter by payer)
  - `startDate`: string (date range start)
  - `endDate`: string (date range end)
- **Response**: Array of Expense objects
- **Authentication**: Admin required

#### GET /expenses/:id
- **Purpose**: Get specific expense
- **Response**: Expense object
- **Authentication**: Admin required

#### POST /expenses
- **Purpose**: Create regular expense
- **Body**: CreateExpenseDTO
- **Response**: Created Expense object
- **Authentication**: Admin required

#### POST /expenses/emergency
- **Purpose**: Create emergency expense (bypasses daily limit)
- **Body**: CreateExpenseDTO
- **Response**: Created Expense object
- **Authentication**: Admin required

#### PUT /expenses/:id
- **Purpose**: Update expense
- **Body**: UpdateExpenseDTO
- **Response**: Updated Expense object
- **Authentication**: Admin required

#### DELETE /expenses/:id
- **Purpose**: Delete expense
- **Response**: Success message
- **Authentication**: Admin required

#### GET /expenses/summary/:cycleId
- **Purpose**: Get expense summary for a cycle
- **Response**: ExpenseSummary object
- **Authentication**: Admin required

### 6. Deposit Management Endpoints

#### GET /deposits
- **Purpose**: List deposits
- **Query Parameters**:
  - `cycleId`: string (required)
  - `userId`: string (filter by user)
  - `date`: string (filter by date)
  - `startDate`: string (date range start)
  - `endDate`: string (date range end)
- **Response**: Array of Deposit objects
- **Authentication**: Admin required

#### GET /deposits/:id
- **Purpose**: Get specific deposit
- **Response**: Deposit object
- **Authentication**: Admin required

#### POST /deposits
- **Purpose**: Create deposit
- **Body**: CreateDepositDTO
- **Response**: Created Deposit object
- **Authentication**: Admin required

#### PUT /deposits/:id
- **Purpose**: Update deposit
- **Body**: UpdateDepositDTO
- **Response**: Updated Deposit object
- **Authentication**: Admin required

#### DELETE /deposits/:id
- **Purpose**: Delete deposit
- **Response**: Success message
- **Authentication**: Admin required

#### GET /deposits/summary/:cycleId
- **Purpose**: Get deposit summary for a cycle
- **Response**: DepositSummary object
- **Authentication**: Admin required

#### GET /deposits/user/:userId/:cycleId
- **Purpose**: Get user's total deposits for a cycle
- **Response**: UserDepositSummary object
- **Authentication**: Admin required

### 7. Settlement Endpoints

#### GET /settlements/interim/:cycleId
- **Purpose**: Get interim totals (up to yesterday)
- **Response**: InterimSettlement object
- **Authentication**: Admin required

#### GET /settlements/final/:cycleId
- **Purpose**: Get final settlement for closed cycle
- **Response**: Settlement object
- **Authentication**: Admin required

#### GET /settlements/dashboard/:cycleId
- **Purpose**: Get dashboard summary data
- **Response**: DashboardSummary object
- **Authentication**: Admin required

## Business Logic Requirements

### 1. Meal Management Rules
- **Daily Limits**: Maximum 2 meals per user per day (1 lunch + 1 dinner)
- **Guest Meals**: Unlimited but count under user's total
- **Validation**: Cannot have duplicate entries for same user/date/cycle
- **Cycle Constraints**: Cannot modify entries from closed cycles

### 2. Expense Management Rules
- **Daily Limit**: One expense entry per day (excluding emergency)
- **Emergency Expenses**: Dashboard quick entry bypasses daily limit
- **Expense Types**: 
  - Pool expenses: Split equally among active members
  - Personal expenses: Credited to specific user's deposits
- **Validation**: Cannot modify expenses from closed cycles

### 3. Financial Calculation Rules
- **Per-Meal Rate**: Total expenses ÷ Total meals
- **User Share**: User's total meals × Per-meal rate
- **Net Position**: User's deposits - User's share
- **Rounding**: Final settlement amounts rounded to whole BDT
- **Precision**: All calculations use decimal.js for accuracy

### 4. Cycle Management Rules
- **Single Active**: Only one cycle can be active at a time
- **Auto-Creation**: New cycles created automatically for new months
- **Closure**: Cycles can only be closed by manager
- **Settlement**: Final settlement generated automatically on closure

### 5. User Management Rules
- **Manager Role**: Only one manager allowed per system
- **Soft Delete**: Users cannot be deleted, only deactivated
- **Historical Data**: All user-related data preserved when deactivated
- **Active Status**: Only active users included in calculations

## Authentication & Authorization

### Current Implementation (MVP)
- **Method**: Custom admin key authentication
- **Header**: `x-admin-key: {secret_key}`
- **Secret**: Environment variable `ADMIN_SECRET`
- **Fallback**: Default secret `aynnaghor-admin-2024`

### Future Implementation
- **Method**: JWT-based authentication
- **Roles**: Manager, Member, Guest
- **Permissions**: Role-based access control
- **Sessions**: Secure session management

### Security Requirements
- **HTTPS**: Required in production
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: All inputs validated with Zod schemas
- **SQL Injection**: Prevented through Mongoose ODM
- **XSS Protection**: Helmet.js security headers

## Data Validation

### Validation Framework
- **Library**: Zod schema validation
- **Scope**: Request body, query parameters, URL parameters
- **Error Format**: Standardized error response with field details

### Validation Rules
- **Required Fields**: All required fields must be present
- **Data Types**: Strict type checking for all inputs
- **Business Rules**: Custom validation for business logic
- **Sanitization**: Input sanitization and normalization

### Error Response Format
```typescript
interface ValidationError {
  success: false;
  error: 'Validation failed';
  details: Array<{
    field: string;
    message: string;
  }>;
}
```

## Error Handling

### Error Categories
1. **Validation Errors**: Invalid input data (400)
2. **Authentication Errors**: Missing or invalid credentials (401)
3. **Authorization Errors**: Insufficient permissions (403)
4. **Not Found Errors**: Resource not found (404)
5. **Conflict Errors**: Duplicate or conflicting data (409)
6. **Server Errors**: Internal server errors (500)

### Error Response Format
```typescript
interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
  stack?: string; // Only in development
}
```

### Global Error Handler
- **Unhandled Errors**: Caught and formatted consistently
- **Development Mode**: Stack traces included
- **Production Mode**: Generic error messages
- **Logging**: All errors logged for monitoring

## Performance Requirements

### Response Times
- **Simple Queries**: < 100ms
- **Complex Queries**: < 500ms
- **Bulk Operations**: < 2 seconds
- **Dashboard Data**: < 1 second

### Throughput
- **Concurrent Users**: Support 50+ concurrent users
- **Request Rate**: Handle 1000+ requests per minute
- **Database**: Efficient queries with proper indexing

### Caching Strategy
- **Redis**: Session storage and caching
- **Database**: Query result caching
- **Static Data**: User and cycle data caching

## Security Requirements

### Data Protection
- **Encryption**: Sensitive data encrypted at rest
- **Transmission**: HTTPS/TLS for all communications
- **Access Control**: Role-based permissions
- **Audit Logs**: All operations logged

### API Security
- **Rate Limiting**: Prevent abuse and DDoS
- **Input Validation**: Prevent injection attacks
- **CORS**: Configured for frontend domain only
- **Headers**: Security headers via Helmet.js

### Environment Security
- **Secrets**: Environment variables for sensitive data
- **Database**: Secure database connections
- **Monitoring**: Security event monitoring
- **Updates**: Regular security updates

## Testing Requirements

### Test Coverage
- **Unit Tests**: 90%+ code coverage
- **Integration Tests**: All API endpoints tested
- **E2E Tests**: Critical user flows tested
- **Performance Tests**: Load and stress testing

### Testing Framework
- **Unit Testing**: Jest with supertest
- **Mocking**: Database and external service mocking
- **Test Data**: Seeded test database
- **CI/CD**: Automated testing on deployment

### Test Categories
1. **Unit Tests**: Individual functions and methods
2. **Integration Tests**: API endpoints and database operations
3. **E2E Tests**: Complete user workflows
4. **Performance Tests**: Load and stress testing
5. **Security Tests**: Authentication and authorization

## Deployment Requirements

### Development Environment
- **Local Development**: Docker Compose setup
- **Hot Reload**: Automatic server restart on changes
- **Environment**: Development configuration
- **Database**: Local MongoDB instance

### Production Environment
- **Platform**: Vercel deployment ready
- **Database**: MongoDB Atlas or similar
- **Environment**: Production configuration
- **Monitoring**: Health checks and logging

### Environment Variables
```bash
# Required
MONGODB_URI=mongodb://localhost:27017/aynnaghor
PORT=5000
NODE_ENV=development

# Optional
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ADMIN_SECRET=aynnaghor-admin-2024
```

## Technical Specifications

### System Requirements
- **Node.js**: Version 18+ (LTS)
- **MongoDB**: Version 6+
- **Memory**: Minimum 512MB RAM
- **Storage**: Minimum 1GB disk space
- **Network**: HTTP/HTTPS support

### Dependencies
```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.3",
  "cors": "^2.8.5",
  "helmet": "^7.1.0",
  "morgan": "^1.10.0",
  "dotenv": "^16.3.1",
  "zod": "^3.22.4",
  "express-rate-limit": "^7.1.5",
  "compression": "^1.7.4"
}
```

### Development Dependencies
```json
{
  "@types/express": "^4.17.21",
  "@types/cors": "^2.8.17",
  "@types/morgan": "^1.9.9",
  "@types/compression": "^1.7.5",
  "typescript": "^5.3.2",
  "jest": "^29.7.0",
  "ts-jest": "^29.1.1",
  "eslint": "^8.55.0"
}
```

### Database Schema Design
- **Collections**: users, cycles, meals, expenses, deposits, settlements
- **Indexes**: Optimized for common query patterns
- **Relationships**: Proper foreign key references
- **Validation**: Schema-level data validation

### API Response Format
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: any;
}
```

### Pagination Support
```typescript
interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
```

## Implementation Priority

### Phase 1 (MVP - Week 1-2)
1. Basic Express server setup
2. MongoDB connection and basic models
3. Authentication middleware
4. Core CRUD endpoints for meals, expenses, deposits
5. Basic validation and error handling

### Phase 2 (Core Features - Week 3-4)
1. Cycle management
2. Business logic implementation
3. Settlement calculations
4. Dashboard data aggregation
5. Comprehensive validation

### Phase 3 (Advanced Features - Week 5-6)
1. Bulk operations
2. Advanced queries and filtering
3. Performance optimization
4. Comprehensive testing
5. Documentation and deployment

### Phase 4 (Production Ready - Week 7-8)
1. Security hardening
2. Performance testing
3. Error monitoring
4. Production deployment
5. Maintenance and support

## Success Criteria

### Functional Requirements
- [ ] All API endpoints working correctly
- [ ] Business logic implemented accurately
- [ ] Data validation working properly
- [ ] Error handling comprehensive
- [ ] Authentication secure

### Non-Functional Requirements
- [ ] Response times within specified limits
- [ ] 90%+ test coverage achieved
- [ ] Security requirements met
- [ ] Documentation complete
- [ ] Deployment successful

### User Experience
- [ ] Frontend integration seamless
- [ ] API responses consistent
- [ ] Error messages helpful
- [ ] Performance satisfactory
- [ ] Reliability high

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Prepared By**: AI Assistant  
**Review Status**: Ready for Implementation
