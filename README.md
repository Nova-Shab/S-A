# EU AI Act Scanner + Audit Tools

Eine integrierte Plattform für EU AI Act Calmpliance-Prüfung, bestehend aus einem **automatisierten Scanner** und umfassenden **Audit-Tools**.

## Funktionen

### Scanner
- **Automatische Compliance-Analyse** von KI-Systemen
- **URL- oder Beschreibungs-basierte** Eingabe
- **GPT-4 basierte** Risikobewertung
- **PDF-Report-Generierung** mit Handlungsempfehlungen
- Powered by n8n Workflow-Automatisierung

### Audit Tools (Demo)
- **Risikostufen-Ermittlung** (Prohibited, High Risk, Limited Risk, Minimal Risk)
- **Strukturierte Audit-Checklisten** für EU AI Act Anforderungen
- **Automatischer Maßnahmenkatalog** mit konkreten Handlungsempfehlungen
- **Lead-Generierung** über Demo-Zugang

## Quick Start

### Voraussetzungen
- Node.js 18+
- npm oder pnpm

### Installation

```bash
# 1. Frontend-Abhängigkeiten installieren
npm install

# 2. Backend-Abhängigkeiten installieren
cd backend && npm install && cd ..
```

### Umgebungsvariablen

Backend-Konfiguration (`.env` im `backend/` Ordner):

```env
# Demo-Konfiguration
DEMO_ENABLED=true        # Demo-Button anzeigen
DEMO_AUTO_GRANT=true     # Automatische Freischaltung (true) oder manuelle Genehmigung (false)

# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key
DEMO_JWT_SECRET=your-demo-secret-key
```

### Starten

```bash
# Terminal 1: Backend starten
cd backend && npm run dev

# Terminal 2: Frontend starten (im Hauptverzeichnis)
npm run dev
```

Die Anwendung ist dann verfügbar unter:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

## Projektstruktur

```
S-A/
├── src/                          # Frontend (React + TypeScript + Vite)
│   ├── components/
│   │   ├── Navigation.tsx        # Top-Navigation mit "Audit Tools (Demo)"
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── ...
│   ├── pages/
│   │   ├── DashboardPage.tsx     # Audit-Dashboard
│   │   ├── ScannerPage.tsx       # Compliance-Scanner
│   │   ├── DemoAccessPage.tsx    # Lead-Formular für Demo-Zugang
│   │   ├── AuditToolsPage.tsx    # Demo Audit-Tools
│   │   └── ...
│   ├── services/
│   │   ├── authService.ts        # Authentifizierung
│   │   ├── demoService.ts        # Demo-Zugriffsverwaltung
│   │   └── ...
│   └── App.tsx
│
├── backend/                       # Backend (Express + TypeScript)
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Audit.ts
│   │   │   ├── DemoLead.ts       # Lead-Speicherung für Demo-Anfragen
│   │   │   └── ...
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── auditRoutes.ts
│   │   │   ├── demoRoutes.ts     # Demo-API Endpoints
│   │   │   └── ...
│   │   ├── controllers/
│   │   │   ├── demoController.ts # Demo-Logik
│   │   │   └── ...
│   │   └── server.ts
│   └── .env
│
└── package.json
```

## Demo-Zugang Flow

1. User klickt auf **"Audit Tools (Demo)"** in der Navigation
2. Lead-Formular wird angezeigt (Vorname, Nachname, E-Mail, Unternehmen, Rolle, Datenschutz)
3. Nach Absenden:
   - **DEMO_AUTO_GRANT=true**: Sofortige Freischaltung + JWT-Token
   - **DEMO_AUTO_GRANT=false**: Anfrage wird gespeichert, manuelle Genehmigung erforderlich
4. Bei Freischaltung: Zugriff auf Audit Tools für 7 Tage

## API Endpoints

### Demo API (`/api/demo`)

| Method | Endpoint | Beschreibung |
|--------|----------|--------------|
| GET | `/status` | Prüft ob Demo aktiviert ist |
| POST | `/request` | Demo-Zugang anfordern (Lead speichern) |
| GET | `/verify` | Demo-Token verifizieren |
| GET | `/leads` | Admin: Alle Leads abrufen |
| POST | `/leads/:id/grant` | Admin: Demo freischalten |
| POST | `/leads/:id/revoke` | Admin: Demo widerrufen |

### Auth API (`/api/auth`)

| Method | Endpoint | Beschreibung |
|--------|----------|--------------|
| POST | `/register` | Neuen Account erstellen |
| POST | `/login` | Anmelden |
| GET | `/profile` | Profil abrufen |

## Konfigurationsoptionen

| Variable | Typ | Default | Beschreibung |
|----------|-----|---------|--------------|
| `DEMO_ENABLED` | boolean | `true` | Demo-Feature ein-/ausschalten |
| `DEMO_AUTO_GRANT` | boolean | `true` | Automatische Freischaltung |
| `DEMO_TOKEN_EXPIRY` | string | `7d` | Gültigkeitsdauer des Demo-Zugangs |

## Technologie-Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Axios

### Backend
- Express + TypeScript
- Sequelize ORM
- SQLite (Entwicklung) / PostgreSQL (Produktion)
- JWT Authentication
- express-validator

## Build & Deployment

```bash
# Frontend Build
npm run build

# Backend Build
cd backend && npm run build

# Starten in Produktion
cd backend && npm start
```

## Datenschutz

- Lead-Daten werden nur lokal in der SQLite-Datenbank gespeichert
- Kein Drittanbieter-Tracking
- Datenschutzerklärung muss vor Demo-Anfrage akzeptiert werden

## Lizenz

Prototyp für Demonstrationszwecke.

---

**Version**: 1.0.0
**Status**: Integrierte Plattform (Scanner + Audit Tools)
