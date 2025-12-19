# EU AI Act Audit Tool - Backend API

RESTful API for the EU AI Act Audit Tool with authentication, audit management, team collaboration, and file uploads.

## 🚀 Features

### Core Features
- ✅ **User Authentication**: JWT-based auth with bcrypt password hashing
- ✅ **Role-Based Access Control**: Admin, Auditor, Viewer roles
- ✅ **Audit Management**: Full CRUD operations for audits
- ✅ **Team Collaboration**: Share audits with permissions (viewer, editor, admin)
- ✅ **Threaded Comments**: Nested comment system with resolve/unresolve
- ✅ **File Uploads**: Document upload with access control
- ✅ **Audit Trail**: Complete history tracking of all changes
- ✅ **Database**: SQLite for easy development (PostgreSQL-ready)

### Security
- ✅ Helmet.js for security headers
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ CORS configured
- ✅ Input validation with express-validator
- ✅ Password hashing with bcrypt (salt rounds: 10)

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## 🔧 Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and adjust if needed:

```bash
cp .env.example .env
```

Default configuration uses SQLite (no additional setup required).

### 3. Run Database Migrations

The database will be automatically created and synced when you start the server.

## 🚀 Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

Server will start on `http://localhost:3001`

### Production Build

```bash
npm run build
npm start
```

## 📚 API Documentation

### Base URL

```
http://localhost:3001/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "organization": "ACME Corp",
  "role": "auditor"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "auditor"
  }
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith"
}
```

#### Change Password
```http
PUT /api/auth/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass123"
}
```

### Audit Endpoints

#### Create Audit
```http
POST /api/audits
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My AI System Audit",
  "description": "Audit for...",
  "systemInfo": {
    "domain": "Personal/HR",
    "useCase": "Automated hiring",
    "impactLevel": "high",
    "biometricOrSurveillance": false,
    "euImpact": true
  },
  "riskClass": "HIGH_RISK"
}
```

#### Get All Audits
```http
GET /api/audits?status=draft&page=1&limit=10&search=AI
Authorization: Bearer <token>
```

#### Get Single Audit
```http
GET /api/audits/:id
Authorization: Bearer <token>
```

#### Update Audit
```http
PUT /api/audits/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "in_progress"
}
```

#### Delete Audit
```http
DELETE /api/audits/:id
Authorization: Bearer <token>
```

#### Update Audit Answer
```http
PUT /api/audits/:id/answers
Authorization: Bearer <token>
Content-Type: application/json

{
  "requirementId": "RM-01",
  "status": "compliant",
  "notes": "Implemented risk management system"
}
```

#### Share Audit
```http
POST /api/audits/:id/share
Authorization: Bearer <token>
Content-Type: application/json

{
  "userEmail": "colleague@example.com",
  "permission": "editor"
}
```

Permissions: `viewer`, `editor`, `admin`

#### Get Audit Shares
```http
GET /api/audits/:id/shares
Authorization: Bearer <token>
```

#### Remove Share
```http
DELETE /api/audits/:id/shares/:shareId
Authorization: Bearer <token>
```

### Comment Endpoints

#### Create Comment
```http
POST /api/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "auditId": 1,
  "requirementId": "RM-01",
  "parentId": null,
  "content": "This requirement needs clarification"
}
```

#### Get Comments
```http
GET /api/comments/audit/:auditId?requirementId=RM-01
Authorization: Bearer <token>
```

#### Update Comment
```http
PUT /api/comments/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Updated comment text"
}
```

#### Delete Comment
```http
DELETE /api/comments/:id
Authorization: Bearer <token>
```

#### Toggle Resolved Status
```http
PATCH /api/comments/:id/resolve
Authorization: Bearer <token>
```

### File Endpoints

#### Upload File
```http
POST /api/files
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "file": <binary>,
  "auditId": 1,
  "requirementId": "RM-01",
  "description": "Risk management documentation"
}
```

Allowed file types:
- Images: jpeg, png, gif
- Documents: pdf, doc, docx, xls, xlsx
- Text: txt, csv

Max file size: 10MB

#### Get Files
```http
GET /api/files/audit/:auditId?requirementId=RM-01
Authorization: Bearer <token>
```

#### Download File
```http
GET /api/files/:id/download
Authorization: Bearer <token>
```

#### Delete File
```http
DELETE /api/files/:id
Authorization: Bearer <token>
```

### History Endpoints

#### Get Audit History
```http
GET /api/history/audit/:auditId?action=updated&page=1&limit=50
Authorization: Bearer <token>
```

#### Get Activity Summary
```http
GET /api/history/audit/:auditId/summary
Authorization: Bearer <token>
```

### Health Check

```http
GET /api/health
```

## 📊 Database Schema

### Tables

- **users**: User accounts with authentication
- **audits**: Main audit entities
- **audit_answers**: Requirement assessments
- **audit_shares**: Team collaboration and permissions
- **comments**: Threaded comment system
- **files**: Uploaded documents
- **audit_history**: Complete audit trail

### Relationships

- User → Audits (one-to-many)
- Audit → AuditAnswers (one-to-many)
- Audit → AuditShares (one-to-many)
- Audit → Comments (one-to-many)
- Audit → Files (one-to-many)
- Audit → AuditHistory (one-to-many)
- Comment → Comment (self-referencing for threading)

## 🔐 Security Notes

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### JWT Tokens

- Expiration: 7 days (configurable)
- Stored on client side
- Include in Authorization header: `Bearer <token>`

### Rate Limiting

- 100 requests per 15 minutes per IP
- Applies to all /api/* routes

## 🛠️ Development

### Project Structure

```
backend/
├── src/
│   ├── controllers/      # Request handlers
│   ├── models/           # Database models (Sequelize)
│   ├── routes/           # API routes
│   ├── middleware/       # Auth, error handling
│   ├── validators/       # Input validation
│   ├── config/           # Multer, database
│   ├── utils/            # JWT, helpers
│   └── server.ts         # Express app entry point
├── uploads/              # Uploaded files (gitignored)
├── .env                  # Environment variables
└── package.json
```

### Switching to PostgreSQL

Update `.env`:

```env
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eu_ai_act_audit
DB_USER=postgres
DB_PASSWORD=your_password
```

Update `src/database/connection.ts`:

```typescript
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  // ... rest of config
});
```

Install PostgreSQL driver:

```bash
npm install pg pg-hstore
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test
```

## 📝 License

MIT

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

---

**Version**: 1.0.0
**Last Updated**: 2025
