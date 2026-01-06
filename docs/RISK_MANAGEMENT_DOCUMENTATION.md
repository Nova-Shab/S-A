# Risikomanagement-Dokumentation

## Calmpliance Scanner - EU AI Act Compliance Tool

**Version:** 1.0
**Stand:** Januar 2025
**Dokumenten-ID:** RMD-CALMP-2025-001
**Klassifizierung:** Intern / Vertraulich

---

## Inhaltsverzeichnis

1. [Executive Summary](#1-executive-summary)
2. [Systemübersicht](#2-systemübersicht)
3. [Risikoklassifizierung des Systems](#3-risikoklassifizierung-des-systems)
4. [Risikomanagementsystem (Art. 9)](#4-risikomanagementsystem-art-9)
5. [Daten-Governance (Art. 10)](#5-daten-governance-art-10)
6. [Technische Dokumentation (Art. 11)](#6-technische-dokumentation-art-11)
7. [Aufzeichnungspflichten (Art. 12)](#7-aufzeichnungspflichten-art-12)
8. [Transparenz und Nutzerinformation (Art. 13)](#8-transparenz-und-nutzerinformation-art-13)
9. [Menschliche Aufsicht (Art. 14)](#9-menschliche-aufsicht-art-14)
10. [Genauigkeit, Robustheit, Cybersicherheit (Art. 15)](#10-genauigkeit-robustheit-cybersicherheit-art-15)
11. [Governance-Struktur](#11-governance-struktur)
12. [Risikobewertungsmatrix](#12-risikobewertungsmatrix)
13. [Maßnahmenplan](#13-maßnahmenplan)
14. [Anhänge](#14-anhänge)

---

## 1. Executive Summary

### 1.1 Zweck dieses Dokuments

Diese Risikomanagement-Dokumentation beschreibt das umfassende Risikomanagement für den **Calmpliance Scanner**, ein KI-gestütztes Tool zur Unterstützung von Unternehmen bei der Einhaltung des EU AI Act (Verordnung (EU) 2024/1689).

### 1.2 Systemzweck

Der Calmpliance Scanner ist ein Compliance-Unterstützungstool, das:
- Webseiten und Dokumente auf KI-relevante Inhalte analysiert
- Risikoklassifizierungen nach EU AI Act vorschlägt
- Unternehmen durch den Audit-Prozess führt
- Dokumentation für Compliance-Nachweise generiert

### 1.3 Risikoklassifizierung (Zusammenfassung)

| Aspekt | Bewertung |
|--------|-----------|
| **Primäre Klassifizierung** | MINIMAL_RISK (Art. 95) |
| **Begründung** | Beratungs-/Unterstützungstool ohne autonome Entscheidungen mit rechtlicher Wirkung |
| **Anwendbare Anforderungen** | Freiwillige Verhaltenskodizes, Best Practices |
| **Empfohlenes Niveau** | Freiwillige Einhaltung von HIGH_RISK Standards |

### 1.4 Wichtige Erkenntnisse

- Das System trifft **keine autonomen rechtlich bindenden Entscheidungen**
- Alle Klassifizierungsvorschläge erfordern **menschliche Überprüfung und Bestätigung**
- Das System ist als **Unterstützungstool** konzipiert, nicht als Entscheidungssystem
- **Keine verbotenen Praktiken** nach Art. 5 EU AI Act werden implementiert

---

## 2. Systemübersicht

### 2.1 Allgemeine Beschreibung

| Eigenschaft | Beschreibung |
|-------------|--------------|
| **Systemname** | Calmpliance Scanner |
| **Version** | 1.0.0 |
| **Anbieter** | [Unternehmensname einfügen] |
| **Entwicklungsland** | Deutschland / EU |
| **Zielmarkt** | Europäische Union |
| **Erstinbetriebnahme** | Q1 2025 (geplant) |

### 2.2 Funktionsbeschreibung

#### 2.2.1 Kernfunktionen

1. **URL-Scanner**
   - Webseiten-Analyse mittels Web Scraping
   - Keyword-basierte Erkennung von KI-Indikatoren
   - Erkennung von Risikomustern nach EU AI Act Kategorien

2. **Dokument-Scanner**
   - PDF, Word, Text-Dokumentanalyse
   - Extraktion von KI-relevanten Informationen
   - Unterstützung bei Evidenz-Dokumentation

3. **Audit-Wizard**
   - Geführter Compliance-Prozess
   - Unternehmenskontext-Erfassung
   - KI-System-Registrierung
   - Risikoklassifizierung mit Assistenz
   - Anforderungsprüfung nach Risikokategorie
   - Bewertung und Berichtserstellung

4. **Maßnahmenübersicht**
   - Handlungsempfehlungen basierend auf Risikoklasse
   - Priorisierte Aktionslisten
   - Fortschrittsverfolgung

### 2.3 Architektur

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React/TypeScript)               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │ Scanner  │  │  Audit   │  │ Actions  │  │   Dashboard      │ │
│  │   UI     │  │  Wizard  │  │ Overview │  │   & Reports      │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘ │
│       │             │             │                  │           │
│       └─────────────┴─────────────┴──────────────────┘           │
│                              │                                    │
│                      REST API Calls                              │
└──────────────────────────────┼───────────────────────────────────┘
                               │
┌──────────────────────────────┼───────────────────────────────────┐
│                        BACKEND (Node.js/Express)                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    API Layer                              │   │
│  │  /scan/url  │  /scan/document  │  /documents/upload      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 Analysis Engine                           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │   │
│  │  │  Keyword    │  │  Pattern    │  │   Optional      │   │   │
│  │  │  Analysis   │  │  Matching   │  │   LLM Support   │   │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 Risk Classification                       │   │
│  │  PROHIBITED │ HIGH_RISK │ LIMITED_RISK │ MINIMAL_RISK    │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### 2.4 KI-Komponenten

| Komponente | Typ | Beschreibung | KI-Intensität |
|------------|-----|--------------|---------------|
| **Keyword-Analyse** | Regelbasiert | Pattern-Matching für EU AI Act Kategorien | Keine KI |
| **Risikoklassifizierung** | Regelbasiert | Deterministische Logik nach EU AI Act Kriterien | Keine KI |
| **LLM-Integration (optional)** | KI-gestützt | GPT-4 / Ollama für erweiterte Analyse | Mittel |
| **Dokumentenanalyse** | Hybrid | PDF-Parsing + optionale KI-Zusammenfassung | Niedrig-Mittel |

### 2.5 Datenflüsse

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Nutzer    │────▶│   Scanner   │────▶│  Analyse    │
│   Input     │     │   (URL/Doc) │     │   Engine    │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                               ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Report    │◀────│  Bewertung  │◀────│   Risiko-   │
│   Output    │     │   Anzeige   │     │   Klassif.  │
└─────────────┘     └─────────────┘     └─────────────┘
```

**Verarbeitete Daten:**
- URLs öffentlich zugänglicher Webseiten
- Vom Nutzer hochgeladene Dokumente
- Unternehmensinformationen (manuell eingegeben)
- KI-System-Beschreibungen (manuell eingegeben)
- Audit-Bewertungen und Kommentare

**Nicht verarbeitete Daten:**
- Personenbezogene Daten Dritter
- Biometrische Daten
- Besondere Kategorien personenbezogener Daten (Art. 9 DSGVO)

---

## 3. Risikoklassifizierung des Systems

### 3.1 Selbstbewertung nach EU AI Act

#### 3.1.1 Prüfung auf verbotene Praktiken (Art. 5)

| Art. 5 Absatz | Verbotene Praktik | Anwendbar? | Begründung |
|---------------|-------------------|------------|------------|
| (1)(a) | Unterschwellige Manipulation | ❌ Nein | System informiert transparent, keine Manipulation |
| (1)(b) | Ausnutzung Schutzbedürftiger | ❌ Nein | Keine Zielgruppenausnutzung |
| (1)(c) | Social Scoring | ❌ Nein | Keine Bewertung von Personen |
| (1)(d) | Prädiktive Polizeiarbeit | ❌ Nein | Keine Strafverfolgungsfunktion |
| (1)(e) | Gesichtsbilder-Scraping | ❌ Nein | Keine biometrische Verarbeitung |
| (1)(f) | Emotionserkennung (Arbeit/Schule) | ❌ Nein | Keine Emotionserkennung |
| (1)(g) | Biometrische Kategorisierung | ❌ Nein | Keine Biometrie |
| (1)(h) | Echtzeit-Fernidentifikation | ❌ Nein | Keine biometrische Identifikation |

**Ergebnis:** ✅ Keine verbotenen Praktiken

#### 3.1.2 Prüfung auf Hochrisiko-Klassifizierung (Anhang III)

| Anhang III Kategorie | Anwendbar? | Begründung |
|---------------------|------------|------------|
| 1. Biometrie | ❌ Nein | Keine biometrische Verarbeitung |
| 2. Kritische Infrastruktur | ❌ Nein | Kein Infrastruktur-Management |
| 3. Bildung/Berufsausbildung | ❌ Nein | Keine Bildungsentscheidungen |
| 4. Beschäftigung | ❌ Nein | Keine Personalentscheidungen |
| 5. Wesentliche Dienstleistungen | ❌ Nein | Keine Zugangssteuerung |
| 6. Strafverfolgung | ❌ Nein | Keine Strafverfolgungsfunktion |
| 7. Migration/Asyl | ❌ Nein | Keine Migrationsentscheidungen |
| 8. Rechtspflege/Demokratie | ❌ Nein | Keine Justizfunktion |

**Ergebnis:** ✅ Keine Hochrisiko-Klassifizierung nach Anhang III

#### 3.1.3 Prüfung auf LIMITED_RISK (Art. 50)

| Transparenzpflicht | Anwendbar? | Begründung |
|-------------------|------------|------------|
| Interaktion mit KI-System | ⚠️ Bedingt | LLM-Integration (optional) erfordert Information |
| Emotionserkennung/Biometrie | ❌ Nein | Nicht vorhanden |
| Synthetische Inhalte | ❌ Nein | Keine Deep Fakes/synthetischen Medien |

**Ergebnis:** ⚠️ Bei aktivierter LLM-Integration: LIMITED_RISK Transparenzpflichten beachten

#### 3.1.4 Finale Klassifizierung

```
┌────────────────────────────────────────────────────────────────┐
│                    RISIKOKLASSIFIZIERUNG                       │
├────────────────────────────────────────────────────────────────┤
│  Primäre Klassifizierung:     MINIMAL_RISK                     │
│                                                                 │
│  Mit optionaler LLM-Integration:                               │
│  - Transparenzpflicht nach Art. 50(1) beachten                 │
│  - Nutzer über KI-Interaktion informieren                      │
│                                                                 │
│  Freiwilliges Compliance-Niveau: HIGH_RISK Standards           │
│  (zur Qualitätssicherung und Vertrauensbildung)               │
└────────────────────────────────────────────────────────────────┘
```

### 3.2 Begründung der Klassifizierung

**Hauptargumente für MINIMAL_RISK:**

1. **Unterstützungsfunktion:** Das System ist ein Beratungs- und Dokumentationstool, kein autonomes Entscheidungssystem.

2. **Keine rechtliche Bindungswirkung:** Vorschläge des Systems sind Empfehlungen, die einer menschlichen Validierung bedürfen.

3. **Keine betroffenen Grundrechte:** Das System verarbeitet keine sensiblen personenbezogenen Daten und trifft keine Entscheidungen über natürliche Personen.

4. **Keine Anhang-III-Kategorie:** Keine der Hochrisiko-Verwendungszwecke nach Anhang III ist erfüllt.

5. **Transparente Funktionsweise:** Die Analyse-Logik ist nachvollziehbar und dokumentiert.

---

## 4. Risikomanagementsystem (Art. 9)

### 4.1 Risikomanagement-Rahmenwerk

Obwohl der Calmpliance Scanner als MINIMAL_RISK klassifiziert ist, implementieren wir freiwillig ein Risikomanagementsystem nach Art. 9 Standards.

#### 4.1.1 Risikomanagement-Prozess

```
┌─────────────────────────────────────────────────────────────────┐
│                 RISIKOMANAGEMENT-ZYKLUS                         │
│                                                                 │
│     ┌──────────────┐                                           │
│     │   IDENTIFY   │◀────────────────────────────┐             │
│     │   Risiken    │                             │             │
│     │   erkennen   │                             │             │
│     └──────┬───────┘                             │             │
│            │                                      │             │
│            ▼                                      │             │
│     ┌──────────────┐                      ┌──────┴───────┐     │
│     │   ASSESS     │                      │   MONITOR    │     │
│     │   Risiken    │                      │   Risiken    │     │
│     │   bewerten   │                      │   überwachen │     │
│     └──────┬───────┘                      └──────────────┘     │
│            │                                      ▲             │
│            ▼                                      │             │
│     ┌──────────────┐                      ┌──────┴───────┐     │
│     │   MITIGATE   │─────────────────────▶│   DOCUMENT   │     │
│     │   Risiken    │                      │   Maßnahmen  │     │
│     │   mindern    │                      │   dokument.  │     │
│     └──────────────┘                      └──────────────┘     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Identifizierte Risiken

#### 4.2.1 Risikokatalog

| ID | Risiko | Kategorie | Beschreibung |
|----|--------|-----------|--------------|
| R-01 | Falsche Risikoklassifizierung | Genauigkeit | System klassifiziert KI-System in falsche Risikokategorie |
| R-02 | Unvollständige Keyword-Erkennung | Genauigkeit | Relevante Indikatoren werden nicht erkannt |
| R-03 | Fehlinterpretation durch Nutzer | Nutzung | Nutzer versteht Vorschläge als finale Entscheidung |
| R-04 | Veraltete Rechtslage | Aktualität | Änderungen im EU AI Act werden nicht reflektiert |
| R-05 | Datensicherheitsverletzung | Sicherheit | Unbefugter Zugriff auf Audit-Daten |
| R-06 | LLM-Halluzinationen | KI-Risiko | Fehlerhafte Informationen durch LLM-Integration |
| R-07 | Übermäßiges Vertrauen | Nutzung | Nutzer verlässt sich blind auf System |
| R-08 | Verfügbarkeitsausfall | Technisch | System nicht verfügbar für kritische Audits |

#### 4.2.2 Risikobewertung

| ID | Eintrittswahrscheinlichkeit | Auswirkung | Risiko-Score | Priorität |
|----|----------------------------|------------|--------------|-----------|
| R-01 | Mittel (3) | Hoch (4) | 12 | 🔴 Hoch |
| R-02 | Mittel (3) | Mittel (3) | 9 | 🟡 Mittel |
| R-03 | Hoch (4) | Hoch (4) | 16 | 🔴 Hoch |
| R-04 | Niedrig (2) | Hoch (4) | 8 | 🟡 Mittel |
| R-05 | Niedrig (2) | Hoch (4) | 8 | 🟡 Mittel |
| R-06 | Mittel (3) | Mittel (3) | 9 | 🟡 Mittel |
| R-07 | Mittel (3) | Hoch (4) | 12 | 🔴 Hoch |
| R-08 | Niedrig (2) | Mittel (3) | 6 | 🟢 Niedrig |

### 4.3 Risikominderungsmaßnahmen

#### R-01 & R-02: Falsche/Unvollständige Klassifizierung

| Maßnahme | Beschreibung | Status |
|----------|--------------|--------|
| M-01.1 | Umfangreiche Keyword-Datenbank (100+ Keywords pro Kategorie) | ✅ Implementiert |
| M-01.2 | Bilingual (DE/EN) Keyword-Sets | ✅ Implementiert |
| M-01.3 | Konfidenz-Anzeige bei Klassifizierung | ✅ Implementiert |
| M-01.4 | Manuelle Überschreibungsmöglichkeit | ✅ Implementiert |
| M-01.5 | Regelmäßige Keyword-Reviews | 📋 Geplant (Quartal) |
| M-01.6 | Validierung gegen Expertenbewertungen | 📋 Geplant |

#### R-03 & R-07: Nutzer-Fehlinterpretation / Übermäßiges Vertrauen

| Maßnahme | Beschreibung | Status |
|----------|--------------|--------|
| M-03.1 | Deutliche Disclaimer auf allen Seiten | ✅ Implementiert |
| M-03.2 | "Vorschlag"-Kennzeichnung aller Outputs | ✅ Implementiert |
| M-03.3 | Pflicht zur manuellen Bestätigung | ✅ Implementiert |
| M-03.4 | Schulungsmaterialien für Nutzer | 📋 Geplant |
| M-03.5 | Hinweis auf rechtliche Beratung | ✅ Implementiert |

#### R-04: Veraltete Rechtslage

| Maßnahme | Beschreibung | Status |
|----------|--------------|--------|
| M-04.1 | Versionierung der Compliance-Regeln | ✅ Implementiert |
| M-04.2 | Monitoring von EU AI Act Änderungen | 📋 Geplant |
| M-04.3 | Update-Mechanismus für Keyword-Sets | 📋 Geplant |
| M-04.4 | Changelog für Nutzer sichtbar | 📋 Geplant |

#### R-05: Datensicherheit

| Maßnahme | Beschreibung | Status |
|----------|--------------|--------|
| M-05.1 | Lokale Datenspeicherung (Browser) | ✅ Implementiert |
| M-05.2 | Keine Cloud-Persistenz von Audit-Daten | ✅ Implementiert |
| M-05.3 | HTTPS-Verschlüsselung | ✅ Implementiert |
| M-05.4 | Keine Weitergabe an Dritte | ✅ Implementiert |

#### R-06: LLM-Halluzinationen

| Maßnahme | Beschreibung | Status |
|----------|--------------|--------|
| M-06.1 | LLM-Nutzung optional und deaktivierbar | ✅ Implementiert |
| M-06.2 | Kennzeichnung KI-generierter Inhalte | ✅ Implementiert |
| M-06.3 | Primäre Analyse regelbasiert (ohne LLM) | ✅ Implementiert |
| M-06.4 | Faktische Basis durch Keyword-Matching | ✅ Implementiert |

### 4.4 Restrisiken

Nach Implementierung aller Maßnahmen verbleiben folgende akzeptierte Restrisiken:

| Risiko | Restrisiko-Level | Akzeptanz-Begründung |
|--------|------------------|---------------------|
| Falsche Klassifizierung | Niedrig | Disclaimer + Menschliche Überprüfung |
| Nutzer-Fehlinterpretation | Niedrig | Umfangreiche Hinweise + Bestätigungspflicht |
| Veraltete Rechtslage | Niedrig | Versionierung + Update-Prozess |

---

## 5. Daten-Governance (Art. 10)

### 5.1 Datenkategorien

| Kategorie | Datentyp | Quelle | Sensitivität |
|-----------|----------|--------|--------------|
| URL-Daten | Öffentliche Webinhalte | Nutzer-Input | Niedrig |
| Dokumente | PDF, Word, Text | Nutzer-Upload | Mittel |
| Unternehmensdaten | Größe, Branche, Standort | Nutzer-Input | Niedrig |
| KI-System-Daten | Beschreibung, Zweck | Nutzer-Input | Mittel |
| Audit-Bewertungen | Compliance-Status | Nutzer-Input | Mittel |

### 5.2 Datenqualitätskriterien

#### 5.2.1 Keyword-Datenbank

| Kriterium | Anforderung | Umsetzung |
|-----------|-------------|-----------|
| Vollständigkeit | Alle Art. 5 Kategorien abgedeckt | 8 Kategorien, 100+ Keywords |
| Aktualität | Stand der Rechtslage | Januar 2025 / EU AI Act Final |
| Mehrsprachigkeit | DE + EN | Vollständig implementiert |
| Validierung | Expertenprüfung | Durchgeführt |

#### 5.2.2 Analyseergebnisse

| Kriterium | Messung | Zielwert |
|-----------|---------|----------|
| Precision (Genauigkeit) | Anteil korrekter positiver Klassifizierungen | > 85% |
| Recall (Trefferquote) | Anteil gefundener relevanter Ergebnisse | > 80% |
| False Positive Rate | Anteil fälschlich positiver Klassifizierungen | < 15% |

### 5.3 Bias-Prävention

Da das System keine personenbezogenen Entscheidungen trifft, sind klassische Diskriminierungsrisiken nicht anwendbar. Dennoch werden folgende Maßnahmen umgesetzt:

| Bias-Typ | Risiko | Maßnahme |
|----------|--------|----------|
| Sprachlicher Bias | Keywords bevorzugen bestimmte Sprache | Bilingual DE/EN |
| Branchen-Bias | Bestimmte Branchen schlechter erkannt | Branchenübergreifende Keywords |
| Größen-Bias | KMU vs. Großunternehmen | Skalierbare Anforderungen |

### 5.4 Datenverarbeitungsgrundsätze

```
┌─────────────────────────────────────────────────────────────────┐
│                   DATENVERARBEITUNG                             │
├─────────────────────────────────────────────────────────────────┤
│  ✅ Datenminimierung    - Nur notwendige Daten erfasst         │
│  ✅ Zweckbindung        - Ausschließlich für Compliance-Analyse│
│  ✅ Speicherbegrenzung  - Lokale Speicherung, löschbar         │
│  ✅ Transparenz         - Klare Information über Verarbeitung  │
│  ✅ Integrität          - Keine Manipulation durch System      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Technische Dokumentation (Art. 11)

### 6.1 Systembeschreibung

#### 6.1.1 Allgemeine Angaben

| Merkmal | Beschreibung |
|---------|--------------|
| Systemtyp | Web-Anwendung (SPA) mit Backend-API |
| Frontend | React 18, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Datenbank | Keine persistente Datenbank (Browser-Storage) |
| Hosting | Selbst-gehostet / On-Premise |
| Lizenz | Proprietär |

#### 6.1.2 Technologie-Stack

```
Frontend:
├── React 18.2.0
├── TypeScript 5.x
├── Vite (Build-Tool)
├── Tailwind CSS
├── React Router
└── Axios (HTTP-Client)

Backend:
├── Node.js 18+
├── Express.js
├── TypeScript 5.x
├── Cheerio (Web-Scraping)
├── pdf-parse (PDF-Analyse)
└── Optional: OpenAI SDK / Ollama
```

### 6.2 Entwicklungsprozess

#### 6.2.1 Entwicklungsmethodik

| Phase | Aktivitäten | Qualitätssicherung |
|-------|-------------|-------------------|
| Anforderungen | User Stories, Compliance-Mapping | Review durch Compliance-Experten |
| Design | Architektur, API-Design | Architektur-Review |
| Implementierung | Coding, Code-Review | Pair Programming, PR-Reviews |
| Test | Unit-, Integration-, E2E-Tests | Testabdeckung > 70% |
| Deployment | CI/CD Pipeline | Automatisierte Checks |

#### 6.2.2 Code-Qualität

| Metrik | Standard | Status |
|--------|----------|--------|
| TypeScript Strict Mode | Aktiviert | ✅ |
| Linting (ESLint) | Konfiguriert | ✅ |
| Prettier | Konfiguriert | ✅ |
| Test Coverage | > 70% | 📋 In Arbeit |

### 6.3 Analyse-Algorithmen

#### 6.3.1 Keyword-basierte Analyse

```typescript
// Vereinfachte Darstellung des Analyse-Algorithmus
function analyzeText(text: string): AnalysisResult {
  const lowerText = text.toLowerCase();

  // Prüfung aller 8 verbotenen Praktiken nach Art. 5
  const prohibitedMatches = checkAllProhibitedCategories(lowerText);

  // Prüfung Hochrisiko-Kategorien nach Anhang III
  const highRiskMatches = checkHighRiskKeywords(lowerText);

  // Prüfung LIMITED_RISK Transparenz
  const limitedRiskMatches = checkTransparencyKeywords(lowerText);

  // Deterministische Klassifizierung
  if (prohibitedMatches.length > 0) return 'PROHIBITED';
  if (highRiskMatches.length >= THRESHOLD) return 'HIGH_RISK';
  if (limitedRiskMatches.length > 0) return 'LIMITED_RISK';
  return 'MINIMAL_RISK';
}
```

#### 6.3.2 Konfidenzberechnung

| Faktor | Gewichtung | Beschreibung |
|--------|------------|--------------|
| Keyword-Treffer | 40% | Anzahl und Spezifität der Treffer |
| Kontext-Match | 30% | KI-bezogener Kontext vorhanden |
| Kategorie-Abdeckung | 30% | Mehrere Kategorien betroffen |

### 6.4 Leistungsmerkmale

| Merkmal | Spezifikation |
|---------|---------------|
| Antwortzeit URL-Scan | < 5 Sekunden |
| Antwortzeit Dokument-Scan | < 10 Sekunden (abhängig von Größe) |
| Max. Dokumentgröße | 10 MB |
| Unterstützte Formate | PDF, DOCX, DOC, TXT, MD |
| Gleichzeitige Nutzer | Abhängig von Hosting (empfohlen: > 50) |

### 6.5 Bekannte Einschränkungen

| Einschränkung | Beschreibung | Workaround |
|---------------|--------------|------------|
| JavaScript-Rendering | Dynamische Inhalte werden ggf. nicht erfasst | Statische Seiten scannen |
| Sprache | Optimal für DE/EN | Keywords erweiterbar |
| Kontext | Keine semantische Analyse | Manuelle Überprüfung |
| PDFs mit Bildern | Text aus Bildern nicht extrahiert | OCR-Integration geplant |

---

## 7. Aufzeichnungspflichten (Art. 12)

### 7.1 Logging-Konzept

Obwohl für MINIMAL_RISK nicht verpflichtend, implementieren wir ein Basis-Logging:

#### 7.1.1 Erfasste Ereignisse

| Ereignistyp | Inhalt | Speicherdauer |
|-------------|--------|---------------|
| Scan-Anfragen | Zeitstempel, Typ (URL/Doc), Ergebnis-Kategorie | Session |
| Audit-Fortschritt | Schritt, Bewertungen | Browser-Storage |
| Fehler | Error-Typ, Stack-Trace (anonymisiert) | 30 Tage |
| System-Events | Start, Stop, Version | 90 Tage |

#### 7.1.2 Nicht erfasste Daten

- Gescannte URLs (aus Datenschutzgründen)
- Dokumentinhalte
- Personenbezogene Nutzeridentifikation
- IP-Adressen (außer für technisches Routing)

### 7.2 Audit-Trail

```
┌─────────────────────────────────────────────────────────────────┐
│                      AUDIT-TRAIL STRUKTUR                       │
├─────────────────────────────────────────────────────────────────┤
│  Session-ID: [UUID]                                            │
│  ├── Audit erstellt: [Timestamp]                               │
│  ├── Unternehmenskontext: [Erfasst]                            │
│  ├── KI-System 1: [Registriert]                                │
│  │   ├── Risikoklassifizierung: [Vorgeschlagen] → [Bestätigt]  │
│  │   ├── Anforderungen: [X von Y bewertet]                     │
│  │   └── Bewertung: [Erstellt]                                 │
│  └── Export: [PDF generiert]                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 7.3 Aufbewahrungsrichtlinie

| Datentyp | Speicherort | Aufbewahrung | Löschung |
|----------|-------------|--------------|----------|
| Audit-Daten | Browser (localStorage) | Bis zur Löschung durch Nutzer | Manuell |
| Session-Logs | Server (RAM) | Während Session | Automatisch |
| Error-Logs | Server (File) | 30 Tage | Automatisch (Rotation) |
| System-Logs | Server (File) | 90 Tage | Automatisch (Rotation) |

---

## 8. Transparenz und Nutzerinformation (Art. 13)

### 8.1 Bereitgestellte Informationen

#### 8.1.1 Vor Nutzung

| Information | Ort | Inhalt |
|-------------|-----|--------|
| Systemzweck | Landing Page | Beschreibung des Compliance-Tools |
| Funktionsweise | Dokumentation | Analyse-Methodik |
| Einschränkungen | Disclaimers | Bekannte Limitierungen |
| Keine Rechtsberatung | Alle Seiten | Deutlicher Hinweis |

#### 8.1.2 Während Nutzung

| Information | Ort | Inhalt |
|-------------|-----|--------|
| Analyse-Status | UI | Fortschrittsanzeige |
| Konfidenz | Ergebnisse | Vertrauensniveau |
| Basis der Klassifizierung | Details | Erkannte Keywords/Kriterien |
| Empfehlungen | Aktionsübersicht | Nächste Schritte |

#### 8.1.3 Nach Nutzung

| Information | Ort | Inhalt |
|-------------|-----|--------|
| Zusammenfassung | Report | Alle Bewertungen |
| Maßnahmen | Export | Handlungsempfehlungen |
| Version | Report | Software-Version, Datum |

### 8.2 Transparenz bei KI-Nutzung (Art. 50)

Bei aktivierter LLM-Integration:

```
┌─────────────────────────────────────────────────────────────────┐
│  ℹ️ KI-HINWEIS                                                  │
│                                                                 │
│  Diese Analyse wurde mit Unterstützung eines KI-Systems        │
│  (GPT-4 / Ollama) erstellt.                                    │
│                                                                 │
│  Die Ergebnisse wurden automatisch generiert und sollten       │
│  von qualifiziertem Personal überprüft werden.                 │
│                                                                 │
│  [x] Ich verstehe, dass dies eine KI-gestützte Analyse ist    │
└─────────────────────────────────────────────────────────────────┘
```

### 8.3 Gebrauchsanweisung

**Empfohlener Nutzungsablauf:**

1. **Vorbereitung**
   - Unternehmens- und KI-System-Informationen sammeln
   - Relevante Dokumentation bereithalten

2. **Scan**
   - URL der KI-System-Beschreibung eingeben ODER
   - Dokumentation hochladen

3. **Audit**
   - Unternehmenskontext erfassen
   - KI-Systeme registrieren
   - Risikoklassifizierung prüfen und bestätigen
   - Anforderungen bewerten

4. **Dokumentation**
   - Bewertungen speichern
   - Maßnahmen planen
   - Report exportieren

5. **Nachbereitung**
   - Ergebnisse mit Rechtsabteilung/Beratern besprechen
   - Maßnahmen umsetzen
   - Regelmäßige Wiederholung planen

---

## 9. Menschliche Aufsicht (Art. 14)

### 9.1 Aufsichtskonzept

Der Calmpliance Scanner ist als **Human-in-the-Loop-System** konzipiert:

```
┌─────────────────────────────────────────────────────────────────┐
│                   HUMAN-IN-THE-LOOP DESIGN                      │
│                                                                 │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐       │
│  │   System    │────▶│  Vorschlag  │────▶│   Mensch    │       │
│  │  analysiert │     │  präsentiert│     │  entscheidet│       │
│  └─────────────┘     └─────────────┘     └──────┬──────┘       │
│                                                  │              │
│                                                  ▼              │
│                                          ┌─────────────┐       │
│                                          │   Finale    │       │
│                                          │ Entscheidung│       │
│                                          └─────────────┘       │
│                                                                 │
│  Das System macht VORSCHLÄGE - Menschen treffen ENTSCHEIDUNGEN │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 Kontrollmechanismen

| Kontrollpunkt | Mechanismus | Beschreibung |
|---------------|-------------|--------------|
| Risikoklassifizierung | Manuelle Bestätigung | Nutzer muss vorgeschlagene Klassifizierung bestätigen oder ändern |
| Anforderungsbewertung | Manuelle Eingabe | Nutzer bewertet jede Anforderung selbst |
| Maßnahmenpriorisierung | Manuelle Auswahl | Nutzer wählt umzusetzende Maßnahmen |
| Report-Freigabe | Manuelle Prüfung | Export erst nach Durchsicht möglich |

### 9.3 Überschreibungsmöglichkeiten

| Funktion | Überschreibbar? | Beschreibung |
|----------|-----------------|--------------|
| Risikoklassifizierung | ✅ Ja | Jederzeit änderbar |
| Anforderungen | ✅ Ja | Kommentare und Bewertungen frei eingebbar |
| Maßnahmen | ✅ Ja | Priorisierung und Auswahl anpassbar |
| LLM-Nutzung | ✅ Ja | Ein-/Ausschaltbar |

### 9.4 Qualifikationsanforderungen

Empfohlene Qualifikationen für Nutzer:

| Rolle | Empfohlene Kenntnisse |
|-------|----------------------|
| Compliance-Manager | EU AI Act Grundkenntnisse, Risikomanagement |
| IT-Verantwortlicher | Technisches Verständnis der KI-Systeme |
| Rechtsabteilung | EU AI Act, DSGVO, Produkthaftung |
| Geschäftsführung | Überblick über Compliance-Anforderungen |

---

## 10. Genauigkeit, Robustheit, Cybersicherheit (Art. 15)

### 10.1 Genauigkeit

#### 10.1.1 Genauigkeitsmetriken

| Metrik | Definition | Zielwert | Messmethode |
|--------|------------|----------|-------------|
| Klassifizierungs-Genauigkeit | Korrekte Risikokategorie | > 85% | Validierung gegen Expertenbewertung |
| Keyword-Recall | Relevante Keywords gefunden | > 80% | Test gegen bekannte Systeme |
| False-Positive-Rate | Falsch als Hochrisiko klassifiziert | < 15% | Validierung gegen MINIMAL_RISK Systeme |

#### 10.1.2 Genauigkeitsmaßnahmen

| Maßnahme | Beschreibung | Status |
|----------|--------------|--------|
| Umfangreiche Keyword-Sets | 100+ Keywords pro Art. 5 Kategorie | ✅ |
| Bilingual | DE + EN | ✅ |
| Konfidenz-Anzeige | Transparenz über Sicherheit | ✅ |
| Regelmäßige Validierung | Vergleich mit Expertenbewertungen | 📋 Geplant |

### 10.2 Robustheit

#### 10.2.1 Fehlerbehandlung

| Szenario | Verhalten | Recovery |
|----------|-----------|----------|
| URL nicht erreichbar | Fehlermeldung | Retry-Option |
| Ungültiges Dokument | Fehlermeldung | Alternative Formate vorschlagen |
| LLM-Timeout | Fallback auf regelbasierte Analyse | Automatisch |
| Browser-Speicher voll | Warnung | Exportieren und löschen |

#### 10.2.2 Eingabevalidierung

| Eingabe | Validierung |
|---------|-------------|
| URL | Format-Check, Erreichbarkeits-Test |
| Dokument | Größe (< 10 MB), Format (PDF, DOCX, TXT) |
| Textfelder | Sanitization gegen XSS |
| Auswahlen | Whitelist-Validierung |

### 10.3 Cybersicherheit

#### 10.3.1 Sicherheitsmaßnahmen

| Bereich | Maßnahme | Status |
|---------|----------|--------|
| Transport | HTTPS-Verschlüsselung | ✅ |
| Speicherung | Lokale Speicherung, keine Cloud | ✅ |
| Authentifizierung | Optional (Enterprise) | 📋 Geplant |
| API-Sicherheit | Rate-Limiting, Input-Validation | ✅ |
| Dependencies | Regelmäßige Updates, npm audit | ✅ |

#### 10.3.2 OWASP Top 10 Maßnahmen

| OWASP Risk | Maßnahme | Status |
|------------|----------|--------|
| Injection | Prepared Statements, Input Sanitization | ✅ |
| Broken Auth | Session-Management (optional) | 📋 |
| Sensitive Data | Keine persistente Speicherung sensibler Daten | ✅ |
| XXE | XML-Parser deaktiviert wo möglich | ✅ |
| Access Control | Rollenbasiert (Enterprise) | 📋 |
| Security Misconfiguration | Hardened Defaults | ✅ |
| XSS | Output Encoding, CSP | ✅ |
| Insecure Deserialization | JSON-only | ✅ |
| Known Vulnerabilities | npm audit, Dependabot | ✅ |
| Logging | Structured Logging ohne sensible Daten | ✅ |

#### 10.3.3 Sicherheits-Updates

| Komponente | Update-Frequenz | Verantwortlich |
|------------|-----------------|----------------|
| npm Packages | Wöchentlich | Development |
| Node.js | Bei LTS-Releases | Operations |
| OS/Container | Monatlich | Operations |
| Kritische Patches | Sofort | Development |

---

## 11. Governance-Struktur

### 11.1 Organisationsstruktur

```
┌─────────────────────────────────────────────────────────────────┐
│                    GOVERNANCE-STRUKTUR                          │
│                                                                 │
│                    ┌─────────────────┐                         │
│                    │   Geschäfts-    │                         │
│                    │   führung       │                         │
│                    └────────┬────────┘                         │
│                             │                                   │
│          ┌──────────────────┼──────────────────┐               │
│          │                  │                  │               │
│          ▼                  ▼                  ▼               │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐        │
│  │   AI Ethics   │ │   Product     │ │   Legal &     │        │
│  │   Board       │ │   Management  │ │   Compliance  │        │
│  └───────┬───────┘ └───────┬───────┘ └───────┬───────┘        │
│          │                  │                  │               │
│          └──────────────────┼──────────────────┘               │
│                             │                                   │
│                             ▼                                   │
│                    ┌─────────────────┐                         │
│                    │   Development   │                         │
│                    │   Team          │                         │
│                    └─────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

### 11.2 Rollen und Verantwortlichkeiten

| Rolle | Verantwortlichkeiten |
|-------|---------------------|
| **Geschäftsführung** | Gesamtverantwortung, Budget, Strategie |
| **AI Ethics Board** | Ethische Richtlinien, Bias-Prävention, Risikobewertung |
| **Product Management** | Produktstrategie, Anforderungen, Roadmap |
| **Legal & Compliance** | Rechtskonformität, EU AI Act Monitoring, Verträge |
| **Development Team** | Implementierung, Test, Wartung |
| **Data Protection Officer** | DSGVO-Compliance, Datenschutz-Folgenabschätzung |

### 11.3 Entscheidungsprozesse

#### 11.3.1 Änderungen an Klassifizierungslogik

```
Antrag → AI Ethics Board Review → Legal Review → Approval → Implementation → Test → Release
```

#### 11.3.2 Sicherheits-Patches

```
Vulnerability Report → Security Assessment → Patch Development → Emergency Release
```

#### 11.3.3 Feature-Änderungen

```
Feature Request → PM Review → Ethics Impact → Development → QA → Staged Rollout
```

### 11.4 Review-Zyklen

| Review-Typ | Frequenz | Teilnehmer | Output |
|------------|----------|------------|--------|
| Risiko-Review | Quartalsweise | Ethics, Legal, PM | Risikobericht |
| Keyword-Review | Quartalsweise | Legal, Dev | Keyword-Updates |
| Security-Review | Monatlich | Dev, Ops | Security-Report |
| Compliance-Review | Halbjährlich | Legal, Ethics, GF | Compliance-Status |

---

## 12. Risikobewertungsmatrix

### 12.1 Bewertungskriterien

**Eintrittswahrscheinlichkeit:**
| Stufe | Beschreibung | Wert |
|-------|--------------|------|
| Sehr niedrig | Unwahrscheinlich | 1 |
| Niedrig | Möglich aber selten | 2 |
| Mittel | Gelegentlich | 3 |
| Hoch | Wahrscheinlich | 4 |
| Sehr hoch | Fast sicher | 5 |

**Auswirkung:**
| Stufe | Beschreibung | Wert |
|-------|--------------|------|
| Minimal | Kaum spürbar | 1 |
| Gering | Geringer Schaden | 2 |
| Mittel | Spürbarer Schaden | 3 |
| Hoch | Erheblicher Schaden | 4 |
| Kritisch | Schwerwiegender Schaden | 5 |

### 12.2 Risikomatrix

```
                        AUSWIRKUNG
                 1    2    3    4    5
              ┌────┬────┬────┬────┬────┐
            5 │ 5  │ 10 │ 15 │ 20 │ 25 │
              ├────┼────┼────┼────┼────┤
            4 │ 4  │ 8  │ 12 │ 16 │ 20 │
  WAHR-       ├────┼────┼────┼────┼────┤
  SCHEIN-   3 │ 3  │ 6  │ 9  │ 12 │ 15 │
  LICHKEIT    ├────┼────┼────┼────┼────┤
            2 │ 2  │ 4  │ 6  │ 8  │ 10 │
              ├────┼────┼────┼────┼────┤
            1 │ 1  │ 2  │ 3  │ 4  │ 5  │
              └────┴────┴────┴────┴────┘

  🟢 1-5: Niedrig  🟡 6-12: Mittel  🔴 13-25: Hoch
```

### 12.3 Aktuelle Risikobewertung

| ID | Risiko | W | A | Score | Status |
|----|--------|---|---|-------|--------|
| R-01 | Falsche Risikoklassifizierung | 3 | 4 | 🟡 12 | Mitigiert |
| R-02 | Unvollständige Keyword-Erkennung | 3 | 3 | 🟡 9 | Mitigiert |
| R-03 | Fehlinterpretation durch Nutzer | 4 | 4 | 🔴 16 | Mitigiert → 🟡 8 |
| R-04 | Veraltete Rechtslage | 2 | 4 | 🟡 8 | Monitoring |
| R-05 | Datensicherheitsverletzung | 2 | 4 | 🟡 8 | Mitigiert |
| R-06 | LLM-Halluzinationen | 3 | 3 | 🟡 9 | Mitigiert |
| R-07 | Übermäßiges Vertrauen | 3 | 4 | 🟡 12 | Mitigiert → 🟡 6 |
| R-08 | Verfügbarkeitsausfall | 2 | 3 | 🟢 6 | Akzeptiert |

---

## 13. Maßnahmenplan

### 13.1 Sofortmaßnahmen (Implementiert)

| Maßnahme | Status | Verantwortlich |
|----------|--------|----------------|
| Umfangreiche Keyword-Sets | ✅ | Development |
| Disclaimer auf allen Seiten | ✅ | Development |
| Konfidenz-Anzeige | ✅ | Development |
| Lokale Datenspeicherung | ✅ | Development |
| HTTPS-Verschlüsselung | ✅ | Operations |
| Input-Validierung | ✅ | Development |

### 13.2 Kurzfristige Maßnahmen (Q1 2025)

| Maßnahme | Ziel | Verantwortlich | Deadline |
|----------|------|----------------|----------|
| Schulungsmaterialien | Nutzer-Onboarding | PM | Feb 2025 |
| Validierung gegen Expertenbewertungen | Genauigkeit | QA | Mär 2025 |
| OCR-Integration | PDF-Qualität | Development | Mär 2025 |
| Security-Audit | Sicherheit | External | Mär 2025 |

### 13.3 Mittelfristige Maßnahmen (Q2-Q3 2025)

| Maßnahme | Ziel | Verantwortlich | Deadline |
|----------|------|----------------|----------|
| Automatisiertes Keyword-Update | Aktualität | Development | Jun 2025 |
| Enterprise-Authentifizierung | Sicherheit | Development | Jul 2025 |
| Multi-Tenant-Fähigkeit | Skalierung | Development | Aug 2025 |
| API-Dokumentation | Integration | Development | Jun 2025 |

### 13.4 Langfristige Maßnahmen (Q4 2025+)

| Maßnahme | Ziel | Verantwortlich | Deadline |
|----------|------|----------------|----------|
| ISO 27001 Zertifizierung | Security | Operations | Q4 2025 |
| EU AI Act Compliance Audit | Compliance | External | Q4 2025 |
| Multi-Language-Support | Internationalisierung | Development | Q1 2026 |

---

## 14. Anhänge

### 14.1 Anhang A: Glossar

| Begriff | Definition |
|---------|------------|
| **EU AI Act** | Verordnung (EU) 2024/1689 über künstliche Intelligenz |
| **PROHIBITED** | Verbotene KI-Praktiken nach Art. 5 |
| **HIGH_RISK** | Hochrisiko-KI-Systeme nach Anhang III |
| **LIMITED_RISK** | KI-Systeme mit Transparenzpflichten nach Art. 50 |
| **MINIMAL_RISK** | KI-Systeme ohne spezifische Anforderungen |
| **Art. 9-15** | Anforderungen an Hochrisiko-KI-Systeme |
| **Art. 50** | Transparenzpflichten |
| **Art. 95** | Freiwillige Verhaltenskodizes |
| **Anhang III** | Hochrisiko-Verwendungszwecke |
| **Human-in-the-Loop** | Menschliche Aufsicht in KI-Entscheidungen |
| **LLM** | Large Language Model (z.B. GPT-4) |

### 14.2 Anhang B: Referenzdokumente

| Dokument | Version | Link |
|----------|---------|------|
| EU AI Act (Verordnung) | Final | EUR-Lex |
| DEVELOPMENT_ROADMAP.md | 1.0 | /docs/ |
| FINANCIAL_REQUIREMENTS.md | 1.0 | /docs/ |
| API-Dokumentation | - | (in Arbeit) |
| Nutzerhandbuch | - | (in Arbeit) |

### 14.3 Anhang C: Änderungshistorie

| Version | Datum | Autor | Änderung |
|---------|-------|-------|----------|
| 1.0 | 2025-01-06 | [Name] | Initiale Erstellung |

### 14.4 Anhang D: Genehmigungen

| Rolle | Name | Datum | Unterschrift |
|-------|------|-------|--------------|
| Geschäftsführung | [Name] | [Datum] | _____________ |
| AI Ethics Board | [Name] | [Datum] | _____________ |
| Legal & Compliance | [Name] | [Datum] | _____________ |
| Data Protection Officer | [Name] | [Datum] | _____________ |

---

## Dokumentenkontrolle

| Merkmal | Wert |
|---------|------|
| **Dokumenten-ID** | RMD-CALMP-2025-001 |
| **Version** | 1.0 |
| **Status** | Draft |
| **Erstellt** | 2025-01-06 |
| **Nächste Review** | 2025-04-06 |
| **Verteilung** | Intern, Investoren (auf Anfrage), Behörden (auf Anfrage) |

---

*Dieses Dokument wurde erstellt zur Erfüllung der Dokumentationsanforderungen des EU AI Act und zur Unterstützung interner Governance, Audits und Stakeholder-Kommunikation.*
