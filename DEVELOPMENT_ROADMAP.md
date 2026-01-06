# Calmpliance Scanner - Development Roadmap

**Version:** 1.0
**Erstellt:** 6. Januar 2025
**Status:** Production-Ready MVP

---

## Executive Summary

Das Calmpliance Scanner System ist eine integrierte SaaS-Plattform zur EU AI Act Compliance. Dieses Dokument beschreibt den technischen und praktischen Entwicklungspfad.

---

## 1. Aktueller Systemstand

### 1.1 Implementierte Kernfunktionen

| Modul | Status | Beschreibung |
|-------|--------|--------------|
| AI Scanner | ✅ Produktiv | GPT-4/Ollama Risikoanalyse |
| Document Analysis | ✅ Produktiv | PDF/DOCX Extraktion mit pdf-parse v2 |
| Audit Tools | ✅ Produktiv | 85+ EU AI Act Anforderungen |
| Actions Overview | ✅ Produktiv | Deduplizierte Maßnahmenübersicht |
| Internationalisierung | ✅ Produktiv | Deutsch/Englisch |
| Demo System | ✅ Produktiv | Lead-Generierung mit JWT |

### 1.2 Technologie-Stack

```
┌─────────────────────────────────────────────────────────────┐
│                       FRONTEND                               │
│  React 18 + TypeScript + Vite + Tailwind CSS                │
│  Port: 5173                                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       BACKEND API                            │
│  Express.js + TypeScript + Sequelize                        │
│  Port: 3001 | Auth: JWT                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       DATABASE                               │
│  SQLite (Dev) / PostgreSQL (Production)                     │
│  13 Models | ORM: Sequelize v6                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI INTEGRATION                            │
│  GPT-4 (Cloud) | Ollama (Local) | Keyword Fallback          │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Phase 1: Sicherheit & Infrastruktur (Sofort)

### 2.1 Kritische Sicherheitsverbesserungen

| Aufgabe | Priorität | Aufwand | Beschreibung |
|---------|-----------|---------|--------------|
| Refresh Token | 🔴 Kritisch | 2-3 Tage | Token-Rotation für bessere Session-Sicherheit |
| CSRF-Schutz | 🔴 Kritisch | 1 Tag | Cross-Site Request Forgery Prävention |
| Input Sanitization | 🔴 Kritisch | 2 Tage | XSS-Schutz für alle Eingaben |
| Rate Limiting pro Route | 🟡 Hoch | 1 Tag | Feinere Kontrolle gegen Missbrauch |
| Dependency Audit | 🟡 Hoch | 0.5 Tag | npm audit + Fixes |

**Technische Details:**

```typescript
// Refresh Token Implementation
interface TokenPair {
  accessToken: string;   // 15 min Gültigkeit
  refreshToken: string;  // 7 Tage Gültigkeit
}

// CSRF Middleware
import csrf from 'csurf';
app.use(csrf({ cookie: true }));
```

### 2.2 Infrastruktur-Aufgaben

| Aufgabe | Priorität | Aufwand | Beschreibung |
|---------|-----------|---------|--------------|
| PostgreSQL Migration | 🔴 Kritisch | 2-3 Tage | Produktions-Datenbank |
| Cloud Deployment | 🔴 Kritisch | 1-2 Tage | Vercel/Railway/AWS |
| SSL/TLS Konfiguration | 🔴 Kritisch | 0.5 Tag | HTTPS für Produktion |
| Monitoring (Sentry) | 🟡 Hoch | 1 Tag | Error-Tracking |
| Backup-Strategie | 🟡 Hoch | 1 Tag | Automatisierte Backups |
| CI/CD Pipeline | 🟡 Hoch | 2 Tage | GitHub Actions |

**Deployment-Empfehlung:**

```yaml
# GitHub Actions Workflow
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install & Test
        run: npm ci && npm test
      - name: Build
        run: npm run build
      - name: Deploy to Vercel
        uses: vercel/actions@v2
```

---

## 3. Phase 2: Feature-Erweiterung (Q1 2025)

### 3.1 Kommunikation & Benachrichtigungen

| Feature | Priorität | Aufwand | Integration |
|---------|-----------|---------|-------------|
| E-Mail-Versand | 🔴 Kritisch | 2 Tage | SendGrid / AWS SES |
| Demo-Freischaltung per Mail | 🔴 Kritisch | 1 Tag | Automatische Benachrichtigung |
| Audit-Abschluss-Alerts | 🟡 Hoch | 1 Tag | Benachrichtigung bei Fertigstellung |
| Fälligkeitserinnerungen | 🟡 Hoch | 1 Tag | Action-Item Reminders |

**E-Mail-Templates:**

```
📧 Demo-Freischaltung
├── Willkommens-Mail
├── Access-Token-Link
└── Feature-Übersicht

📧 Audit-Benachrichtigungen
├── Audit-Start
├── Anforderung-Kommentar
├── Audit-Abschluss
└── Report-Bereitstellung
```

### 3.2 Admin-Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD                           │
├─────────────────────────────────────────────────────────────┤
│  📊 Analytics          │  👥 User Management                │
│  ├── Active Users      │  ├── User List                     │
│  ├── Scan Volume       │  ├── Role Assignment               │
│  ├── Conversion Rate   │  └── Access Control                │
│  └── Feature Usage     │                                    │
├─────────────────────────────────────────────────────────────┤
│  📋 Lead Management    │  🔧 System Health                  │
│  ├── Demo Requests     │  ├── API Response Times            │
│  ├── Approval Queue    │  ├── Error Rates                   │
│  └── Export Function   │  └── Database Status               │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Analyse-Qualität verbessern

| Verbesserung | Beschreibung | Impact |
|--------------|--------------|--------|
| ML-Modell Training | Custom-Modell auf EU AI Act Corpus | +40% Genauigkeit |
| Optimierte GPT Prompts | Branchen-spezifische Prompts | +25% Relevanz |
| Batch Document Analysis | Mehrere Dokumente gleichzeitig | +60% Effizienz |
| OCR Integration | Gescannte PDFs analysieren | Neue Dokumenttypen |

### 3.4 UX & Performance

| Optimierung | Aktuell | Ziel | Maßnahme |
|-------------|---------|------|----------|
| Initial Load | ~3s | <1s | Code-Splitting |
| API Latenz | ~200ms | <100ms | React Query Caching |
| Bundle Size | ~800KB | ~400KB | Tree-Shaking |
| Lighthouse | ~70 | >90 | Optimierungen |

**Implementierung:**

```typescript
// React Query für API Caching
const { data: audits } = useQuery({
  queryKey: ['audits'],
  queryFn: fetchAudits,
  staleTime: 5 * 60 * 1000, // 5 Minuten
});

// Code-Splitting
const ScannerPage = React.lazy(() => import('./pages/ScannerPage'));
```

---

## 4. Phase 3: Enterprise Features (Q2-Q3 2025)

### 4.1 API & Integrationen

```
┌─────────────────────────────────────────────────────────────┐
│                    API MARKETPLACE                           │
├─────────────────────────────────────────────────────────────┤
│  🔑 API Management                                           │
│  ├── API Key Generierung                                    │
│  ├── Rate Limiting pro Client                               │
│  ├── Usage Analytics                                        │
│  └── Swagger/OpenAPI Dokumentation                          │
├─────────────────────────────────────────────────────────────┤
│  🔗 Integrationen                                            │
│  ├── Webhook Notifications                                  │
│  ├── Slack/Teams Integration                                │
│  ├── Jira Sync für Action Items                             │
│  └── SSO (Azure AD, Okta, Google)                           │
└─────────────────────────────────────────────────────────────┘
```

**API Endpoints (geplant):**

```
POST   /api/v2/scan/analyze          # AI Analyse
GET    /api/v2/scan/results/:id      # Ergebnisse abrufen
POST   /api/v2/audits                # Audit erstellen
GET    /api/v2/audits/:id/export     # Report exportieren
POST   /api/v2/webhooks              # Webhook registrieren
```

### 4.2 Multi-Tenant & White-Label

| Feature | Zielkunden | Aufwand |
|---------|------------|---------|
| Organisation Workspaces | Enterprise | 3 Wochen |
| Custom Branding | Consulting-Firmen | 2 Wochen |
| RBAC (Role-Based Access) | Große Teams | 2 Wochen |
| Audit Templates pro Branche | Vertikale Expansion | 1 Woche |

**Datenmodell-Erweiterung:**

```typescript
interface Organization {
  id: string;
  name: string;
  branding: {
    logo: string;
    primaryColor: string;
    domain?: string;
  };
  plan: 'starter' | 'professional' | 'enterprise';
  settings: OrganizationSettings;
}

interface UserRole {
  userId: string;
  organizationId: string;
  role: 'viewer' | 'editor' | 'admin' | 'owner';
  permissions: Permission[];
}
```

### 4.3 Advanced Compliance Features

| Feature | EU AI Act Bezug | Beschreibung |
|---------|-----------------|--------------|
| Continuous Monitoring | Art. 9 Risk Management | Automatische Neubewertung |
| Re-Assessment Triggers | Art. 43 Conformity | Bei System-Änderungen |
| Regulatory Updates | Art. 61 Post-market | Gesetzesänderungs-Alerts |
| Evidence Chain | Art. 18 Documentation | Lückenlose Nachweisführung |

---

## 5. Technische Schulden

### 5.1 Zu adressierende Probleme

| Bereich | Aktuell | Problem | Lösung |
|---------|---------|---------|--------|
| Frontend State | localStorage | Kein Multi-Device Sync | Backend-Sync + Redux/Zustand |
| File Storage | Lokales Filesystem | Nicht skalierbar | AWS S3 / Google Cloud Storage |
| Keyword Fallback | Aktiv | Ungenau | Immer GPT/Ollama verwenden |
| Tests | 0% Coverage | Keine Qualitätssicherung | Jest + React Testing Library |
| API Docs | Keine | Schwer zu integrieren | Swagger/OpenAPI |

### 5.2 Refactoring-Prioritäten

```
1. [HOCH] Authentication Service
   └── Refresh Token + Logout All Devices

2. [HOCH] State Management
   └── Zentraler Store mit Zustand/Redux

3. [MITTEL] API Client
   └── Axios Interceptors + Error Handling

4. [MITTEL] Component Library
   └── Storybook für UI Komponenten

5. [NIEDRIG] Code Style
   └── ESLint + Prettier strict mode
```

---

## 6. Metriken & KPIs

### 6.1 Technische KPIs

| Metrik | Aktuell | Q1 2025 | Q2 2025 |
|--------|---------|---------|---------|
| API Response Time | ~200ms | <100ms | <50ms |
| Uptime | N/A | 99.5% | 99.9% |
| Test Coverage | 0% | 60% | 80% |
| Lighthouse Score | ~70 | 85 | 95 |
| Error Rate | Unknown | <1% | <0.1% |

### 6.2 Business KPIs (zu implementieren)

| Metrik | Tracking | Tool |
|--------|----------|------|
| Demo Requests | ✅ Implementiert | Interne DB |
| Conversion Rate | ❌ Fehlt | Analytics |
| User Retention | ❌ Fehlt | Analytics |
| Feature Usage | ❌ Fehlt | Analytics |
| NPS Score | ❌ Fehlt | Survey Tool |

**Analytics Implementation:**

```typescript
// PostHog / Mixpanel Integration
analytics.track('scan_completed', {
  riskClass: result.riskClass,
  inputType: 'description',
  processingTime: duration,
});
```

---

## 7. Risikomanagement

### 7.1 Technische Risiken

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| Scanner-Genauigkeit niedrig | Hoch | Hoch | GPT-Integration als Standard |
| Skalierungsprobleme | Mittel | Hoch | PostgreSQL + Redis |
| Security Breach | Niedrig | Sehr Hoch | Penetration Tests + Audit |
| Vendor Lock-in (OpenAI) | Mittel | Mittel | Multi-LLM Support (Ollama) |

### 7.2 Regulatorische Risiken

| Risiko | Beschreibung | Mitigation |
|--------|--------------|------------|
| AI Act Änderungen | Anforderungen können sich ändern | Modulare Regel-Engine |
| DSGVO-Verstöße | Datenverarbeitung in der Cloud | Privacy-by-Design, DPA |
| Haftungsfragen | Falsche Empfehlungen | Disclaimer, Terms of Service |

---

## 8. Ressourcenplanung

### 8.1 Team-Anforderungen

| Rolle | Phase 1 | Phase 2 | Phase 3 |
|-------|---------|---------|---------|
| Full-Stack Developer | 1 | 2 | 2 |
| DevOps Engineer | 0.5 | 1 | 1 |
| UI/UX Designer | 0 | 0.5 | 1 |
| QA Engineer | 0 | 0.5 | 1 |
| Product Manager | 0.5 | 1 | 1 |

### 8.2 Budget-Schätzung

| Kategorie | Phase 1 | Phase 2 | Phase 3 |
|-----------|---------|---------|---------|
| Infrastruktur | €500/Monat | €1.500/Monat | €3.000/Monat |
| AI APIs (OpenAI) | €200/Monat | €800/Monat | €2.000/Monat |
| Tools & Services | €100/Monat | €300/Monat | €500/Monat |
| **Gesamt** | **€800/Monat** | **€2.600/Monat** | **€5.500/Monat** |

---

## 9. Meilensteine

### 2025 Roadmap

```
Q1 2025 (Januar - März)
├── Woche 1-2: Security Hardening
├── Woche 3-4: PostgreSQL + Deployment
├── Woche 5-6: E-Mail Integration
├── Woche 7-8: Admin Dashboard
├── Woche 9-10: Performance Optimierung
└── Woche 11-12: Testing & Stabilisierung

Q2 2025 (April - Juni)
├── Monat 1: API v2 + Dokumentation
├── Monat 2: SSO Integration
└── Monat 3: Multi-Tenant Grundlagen

Q3 2025 (Juli - September)
├── Monat 1: White-Label Features
├── Monat 2: Enterprise RBAC
└── Monat 3: Marketplace Launch

Q4 2025 (Oktober - Dezember)
├── Monat 1: Advanced Compliance
├── Monat 2: International Expansion
└── Monat 3: Strategic Partnerships
```

---

## 10. Nächste Schritte (Sofort)

### Priorität 1 (Diese Woche)

1. **Production Deployment**
   ```bash
   # Vercel Deployment
   npm run build
   vercel --prod
   ```

2. **PostgreSQL Setup**
   ```bash
   # Docker für lokale Entwicklung
   docker run -d --name postgres \
     -e POSTGRES_PASSWORD=secret \
     -p 5432:5432 postgres:15
   ```

3. **Security Audit**
   ```bash
   npm audit fix
   npm outdated
   ```

### Priorität 2 (Nächste Woche)

1. **E-Mail Service Integration** (SendGrid)
2. **Monitoring Setup** (Sentry)
3. **CI/CD Pipeline** (GitHub Actions)

### Priorität 3 (Monat 1)

1. **Admin Dashboard** UI
2. **API Dokumentation** (Swagger)
3. **Test Suite** Aufbau

---

## Kontakt & Ressourcen

**Repository:** Nova-Shab/S-A
**Branch:** claude/assemble-eu-ai-act-scanner-1f9R7

**Start-Befehle:**
```bash
# Backend
cd backend && npm install && npm run dev

# Frontend
npm install && npm run dev
```

**URLs (Development):**
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- API Health: http://localhost:3001/api/health

---

*Dokument erstellt am 6. Januar 2025*
*Calmpliance Scanner - EU AI Act Compliance Platform*
