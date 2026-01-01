# Technical Requirements Document (TRD)
## EU AI Act Calmpliance Audit Platform

**Version:** 1.0
**Date:** December 2024
**Status:** Production-Ready MVP
**Classification:** Internal - Technical Team

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-12-17 | Development Team | Initial release |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Overview](#2-system-overview)
3. [Functional Requirements](#3-functional-requirements)
4. [Non-Functional Requirements](#4-non-functional-requirements)
5. [Technical Architecture](#5-technical-architecture)
6. [Technology Stack](#6-technology-stack)
7. [Database Schema](#7-database-schema)
8. [API Specifications](#8-api-specifications)
9. [Security Requirements](#9-security-requirements)
10. [Performance Requirements](#10-performance-requirements)
11. [Deployment Requirements](#11-deployment-requirements)
12. [Testing Requirements](#12-testing-requirements)
13. [Integration Requirements](#13-integration-requirements)
14. [Monitoring & Logging](#14-monitoring--logging)
15. [Scalability & Growth](#15-scalability--growth)

---

## 1. Executive Summary

### 1.1 Project Purpose
Development of a web-based SaaS platform to assist organizations in conducting systematic audits of AI systems according to EU AI Act requirements.

### 1.2 Scope
- **Phase 1 (Current):** MVP with core audit functionality, multi-user collaboration, file management
- **Phase 2 (Q1-Q2 2025):** Advanced features, ML-based recommendations, international expansion
- **Phase 3 (Q3-Q4 2025):** Enterprise features, white-label capabilities, API marketplace

### 1.3 Stakeholders

**Primary:**
- End Users: Compliance Officers, Auditors, Legal Teams
- System Administrators
- Product Management Team

**Secondary:**
- External Auditors (TÜV, BSI)
- Regulatory Authorities
- Third-party Integrators

---

## 2. System Overview

### 2.1 High-Level Description

The EU AI Act Audit Platform is a three-tier web application consisting of:
1. **Frontend:** React-based Single Page Application (SPA)
2. **Backend:** RESTful API built with Node.js/Express
3. **Database:** Relational database (PostgreSQL/SQLite)

### 2.2 System Context Diagram

```
┌─────────────┐
│   Browser   │
│  (Users)    │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────────┐
│   Frontend      │
│   React SPA     │
│   Port: 5173    │
└────────┬────────┘
         │ REST API
         │ (Axios)
         ▼
┌─────────────────┐
│   Backend       │
│   Express API   │
│   Port: 3001    │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌──────────┐
│  DB    │ │  File    │
│SQLite/ │ │ Storage  │
│Postgres│ │ (Local/  │
└────────┘ │  S3)     │
           └──────────┘
```

### 2.3 User Roles

| Role | Permissions | Use Case |
|------|-------------|----------|
| **Admin** | Full CRUD, user management, system configuration | System owner, compliance manager |
| **Auditor** | Create/edit audits, comment, upload files | Primary audit performer |
| **Viewer** | Read-only access | Stakeholder, management oversight |

---

## 3. Functional Requirements

### 3.1 User Management

**FR-UM-001: User Registration**
- **Priority:** P0 (Critical)
- **Description:** System shall allow new users to register with email and password
- **Acceptance Criteria:**
  - Email validation (valid format, unique)
  - Password requirements: min 8 chars, 1 uppercase, 1 lowercase, 1 number
  - Email confirmation (optional in MVP, required for production)
  - Auto-assignment of default role: "auditor"

**FR-UM-002: User Authentication**
- **Priority:** P0 (Critical)
- **Description:** System shall authenticate users via email/password
- **Acceptance Criteria:**
  - JWT token generation (7-day expiry)
  - Secure password hashing (bcrypt, 10 rounds)
  - Failed login attempt tracking (max 5 attempts/15min)
  - Session persistence in localStorage

**FR-UM-003: User Profile Management**
- **Priority:** P1 (High)
- **Description:** Users can view and edit their profile
- **Acceptance Criteria:**
  - Update: firstName, lastName, organization
  - Change password (requires current password)
  - Cannot change: email, role (admin-only)

### 3.2 Risk Classification

**FR-RC-001: Risk Assessment Wizard**
- **Priority:** P0 (Critical)
- **Description:** Guided wizard to classify AI system risk level
- **Acceptance Criteria:**
  - Multi-step form (3 steps)
  - Questions based on EU AI Act Annex III
  - Automatic classification: minimal, limited, high, unacceptable
  - Save draft capability
  - Export classification report (PDF)

**FR-RC-002: System Information Capture**
- **Priority:** P0 (Critical)
- **Description:** Collect metadata about AI system
- **Acceptance Criteria:**
  - Fields: systemName, description, category, provider, intendedPurpose
  - Optional fields: version, deploymentDate, userCount
  - JSON storage in database

### 3.3 Audit Management

**FR-AM-001: Create Audit**
- **Priority:** P0 (Critical)
- **Description:** Users can create new audits
- **Acceptance Criteria:**
  - Auto-assignment of audit owner (creator)
  - Status: draft (default)
  - Auto-generation of unique audit ID
  - Timestamp: createdAt, updatedAt

**FR-AM-002: Audit Checklist**
- **Priority:** P0 (Critical)
- **Description:** Dynamic checklist based on risk class
- **Acceptance Criteria:**
  - 85+ requirements across 8 categories
  - Status per requirement: open, compliant, partial, not_applicable
  - Notes field (markdown support)
  - Completion percentage calculation
  - Real-time update

**FR-AM-003: Audit Sharing**
- **Priority:** P1 (High)
- **Description:** Share audits with team members
- **Acceptance Criteria:**
  - Share by email (user must exist in system)
  - Permission levels: viewer, auditor, admin
  - Notification to shared user (email)
  - Revoke access capability

**FR-AM-004: Audit Status Management**
- **Priority:** P1 (High)
- **Description:** Update audit lifecycle status
- **Acceptance Criteria:**
  - States: draft, in_progress, completed, archived
  - State transitions tracked in history
  - Only owner/admin can change to completed/archived

### 3.4 Document Management

**FR-DM-001: File Upload**
- **Priority:** P1 (High)
- **Description:** Upload supporting documents
- **Acceptance Criteria:**
  - Max file size: 10 MB
  - Allowed formats: PDF, DOCX, XLSX, PNG, JPG, TXT
  - Multiple files per requirement
  - Virus scanning (production)
  - Storage: local filesystem (dev), S3 (production)

**FR-DM-002: File Download**
- **Priority:** P1 (High)
- **Description:** Download uploaded files
- **Acceptance Criteria:**
  - Access control (only audit participants)
  - Original filename preserved
  - Download counter

**FR-DM-003: File Deletion**
- **Priority:** P2 (Medium)
- **Description:** Delete uploaded files
- **Acceptance Criteria:**
  - Only uploader or audit owner can delete
  - Soft delete (mark as deleted, keep in DB)
  - Confirmation prompt

### 3.5 Collaboration

**FR-CL-001: Comments**
- **Priority:** P1 (High)
- **Description:** Add comments to requirements
- **Acceptance Criteria:**
  - Markdown support
  - Threading (replies to comments)
  - @mentions (future)
  - Resolved flag
  - Edit/delete own comments

**FR-CL-002: Activity History**
- **Priority:** P1 (High)
- **Description:** Track all audit activities
- **Acceptance Criteria:**
  - Actions: created, updated, shared, comment_added, file_uploaded
  - Metadata: userId, timestamp, ipAddress, changes (JSON)
  - Immutable log
  - Filter by action type, user, date range

### 3.6 Reporting

**FR-RP-001: Action Plan Generation**
- **Priority:** P1 (High)
- **Description:** Generate action plan from audit results
- **Acceptance Criteria:**
  - Extract all non-compliant/partial requirements
  - Prioritization: high/medium/low
  - Effort estimation (days)
  - Assign responsible person
  - Export as PDF, Excel

**FR-RP-002: Audit Summary Report**
- **Priority:** P2 (Medium)
- **Description:** Executive summary of audit
- **Acceptance Criteria:**
  - Overall compliance score
  - Charts: completion by category, status distribution
  - High-priority findings
  - Timeline
  - Export as PDF

---

## 4. Non-Functional Requirements

### 4.1 Performance

**NFR-PERF-001: Response Time**
- **Requirement:** API endpoints respond within 200ms (p95)
- **Critical endpoints:** <100ms (login, list audits)
- **Heavy endpoints:** <500ms (file upload, report generation)

**NFR-PERF-002: Throughput**
- **Requirement:** Support 100 concurrent users
- **Target:** 1,000 requests/minute
- **Database:** Max 50ms query time (p95)

**NFR-PERF-003: Page Load Time**
- **Requirement:** Initial page load <2 seconds (p90)
- **Target:** First Contentful Paint <1 second
- **Lighthouse Score:** >90

### 4.2 Scalability

**NFR-SCALE-001: Horizontal Scaling**
- **Requirement:** Backend stateless, supports multiple instances
- **Target:** Scale to 10,000 users without code changes
- **Load Balancing:** Round-robin, sticky sessions not required

**NFR-SCALE-002: Database Scaling**
- **Requirement:** Support read replicas
- **Target:** 1 million audits, 100,000 users
- **Indexing:** All foreign keys, search fields

### 4.3 Availability

**NFR-AVAIL-001: Uptime**
- **Requirement:** 99.5% uptime (MVP), 99.9% (production)
- **Downtime allowed:** ~3.5 hours/month (MVP), ~40 min/month (production)
- **Maintenance windows:** Weekly, off-peak hours

**NFR-AVAIL-002: Disaster Recovery**
- **Requirement:** RPO (Recovery Point Objective) <24 hours
- **RTO (Recovery Time Objective):** <4 hours
- **Backups:** Daily automated, 30-day retention

### 4.4 Security

**NFR-SEC-001: Authentication**
- **Requirement:** JWT-based authentication
- **Token expiry:** 7 days
- **Refresh tokens:** Not in MVP, required for production
- **Password policy:** See FR-UM-001

**NFR-SEC-002: Authorization**
- **Requirement:** Role-based access control (RBAC)
- **Enforcement:** Every API endpoint checks permissions
- **Audit trail:** All access attempts logged

**NFR-SEC-003: Data Encryption**
- **Requirement:** TLS 1.3 for data in transit
- **Target:** AES-256 for data at rest (production)
- **Passwords:** bcrypt with salt rounds = 10

**NFR-SEC-004: Vulnerability Management**
- **Requirement:** No critical CVEs in dependencies
- **Scanning:** Weekly automated scans (npm audit, Snyk)
- **Patching:** Critical vulnerabilities <7 days, High <30 days

### 4.5 Usability

**NFR-USE-001: Browser Support**
- **Requirement:** Support latest 2 versions of:
  - Chrome (desktop/mobile)
  - Firefox
  - Safari
  - Edge
- **Not supported:** IE11

**NFR-USE-002: Accessibility**
- **Requirement:** WCAG 2.1 Level AA compliance
- **Target:** Screen reader compatible
- **Keyboard navigation:** Full support

**NFR-USE-003: Internationalization**
- **Requirement:** MVP in German and English
- **Target (Phase 2):** French, Spanish, Italian, Polish
- **Date/Time:** Locale-aware formatting
- **Currency:** Euro (€) default

### 4.6 Maintainability

**NFR-MAINT-001: Code Quality**
- **Requirement:** TypeScript strict mode
- **Linting:** ESLint (Airbnb config)
- **Formatting:** Prettier
- **Test coverage:** >80% (unit + integration)

**NFR-MAINT-002: Documentation**
- **Requirement:** API documentation (OpenAPI/Swagger)
- **Code comments:** All public functions/classes
- **README:** Setup instructions, architecture diagrams

**NFR-MAINT-003: Logging**
- **Requirement:** Structured logging (JSON format)
- **Levels:** ERROR, WARN, INFO, DEBUG
- **Retention:** 90 days (dev), 1 year (production)

### 4.7 Compliance

**NFR-COMP-001: GDPR**
- **Requirement:** Full GDPR compliance
- **Data processing agreements:** Required for all users
- **Right to deletion:** User can delete account + data
- **Data export:** JSON export of all user data

**NFR-COMP-002: Data Residency**
- **Requirement:** Data stored in EU (production)
- **Hosting:** EU-based cloud providers only
- **No third-party transfers:** Without explicit consent

---

## 5. Technical Architecture

### 5.1 Architecture Pattern

**Pattern:** Three-tier architecture with RESTful API

**Tiers:**
1. **Presentation:** React SPA (client-side rendering)
2. **Business Logic:** Express.js REST API
3. **Data:** PostgreSQL/SQLite with ORM (Sequelize)

### 5.2 System Components

```
┌────────────────────────────────────────────────────────┐
│                   FRONTEND (React)                      │
├────────────────────────────────────────────────────────┤
│  Components:                                            │
│  - Pages (Login, Dashboard, Audit, etc.)               │
│  - Components (Forms, Tables, Modals)                  │
│  - Services (API Client, Auth Service)                 │
│  - State Management (Context API)                      │
└────────────────┬───────────────────────────────────────┘
                 │ HTTP/HTTPS (REST)
                 ▼
┌────────────────────────────────────────────────────────┐
│                 BACKEND (Express)                       │
├────────────────────────────────────────────────────────┤
│  Layers:                                                │
│  - Routes (API endpoints)                              │
│  - Controllers (Business logic)                        │
│  - Middleware (Auth, Validation, Error handling)       │
│  - Models (Sequelize ORM)                              │
│  - Utils (JWT, validators, helpers)                    │
└────────────────┬───────────────────────────────────────┘
                 │
       ┌─────────┴──────────┐
       ▼                    ▼
┌─────────────┐      ┌─────────────┐
│  Database   │      │ File System │
│  (SQLite/   │      │ (Local/S3)  │
│  Postgres)  │      │             │
└─────────────┘      └─────────────┘
```

### 5.3 Design Patterns

**Backend:**
- **MVC:** Model-View-Controller (Routes-Controllers-Models)
- **Repository Pattern:** Database abstraction via Sequelize
- **Middleware Chain:** Request processing pipeline
- **Dependency Injection:** Services injected into controllers

**Frontend:**
- **Component-Based:** Reusable React components
- **Container/Presentational:** Smart vs. Dumb components
- **Context API:** Global state management
- **Custom Hooks:** Reusable stateful logic

### 5.4 Communication Protocols

**Frontend ↔ Backend:**
- **Protocol:** HTTP/HTTPS
- **Format:** JSON
- **Authentication:** Bearer token in Authorization header
- **CORS:** Configured for localhost:5173 (dev), production domain

**Error Handling:**
- **Standard HTTP status codes:** 200, 201, 400, 401, 403, 404, 500
- **Error response format:**
```json
{
  "error": "Error message",
  "details": "Detailed error information",
  "code": "ERROR_CODE"
}
```

---

## 6. Technology Stack

### 6.1 Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | UI library |
| **TypeScript** | 5.6.2 | Type safety |
| **Vite** | 5.4.2 | Build tool, dev server |
| **Tailwind CSS** | 3.4.17 | Styling framework |
| **Axios** | 1.6.2 | HTTP client |
| **React Router** | 6.x | Client-side routing |

**Frontend Directory Structure:**
```
src/
├── components/       # Reusable UI components
├── pages/           # Route-level components
├── services/        # API clients, business logic
├── types/           # TypeScript type definitions
├── utils/           # Helper functions
├── assets/          # Static assets (images, fonts)
└── App.tsx          # Root component
```

### 6.2 Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ LTS | Runtime |
| **Express** | 4.21.1 | Web framework |
| **TypeScript** | 5.7.2 | Type safety |
| **Sequelize** | 6.37.5 | ORM |
| **SQLite3** | 5.1.7 | Database (dev) |
| **PostgreSQL** | 14+ | Database (production) |
| **bcrypt** | 5.1.1 | Password hashing |
| **jsonwebtoken** | 9.0.2 | JWT generation |
| **Multer** | 1.4.5 | File uploads |
| **Helmet** | 8.0.0 | Security headers |
| **express-validator** | 7.2.1 | Input validation |
| **cors** | 2.8.5 | CORS middleware |
| **dotenv** | 16.4.7 | Environment variables |

**Backend Directory Structure:**
```
src/
├── config/          # Configuration files
│   ├── multer.ts    # File upload config
│   └── ...
├── controllers/     # Request handlers
│   ├── authController.ts
│   ├── auditController.ts
│   └── ...
├── middleware/      # Express middleware
│   ├── auth.ts      # JWT verification
│   ├── errorHandler.ts
│   └── ...
├── models/          # Sequelize models
│   ├── User.ts
│   ├── Audit.ts
│   └── ...
├── routes/          # API routes
│   ├── authRoutes.ts
│   ├── auditRoutes.ts
│   └── ...
├── utils/           # Utility functions
│   ├── jwt.ts
│   └── ...
├── validators/      # Input validators
│   └── authValidators.ts
├── database/        # DB connection
│   └── connection.ts
└── server.ts        # Entry point
```

### 6.3 Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **nodemon** | Auto-restart on file changes |
| **ts-node** | TypeScript execution |
| **Concurrently** | Run multiple scripts |
| **Git** | Version control |

### 6.4 Testing Stack (Planned)

| Tool | Purpose |
|------|---------|
| **Jest** | Unit testing |
| **React Testing Library** | Component testing |
| **Supertest** | API testing |
| **Cypress** | E2E testing |

### 6.5 Deployment Stack (Planned)

| Tool | Purpose |
|------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **GitHub Actions** | CI/CD pipeline |
| **AWS/Azure/GCP** | Cloud hosting |
| **Nginx** | Reverse proxy, load balancing |

---

## 7. Database Schema

### 7.1 Database Technology

**Development:** SQLite 3.x
**Production:** PostgreSQL 14+

**ORM:** Sequelize (database-agnostic)

### 7.2 Entity-Relationship Diagram

```
┌─────────────┐
│    Users    │
└──────┬──────┘
       │ 1
       │
       │ N
       ▼
┌─────────────┐       ┌──────────────┐
│   Audits    │───N───│ AuditShares  │
└──────┬──────┘       └──────────────┘
       │ 1                    │ N
       │                      │
       │ N                    ▼
       ▼                 ┌─────────┐
┌──────────────┐         │  Users  │
│ AuditAnswers │         └─────────┘
└──────────────┘
       │ 1
       ▼
┌──────────────┐
│   Comments   │◄──┐ (self-referencing)
└──────────────┘   │
       │ N         │
       ▼           │
┌──────────────┐   │
│    Files     │   │
└──────────────┘   │
                   │
┌──────────────┐   │
│AuditHistory  │───┘
└──────────────┘
```

### 7.3 Table Definitions

#### 7.3.1 Users Table

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(255) NOT NULL,
  lastName VARCHAR(255) NOT NULL,
  organization VARCHAR(255),
  role ENUM('admin', 'auditor', 'viewer') DEFAULT 'auditor',
  isActive BOOLEAN DEFAULT 1,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

**Fields:**
- `id`: Auto-increment primary key
- `email`: Unique identifier for login
- `password`: bcrypt hash (not stored in plaintext)
- `firstName`, `lastName`: User's name
- `organization`: Company/organization name
- `role`: Access level (admin, auditor, viewer)
- `isActive`: Soft delete flag
- `createdAt`, `updatedAt`: Timestamps

#### 7.3.2 Audits Table

```sql
CREATE TABLE audits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  systemInfo JSON NOT NULL,
  riskClass ENUM('minimal', 'limited', 'high', 'unacceptable') NOT NULL,
  status ENUM('draft', 'in_progress', 'completed', 'archived') DEFAULT 'draft',
  completionPercentage INTEGER DEFAULT 0,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,

  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE NO ACTION
);

-- Indexes
CREATE INDEX idx_audits_userId ON audits(userId);
CREATE INDEX idx_audits_status ON audits(status);
CREATE INDEX idx_audits_riskClass ON audits(riskClass);
```

**Fields:**
- `id`: Auto-increment primary key
- `userId`: Owner (foreign key to users)
- `title`: Audit name/title
- `description`: Optional description
- `systemInfo`: JSON object with AI system metadata
  - Example: `{"systemName": "CV Screening AI", "category": "HR", "provider": "CompanyX"}`
- `riskClass`: EU AI Act risk classification
- `status`: Lifecycle status
- `completionPercentage`: 0-100, calculated from answers
- `createdAt`, `updatedAt`: Timestamps

#### 7.3.3 AuditAnswers Table

```sql
CREATE TABLE audit_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  auditId INTEGER NOT NULL,
  requirementId VARCHAR(255) NOT NULL,
  status ENUM('open', 'compliant', 'partial', 'not_applicable') NOT NULL,
  notes TEXT DEFAULT '',
  lastModifiedBy INTEGER NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,

  FOREIGN KEY (auditId) REFERENCES audits(id) ON DELETE NO ACTION,
  FOREIGN KEY (lastModifiedBy) REFERENCES users(id) ON DELETE NO ACTION,

  UNIQUE (auditId, requirementId)
);

-- Indexes
CREATE INDEX idx_audit_answers_auditId ON audit_answers(auditId);
CREATE UNIQUE INDEX idx_audit_answers_audit_requirement ON audit_answers(auditId, requirementId);
```

**Fields:**
- `id`: Auto-increment primary key
- `auditId`: Foreign key to audits
- `requirementId`: String identifier (e.g., "DQ-01" for Data Quality req #1)
- `status`: Compliance status
- `notes`: Markdown text, assessor comments
- `lastModifiedBy`: User who last updated (foreign key)
- Unique constraint: One answer per (audit, requirement) pair

#### 7.3.4 AuditShares Table

```sql
CREATE TABLE audit_shares (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  auditId INTEGER NOT NULL,
  userId INTEGER NOT NULL,
  sharedBy INTEGER NOT NULL,
  permission ENUM('viewer', 'auditor', 'admin') NOT NULL DEFAULT 'viewer',
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,

  FOREIGN KEY (auditId) REFERENCES audits(id) ON DELETE NO ACTION,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE NO ACTION,
  FOREIGN KEY (sharedBy) REFERENCES users(id) ON DELETE NO ACTION,

  UNIQUE (auditId, userId)
);

-- Indexes
CREATE INDEX idx_audit_shares_auditId ON audit_shares(auditId);
CREATE INDEX idx_audit_shares_userId ON audit_shares(userId);
CREATE UNIQUE INDEX idx_audit_shares_audit_user ON audit_shares(auditId, userId);
```

**Fields:**
- `id`: Auto-increment primary key
- `auditId`: Foreign key to audits
- `userId`: User with whom audit is shared
- `sharedBy`: User who shared the audit
- `permission`: Access level for shared user
- Unique constraint: User can be shared on an audit only once

#### 7.3.5 Comments Table

```sql
CREATE TABLE comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  auditId INTEGER NOT NULL,
  userId INTEGER NOT NULL,
  requirementId VARCHAR(255),
  parentId INTEGER,
  content TEXT NOT NULL,
  isResolved BOOLEAN DEFAULT 0,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,

  FOREIGN KEY (auditId) REFERENCES audits(id) ON DELETE NO ACTION,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE NO ACTION,
  FOREIGN KEY (parentId) REFERENCES comments(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_comments_auditId ON comments(auditId);
CREATE INDEX idx_comments_requirementId ON comments(requirementId);
CREATE INDEX idx_comments_parentId ON comments(parentId);
```

**Fields:**
- `id`: Auto-increment primary key
- `auditId`: Foreign key to audits
- `userId`: Comment author
- `requirementId`: Optional, links to specific requirement
- `parentId`: Self-referencing foreign key for threading
- `content`: Comment text (markdown)
- `isResolved`: Flag for discussion resolution

#### 7.3.6 Files Table

```sql
CREATE TABLE files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  auditId INTEGER NOT NULL,
  userId INTEGER NOT NULL,
  requirementId VARCHAR(255),
  filename VARCHAR(255) NOT NULL,
  originalName VARCHAR(255) NOT NULL,
  mimetype VARCHAR(255) NOT NULL,
  size INTEGER NOT NULL,
  path VARCHAR(255) NOT NULL,
  description TEXT,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,

  FOREIGN KEY (auditId) REFERENCES audits(id) ON DELETE NO ACTION,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE NO ACTION
);

-- Indexes
CREATE INDEX idx_files_auditId ON files(auditId);
CREATE INDEX idx_files_requirementId ON files(requirementId);
```

**Fields:**
- `id`: Auto-increment primary key
- `auditId`: Foreign key to audits
- `userId`: Uploader
- `requirementId`: Optional, links to requirement
- `filename`: Unique filename on disk (UUID-based)
- `originalName`: User's original filename
- `mimetype`: MIME type (e.g., "application/pdf")
- `size`: File size in bytes
- `path`: Storage path (local or S3 URL)
- `description`: Optional user description

#### 7.3.7 AuditHistory Table

```sql
CREATE TABLE audit_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  auditId INTEGER NOT NULL,
  userId INTEGER NOT NULL,
  action ENUM('created', 'updated', 'status_changed', 'shared', 'comment_added', 'file_uploaded', 'requirement_updated') NOT NULL,
  entityType VARCHAR(255),
  entityId INTEGER,
  changes JSON NOT NULL,
  ipAddress VARCHAR(255),
  createdAt DATETIME NOT NULL,

  FOREIGN KEY (auditId) REFERENCES audits(id) ON DELETE NO ACTION,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE NO ACTION
);

-- Indexes
CREATE INDEX idx_audit_history_auditId ON audit_history(auditId);
CREATE INDEX idx_audit_history_userId ON audit_history(userId);
CREATE INDEX idx_audit_history_action ON audit_history(action);
CREATE INDEX idx_audit_history_createdAt ON audit_history(createdAt);
```

**Fields:**
- `id`: Auto-increment primary key
- `auditId`: Foreign key to audits
- `userId`: User who performed action
- `action`: Type of action
- `entityType`: Optional, entity type modified (e.g., "requirement", "comment")
- `entityId`: Optional, ID of modified entity
- `changes`: JSON object with change details
  - Example: `{"field": "status", "oldValue": "draft", "newValue": "in_progress"}`
- `ipAddress`: User's IP for security audit
- `createdAt`: Timestamp (no updatedAt, immutable)

### 7.4 Data Migration Strategy

**Initial Setup:**
- Sequelize `sync()` creates all tables on first run
- Seed data: Create default admin user

**Future Migrations:**
- Sequelize CLI migrations for schema changes
- Version control migrations in Git
- Rollback capability for each migration

---

## 8. API Specifications

### 8.1 API Design Principles

- **RESTful:** Resource-oriented URLs
- **Stateless:** No server-side sessions (JWT tokens)
- **JSON:** Request/response bodies in JSON
- **Versioning:** `/api/v1/` prefix (future-proof)
- **HTTP Methods:** GET (read), POST (create), PUT/PATCH (update), DELETE (delete)

### 8.2 Base URL

**Development:** `http://localhost:3001/api`
**Production:** `https://api.euaiact-audit.com/api`

### 8.3 Authentication

All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

### 8.4 API Endpoints

#### 8.4.1 Authentication Endpoints

**POST /api/auth/register**
- **Description:** Register new user
- **Auth:** None
- **Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "organization": "Company Inc"
}
```
- **Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**POST /api/auth/login**
- **Description:** Authenticate user
- **Auth:** None
- **Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```
- **Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "role": "auditor"
  }
}
```

**GET /api/auth/profile**
- **Description:** Get current user profile
- **Auth:** Required
- **Response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "organization": "Company Inc",
  "role": "auditor"
}
```

**PUT /api/auth/profile**
- **Description:** Update user profile
- **Auth:** Required
- **Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "organization": "New Company"
}
```
- **Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": { /* updated user object */ }
}
```

**POST /api/auth/change-password**
- **Description:** Change user password
- **Auth:** Required
- **Request Body:**
```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewSecurePass456"
}
```
- **Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

#### 8.4.2 Audit Endpoints

**POST /api/audits**
- **Description:** Create new audit
- **Auth:** Required
- **Request Body:**
```json
{
  "title": "HR AI System Audit",
  "description": "Annual compliance audit",
  "systemInfo": {
    "systemName": "CV Screening AI",
    "category": "HR",
    "provider": "VendorX"
  },
  "riskClass": "high"
}
```
- **Response (201):**
```json
{
  "id": 1,
  "userId": 1,
  "title": "HR AI System Audit",
  "status": "draft",
  "completionPercentage": 0,
  "createdAt": "2024-12-17T10:00:00Z"
}
```

**GET /api/audits**
- **Description:** List all audits (owned + shared)
- **Auth:** Required
- **Query Params:**
  - `status`: Filter by status (draft, in_progress, completed, archived)
  - `riskClass`: Filter by risk class
  - `search`: Search in title/description
- **Response (200):**
```json
{
  "audits": [
    {
      "id": 1,
      "title": "HR AI System Audit",
      "riskClass": "high",
      "status": "in_progress",
      "completionPercentage": 45,
      "owner": {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe"
      },
      "sharedWith": [
        {"userId": 2, "permission": "viewer"}
      ],
      "createdAt": "2024-12-17T10:00:00Z"
    }
  ]
}
```

**GET /api/audits/:id**
- **Description:** Get audit details
- **Auth:** Required (must be owner or shared user)
- **Response (200):**
```json
{
  "id": 1,
  "title": "HR AI System Audit",
  "description": "Annual compliance audit",
  "systemInfo": { /* AI system metadata */ },
  "riskClass": "high",
  "status": "in_progress",
  "completionPercentage": 45,
  "owner": { /* user object */ },
  "answers": [ /* array of answers */ ],
  "createdAt": "2024-12-17T10:00:00Z"
}
```

**PUT /api/audits/:id**
- **Description:** Update audit metadata
- **Auth:** Required (owner or admin permission)
- **Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "status": "completed"
}
```
- **Response (200):**
```json
{
  "message": "Audit updated successfully",
  "audit": { /* updated audit object */ }
}
```

**DELETE /api/audits/:id**
- **Description:** Delete audit (soft delete)
- **Auth:** Required (owner only)
- **Response (200):**
```json
{
  "message": "Audit deleted successfully"
}
```

**POST /api/audits/:id/share**
- **Description:** Share audit with user
- **Auth:** Required (owner or admin)
- **Request Body:**
```json
{
  "email": "colleague@example.com",
  "permission": "auditor"
}
```
- **Response (201):**
```json
{
  "message": "Audit shared successfully",
  "share": {
    "userId": 2,
    "permission": "auditor"
  }
}
```

**PUT /api/audits/:id/answers**
- **Description:** Update requirement answer
- **Auth:** Required (auditor permission)
- **Request Body:**
```json
{
  "requirementId": "DQ-01",
  "status": "compliant",
  "notes": "Training data documented in compliance report"
}
```
- **Response (200):**
```json
{
  "message": "Answer updated successfully",
  "completionPercentage": 46
}
```

#### 8.4.3 Comment Endpoints

**POST /api/comments**
- **Description:** Add comment
- **Auth:** Required
- **Request Body:**
```json
{
  "auditId": 1,
  "requirementId": "DQ-01",
  "content": "Need to verify data source",
  "parentId": null
}
```
- **Response (201):**
```json
{
  "id": 1,
  "content": "Need to verify data source",
  "author": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe"
  },
  "createdAt": "2024-12-17T11:00:00Z"
}
```

**GET /api/comments**
- **Description:** List comments for audit
- **Auth:** Required
- **Query Params:**
  - `auditId`: Required
  - `requirementId`: Optional, filter by requirement
- **Response (200):**
```json
{
  "comments": [
    {
      "id": 1,
      "content": "Need to verify data source",
      "author": { /* user object */ },
      "replies": [ /* nested comments */ ],
      "isResolved": false,
      "createdAt": "2024-12-17T11:00:00Z"
    }
  ]
}
```

**PUT /api/comments/:id**
- **Description:** Update comment
- **Auth:** Required (author only)
- **Request Body:**
```json
{
  "content": "Updated comment text"
}
```

**DELETE /api/comments/:id**
- **Description:** Delete comment
- **Auth:** Required (author or audit owner)

**PATCH /api/comments/:id/resolve**
- **Description:** Toggle comment resolved status
- **Auth:** Required
- **Response (200):**
```json
{
  "message": "Comment resolved",
  "isResolved": true
}
```

#### 8.4.4 File Endpoints

**POST /api/files/upload**
- **Description:** Upload file
- **Auth:** Required
- **Request:** multipart/form-data
  - `file`: File (max 10 MB)
  - `auditId`: Integer
  - `requirementId`: String (optional)
  - `description`: String (optional)
- **Response (201):**
```json
{
  "message": "File uploaded successfully",
  "file": {
    "id": 1,
    "filename": "uuid-v4-filename.pdf",
    "originalName": "compliance-report.pdf",
    "mimetype": "application/pdf",
    "size": 1024000,
    "url": "/api/files/1/download"
  }
}
```

**GET /api/files/:id/download**
- **Description:** Download file
- **Auth:** Required (audit participant)
- **Response:** File stream

**DELETE /api/files/:id**
- **Description:** Delete file
- **Auth:** Required (uploader or audit owner)
- **Response (200):**
```json
{
  "message": "File deleted successfully"
}
```

#### 8.4.5 History Endpoints

**GET /api/history/:auditId**
- **Description:** Get audit activity history
- **Auth:** Required (audit participant)
- **Query Params:**
  - `action`: Filter by action type
  - `userId`: Filter by user
  - `startDate`, `endDate`: Date range
- **Response (200):**
```json
{
  "history": [
    {
      "id": 1,
      "action": "requirement_updated",
      "user": { /* user object */ },
      "changes": {
        "requirementId": "DQ-01",
        "field": "status",
        "oldValue": "open",
        "newValue": "compliant"
      },
      "ipAddress": "192.168.1.1",
      "createdAt": "2024-12-17T12:00:00Z"
    }
  ]
}
```

**GET /api/history/:auditId/summary**
- **Description:** Get audit activity summary
- **Auth:** Required
- **Response (200):**
```json
{
  "totalActions": 45,
  "byAction": {
    "requirement_updated": 20,
    "comment_added": 15,
    "file_uploaded": 10
  },
  "byUser": {
    "1": 30,
    "2": 15
  },
  "recentActivity": [ /* last 10 actions */ ]
}
```

### 8.5 Error Responses

**Standard Error Format:**
```json
{
  "error": "Human-readable error message",
  "details": "Detailed technical information",
  "code": "ERROR_CODE"
}
```

**Common Status Codes:**
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource doesn't exist
- `409 Conflict`: Duplicate resource (e.g., email already exists)
- `422 Unprocessable Entity`: Validation failed
- `500 Internal Server Error`: Server error

**Example Validation Error:**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ],
  "code": "VALIDATION_ERROR"
}
```

### 8.6 Rate Limiting

**Limits:**
- **Default:** 100 requests per 15 minutes per IP
- **Authentication endpoints:** 10 requests per 15 minutes (brute force protection)
- **File upload:** 20 requests per hour

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1702819200
```

**Response when limit exceeded (429):**
```json
{
  "error": "Too many requests",
  "details": "Rate limit exceeded. Try again in 10 minutes",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

---

## 9. Security Requirements

### 9.1 Authentication & Authorization

**JWT Configuration:**
- **Algorithm:** HS256 (HMAC with SHA-256)
- **Secret:** 256-bit random string (stored in environment variable)
- **Expiry:** 7 days (configurable)
- **Payload:**
```json
{
  "userId": 1,
  "email": "user@example.com",
  "role": "auditor",
  "iat": 1702819200,
  "exp": 1703424000
}
```

**Token Storage:**
- **Frontend:** localStorage (MVP), httpOnly cookies (production)
- **Backend:** No storage (stateless)

**Password Policy:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- Optional: 1 special character (production)

**Password Hashing:**
- Algorithm: bcrypt
- Salt rounds: 10
- Rainbow table protection: Yes (via salt)

### 9.2 Input Validation

**All user inputs validated:**
- **Server-side:** express-validator (primary defense)
- **Client-side:** HTML5 validation + React state (UX improvement)

**Validation Rules:**
- Email: RFC 5322 format
- Strings: Max length limits (prevent DoS)
- Integers: Min/max bounds
- File uploads: MIME type whitelist, size limit
- JSON: Schema validation

**SQL Injection Prevention:**
- Sequelize ORM parameterized queries
- No raw SQL queries (except migrations)

**XSS Prevention:**
- React auto-escapes output (dangerouslySetInnerHTML avoided)
- Content-Security-Policy header
- Input sanitization for markdown (future: DOMPurify)

### 9.3 HTTPS/TLS

**Development:**
- HTTP allowed (localhost only)

**Production:**
- HTTPS enforced (301 redirect from HTTP)
- TLS 1.3 minimum
- Certificate: Let's Encrypt or commercial CA
- HSTS header: `max-age=31536000; includeSubDomains`

### 9.4 Security Headers

**Helmet.js Configuration:**
```javascript
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Vite requires unsafe-inline in dev
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
  },
})
```

**Headers Applied:**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`
- `Content-Security-Policy: ...`

### 9.5 CORS Configuration

**Development:**
```javascript
cors({
  origin: 'http://localhost:5173',
  credentials: true,
})
```

**Production:**
```javascript
cors({
  origin: process.env.CORS_ORIGIN, // https://app.euaiact-audit.com
  credentials: true,
})
```

### 9.6 File Upload Security

**Restrictions:**
- Max size: 10 MB
- Allowed MIME types:
  - `application/pdf`
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (DOCX)
  - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (XLSX)
  - `image/png`, `image/jpeg`
  - `text/plain`
- Filename sanitization: UUID-based filenames (prevent path traversal)
- Storage isolation: Files stored outside web root
- Virus scanning: Planned for production (ClamAV)

### 9.7 Audit Logging

**Security Events Logged:**
- Failed login attempts (IP, timestamp)
- Password changes
- Role changes (admin actions)
- File uploads/downloads
- Data exports
- Audit sharing

**Log Format:**
```json
{
  "timestamp": "2024-12-17T12:00:00Z",
  "event": "failed_login",
  "userId": null,
  "ipAddress": "192.168.1.1",
  "details": {
    "email": "user@example.com",
    "reason": "invalid_password"
  }
}
```

### 9.8 Data Privacy

**GDPR Compliance:**
- User consent for data processing (required)
- Right to access: Export user data (JSON)
- Right to erasure: Delete user account + cascade delete audits
- Data portability: Export format in JSON
- Privacy policy acceptance (checkbox on registration)

**PII Minimization:**
- Only collect necessary data
- No tracking cookies (MVP)
- IP addresses anonymized in logs (last octet zeroed)

### 9.9 Dependency Security

**Automated Scanning:**
- `npm audit` on every CI/CD run
- Snyk integration (planned)
- Dependabot alerts (GitHub)

**Update Policy:**
- Critical vulnerabilities: Patch within 7 days
- High vulnerabilities: Patch within 30 days
- Medium/Low: Review quarterly

---

## 10. Performance Requirements

### 10.1 Response Time Targets

| Endpoint Category | p50 | p95 | p99 |
|-------------------|-----|-----|-----|
| Authentication | 50ms | 100ms | 200ms |
| List/Read (simple) | 30ms | 100ms | 200ms |
| Create/Update | 100ms | 200ms | 500ms |
| File Upload | 500ms | 2s | 5s |
| Report Generation | 1s | 3s | 5s |

### 10.2 Database Performance

**Query Optimization:**
- All foreign keys indexed
- Full-text search indexes (planned)
- Query analysis with `EXPLAIN`
- N+1 query prevention (Sequelize eager loading)

**Connection Pooling:**
- Min connections: 5
- Max connections: 20
- Idle timeout: 30 seconds

### 10.3 Frontend Performance

**Targets:**
- First Contentful Paint (FCP): <1s
- Largest Contentful Paint (LCP): <2.5s
- Time to Interactive (TTI): <3s
- Cumulative Layout Shift (CLS): <0.1

**Optimizations:**
- Code splitting (React lazy + Suspense)
- Tree shaking (Vite automatic)
- Image optimization (WebP, lazy loading)
- CSS purging (Tailwind production build)
- Minification (Vite automatic)

**Bundle Size Targets:**
- Initial JS bundle: <200 KB (gzipped)
- Initial CSS: <50 KB (gzipped)
- Total page weight: <500 KB

### 10.4 Caching Strategy

**Backend:**
- Static assets: Cache-Control: max-age=31536000
- API responses: No caching (dynamic data)
- Future: Redis for session data, API response caching

**Frontend:**
- Service worker (planned for PWA)
- Browser caching via Cache-Control headers
- localStorage for user preferences

### 10.5 CDN Strategy (Production)

- Static assets served via CDN (CloudFront, Cloudflare)
- Geographic distribution: EU regions prioritized
- Cache invalidation on deployment

---

## 11. Deployment Requirements

### 11.1 Environment Configuration

**Environment Variables:**

**Backend (.env):**
```bash
# Server
NODE_ENV=production
PORT=3001

# Database
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=euaiact_audit
DB_USER=dbuser
DB_PASSWORD=securepassword

# JWT
JWT_SECRET=256-bit-random-string
JWT_EXPIRES_IN=7d

# File Upload
UPLOAD_DIR=/var/uploads
MAX_FILE_SIZE=10485760

# CORS
CORS_ORIGIN=https://app.euaiact-audit.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Frontend (.env):**
```bash
VITE_API_URL=https://api.euaiact-audit.com/api
```

### 11.2 Docker Configuration

**Backend Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["node", "dist/server.js"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
```

**Docker Compose:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: euaiact_audit
      POSTGRES_USER: dbuser
      POSTGRES_PASSWORD: securepassword
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_DIALECT: postgres
    depends_on:
      - postgres
    ports:
      - "3001:3001"
    volumes:
      - uploads:/var/uploads

  frontend:
    build: ./
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
  uploads:
```

### 11.3 CI/CD Pipeline

**GitHub Actions Workflow:**

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      # Backend tests
      - name: Backend Tests
        run: |
          cd backend
          npm ci
          npm run lint
          npm run test
          npm run build

      # Frontend tests
      - name: Frontend Tests
        run: |
          npm ci
          npm run lint
          npm run test
          npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Production
        run: |
          # Docker build + push
          # Deployment scripts
```

### 11.4 Hosting Requirements

**Infrastructure:**
- **Cloud Provider:** AWS, Azure, or GCP
- **Region:** EU (GDPR compliance)
- **Compute:**
  - Backend: 2 vCPU, 4 GB RAM (minimum)
  - Frontend: Static hosting (S3 + CloudFront or equivalent)
- **Database:** Managed PostgreSQL (RDS, Azure Database, Cloud SQL)
  - Instance: db.t3.medium or equivalent
  - Storage: 100 GB (SSD)
  - Backups: Daily automated, 30-day retention

**Network:**
- Load Balancer (Application Load Balancer)
- Auto-scaling group (min: 2, max: 10 instances)
- VPC with private subnets for database

### 11.5 Monitoring & Alerting

**Tools (Planned):**
- **APM:** New Relic, Datadog, or Application Insights
- **Logs:** CloudWatch, Stackdriver, or ELK stack
- **Uptime:** UptimeRobot, Pingdom
- **Error Tracking:** Sentry

**Alerts:**
- API response time >500ms (p95)
- Error rate >1%
- Database connection pool exhausted
- Disk usage >80%
- Memory usage >85%
- 5xx errors

---

## 12. Testing Requirements

### 12.1 Testing Strategy

**Testing Pyramid:**
```
     /\
    /E2E\         10%  (End-to-End)
   /------\
  / Integr \      20%  (Integration)
 /----------\
/   Unit     \    70%  (Unit)
--------------
```

### 12.2 Unit Testing

**Backend (Jest):**
- All utility functions (jwt.ts, validators, etc.)
- Model methods
- Business logic in controllers
- **Target Coverage:** >80%

**Example:**
```typescript
// jwt.test.ts
describe('JWT Utils', () => {
  it('should generate valid token', () => {
    const payload = { userId: 1, email: 'test@example.com', role: 'auditor' };
    const token = generateToken(payload);
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(1);
  });
});
```

**Frontend (Jest + React Testing Library):**
- Component rendering
- User interactions (click, input)
- State management
- API service methods
- **Target Coverage:** >75%

### 12.3 Integration Testing

**API Integration Tests (Supertest):**
- Test complete request/response cycles
- Database interactions
- Authentication flows
- File uploads

**Example:**
```typescript
describe('POST /api/auth/login', () => {
  it('should login user and return token', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'Password123' });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });
});
```

### 12.4 End-to-End Testing

**Tool:** Cypress

**Test Scenarios:**
- User registration → login → create audit → complete audit → logout
- File upload → download
- Audit sharing → collaboration
- Comment threading

**Example:**
```typescript
describe('Audit Flow', () => {
  it('should create and complete audit', () => {
    cy.visit('/login');
    cy.get('input[name=email]').type('test@example.com');
    cy.get('input[name=password]').type('Password123');
    cy.get('button[type=submit]').click();

    cy.url().should('include', '/dashboard');
    cy.contains('Create New Audit').click();
    // ... rest of flow
  });
});
```

### 12.5 Performance Testing

**Tool:** Apache JMeter or k6

**Scenarios:**
- Load test: 100 concurrent users
- Stress test: Increase load until failure
- Spike test: Sudden traffic increase
- Endurance test: Sustained load over 24 hours

**Acceptance Criteria:**
- All requests <500ms under normal load
- No errors under 100 concurrent users
- Graceful degradation under stress

### 12.6 Security Testing

**Automated:**
- npm audit (dependencies)
- OWASP ZAP (web vulnerabilities)
- Snyk (code + dependencies)

**Manual:**
- Penetration testing (annual, external auditor)
- Code review for security issues

### 12.7 Accessibility Testing

**Automated:**
- axe DevTools (browser extension)
- Lighthouse CI

**Manual:**
- Screen reader testing (NVDA, JAWS)
- Keyboard navigation
- Color contrast checks

---

## 13. Integration Requirements

### 13.1 Third-Party Integrations (Planned)

**Email Service:**
- **Provider:** SendGrid, AWS SES, or Mailgun
- **Use Cases:**
  - User registration confirmation
  - Audit sharing notifications
  - Password reset
  - Activity digests (weekly)

**File Storage:**
- **Development:** Local filesystem
- **Production:** AWS S3, Azure Blob Storage, or Google Cloud Storage
- **Features:** Versioning, encryption at rest, lifecycle policies

**Payment Gateway (Future):**
- **Provider:** Stripe
- **Use Cases:** Subscription billing, invoicing

**Analytics:**
- **Provider:** Plausible (privacy-friendly) or Google Analytics
- **Tracking:** Page views, user flows, conversion funnels

### 13.2 API Integrations (Future)

**White-Label API:**
- Allow third-party applications to embed audit functionality
- OAuth 2.0 authentication
- Rate limiting per API key
- Usage tracking & billing

**Webhook Support:**
- Notify external systems on events (audit completed, file uploaded)
- Retry logic for failed deliveries
- HMAC signature verification

---

## 14. Monitoring & Logging

### 14.1 Application Logging

**Log Levels:**
- **ERROR:** Unhandled exceptions, critical failures
- **WARN:** Deprecated API usage, rate limiting
- **INFO:** Startup, shutdown, major state changes
- **DEBUG:** Detailed diagnostic information

**Log Format (JSON):**
```json
{
  "timestamp": "2024-12-17T12:00:00Z",
  "level": "INFO",
  "message": "User logged in",
  "userId": 1,
  "ip": "192.168.1.1",
  "requestId": "uuid-v4"
}
```

**Log Destinations:**
- **Development:** Console (colorized)
- **Production:** File + Cloud logging service (CloudWatch, Stackdriver)

### 14.2 Metrics

**System Metrics:**
- CPU usage
- Memory usage
- Disk I/O
- Network I/O

**Application Metrics:**
- Request count (by endpoint, status code)
- Response time (p50, p95, p99)
- Database query count
- Active user sessions

**Business Metrics:**
- New user registrations
- Audits created
- Completion rate
- Average time to complete audit

### 14.3 Health Checks

**Endpoint:** `GET /api/health`
- **Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2024-12-17T12:00:00Z",
  "uptime": 86400,
  "database": "connected",
  "version": "1.0.0"
}
```

**Checks:**
- Database connectivity
- File storage accessibility
- Memory usage <90%

---

## 15. Scalability & Growth

### 15.1 Horizontal Scaling

**Backend:**
- Stateless architecture (no in-memory sessions)
- Load balancer distributes traffic
- Database connection pooling
- Future: Redis for shared state (rate limiting, sessions)

**Database:**
- Read replicas for heavy read operations
- Connection pooling per instance
- Query optimization
- Future: Sharding by tenant (multi-tenancy)

### 15.2 Caching Strategy

**Phase 1 (MVP):**
- Browser caching (static assets)
- Database query result caching (Sequelize built-in)

**Phase 2:**
- Redis for API response caching
- Cache invalidation on data changes
- CDN caching for static assets

### 15.3 Future Enhancements

**Multi-Tenancy:**
- Isolated databases per enterprise customer
- Tenant-aware queries
- Custom branding per tenant

**Microservices (Long-term):**
- Audit Service
- User Service
- File Service
- Notification Service
- Reporting Service

**Machine Learning:**
- Auto-classification of requirements
- Compliance score prediction
- Anomaly detection

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **Audit** | Systematic examination of an AI system for EU AI Act compliance |
| **Risk Class** | EU AI Act classification: minimal, limited, high, unacceptable |
| **Requirement** | Specific regulatory obligation from EU AI Act |
| **Compliance Status** | Assessment result: open, compliant, partial, not_applicable |
| **JWT** | JSON Web Token, used for authentication |
| **ORM** | Object-Relational Mapping, database abstraction (Sequelize) |
| **SPA** | Single Page Application, client-side rendered web app |
| **REST** | Representational State Transfer, API architectural style |
| **CRUD** | Create, Read, Update, Delete operations |

---

## Appendix B: Acronyms

| Acronym | Full Form |
|---------|-----------|
| API | Application Programming Interface |
| CORS | Cross-Origin Resource Sharing |
| CSRF | Cross-Site Request Forgery |
| GDPR | General Data Protection Regulation |
| HTTPS | Hypertext Transfer Protocol Secure |
| JWT | JSON Web Token |
| ORM | Object-Relational Mapping |
| RBAC | Role-Based Access Control |
| REST | Representational State Transfer |
| SPA | Single Page Application |
| SQL | Structured Query Language |
| TLS | Transport Layer Security |
| XSS | Cross-Site Scripting |

---

## Appendix C: References

1. **EU AI Act:** Official EU regulation (link to EUR-Lex)
2. **GDPR:** Regulation (EU) 2016/679
3. **OWASP Top 10:** Web application security risks
4. **WCAG 2.1:** Web Content Accessibility Guidelines
5. **REST API Design:** Best practices (RFC 7231)
6. **Sequelize Documentation:** https://sequelize.org/
7. **React Documentation:** https://react.dev/
8. **Express Documentation:** https://expressjs.com/

---

**Document Version:** 1.0
**Last Updated:** December 17, 2024
**Next Review:** February 2025
**Owner:** Technical Team
**Status:** Active
