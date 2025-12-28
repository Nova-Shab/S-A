# Risk Class Color System

## Übersicht

Das Farbcodierungssystem für Risikoklassen bietet eine einheitliche, systemweite Darstellung von EU AI Act Risikokategorien. Alle Farben werden zentral in `src/utils/riskDesignTokens.ts` definiert und über die `RiskBadge`-Komponente (`src/components/RiskBadge.tsx`) angezeigt.

## Risikoklassen

| Klasse | Deutsch | Englisch | Farbe |
|--------|---------|----------|-------|
| `PROHIBITED` | Verboten | Prohibited | Rose/Rot |
| `HIGH_RISK` | Hochrisiko | High Risk | Amber/Orange |
| `LIMITED_RISK` | Begrenztes Risiko | Limited Risk | Sky/Blau |
| `MINIMAL_RISK` | Minimales Risiko | Minimal Risk | Emerald/Grün |
| `UNKNOWN` | Nicht klassifiziert | Unclassified | Slate/Grau |

## Verwendung

### RiskBadge Komponente

```tsx
import { RiskBadge, RiskDot, RiskIndicator } from '../components/RiskBadge';

// Standard Badge
<RiskBadge riskClass="HIGH_RISK" />

// Mit Icon
<RiskBadge riskClass="PROHIBITED" showIcon />

// Verschiedene Größen
<RiskBadge riskClass="LIMITED_RISK" size="xs" />
<RiskBadge riskClass="LIMITED_RISK" size="sm" />
<RiskBadge riskClass="LIMITED_RISK" size="md" />
<RiskBadge riskClass="LIMITED_RISK" size="lg" />

// Verschiedene Varianten
<RiskBadge riskClass="MINIMAL_RISK" variant="badge" />   {/* Standard */}
<RiskBadge riskClass="MINIMAL_RISK" variant="pill" />    {/* Rund */}
<RiskBadge riskClass="MINIMAL_RISK" variant="outline" /> {/* Nur Rahmen */}
<RiskBadge riskClass="MINIMAL_RISK" variant="subtle" />  {/* Dezent */}

// Nur Icon
<RiskBadge riskClass="HIGH_RISK" iconOnly showIcon />

// Sprachauswahl
<RiskBadge riskClass="HIGH_RISK" lang="en" /> {/* "High Risk" */}
<RiskBadge riskClass="HIGH_RISK" lang="de" /> {/* "Hochrisiko" */}

// Minimaler Punkt-Indikator
<RiskDot riskClass="HIGH_RISK" />

// Tabellenzeilen-Indikator (farbige Linie links)
<RiskIndicator riskClass="HIGH_RISK" />
```

### Design Tokens direkt verwenden

```tsx
import {
  getRiskToken,
  getRiskLabel,
  getRiskBadgeClasses,
  getRiskRowClasses,
  getRiskChartColor,
  normalizeRiskClass
} from '../utils/riskDesignTokens';

// Token abrufen
const token = getRiskToken('HIGH_RISK');
console.log(token.badge.bg);    // 'bg-amber-100'
console.log(token.badge.text);  // 'text-amber-800'
console.log(token.chart.fill);  // '#d97706'

// Label abrufen
const label = getRiskLabel('HIGH_RISK', 'de');  // 'Hochrisiko'
const labelEn = getRiskLabel('HIGH_RISK', 'en'); // 'High Risk'
const short = getRiskLabel('HIGH_RISK', 'de', true); // 'Hoch'

// CSS-Klassen für Badges
const badgeClasses = getRiskBadgeClasses('HIGH_RISK');
// 'bg-amber-100 text-amber-800 border-amber-300 border'

// CSS-Klassen für Tabellenzeilen
const rowClasses = getRiskRowClasses('HIGH_RISK');
// 'bg-amber-50/50 border-l-amber-500 border-l-4 hover:bg-amber-50'

// Chart-Farbe (Hex)
const chartColor = getRiskChartColor('HIGH_RISK'); // '#d97706'
```

### Normalizer

Der Normalizer konvertiert verschiedene Eingabeformate in das einheitliche Format:

```tsx
import { normalizeRiskClass } from '../utils/riskDesignTokens';

normalizeRiskClass('HIGH_RISK');     // 'HIGH_RISK'
normalizeRiskClass('high_risk');     // 'HIGH_RISK'
normalizeRiskClass('HIGH');          // 'HIGH_RISK'
normalizeRiskClass('Hochrisiko');    // 'HIGH_RISK'
normalizeRiskClass('HOCH');          // 'HIGH_RISK'
normalizeRiskClass(null);            // 'UNKNOWN'
normalizeRiskClass('');              // 'UNKNOWN'
normalizeRiskClass('invalid');       // 'UNKNOWN'
```

## Neue Risikoklasse hinzufügen

1. **Typ erweitern** in `src/utils/riskDesignTokens.ts`:
```tsx
export type RiskClassExtended = RiskClass | 'UNKNOWN' | 'NEW_RISK';
```

2. **Token definieren** in `RISK_DESIGN_TOKENS`:
```tsx
NEW_RISK: {
  key: 'NEW_RISK',
  label: {
    de: 'Neue Risikokategorie',
    en: 'New Risk Category',
    short: 'Neu',
  },
  badge: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-300',
  },
  row: {
    bg: 'bg-purple-50/50',
    borderLeft: 'border-l-purple-500',
    hoverBg: 'hover:bg-purple-50',
  },
  chart: {
    fill: '#9333ea',
    stroke: '#7e22ce',
  },
  icon: 'warning',
  sortOrder: 1.5, // Zwischen HIGH_RISK (1) und LIMITED_RISK (2)
  wcagCompliant: true,
},
```

3. **Normalizer aktualisieren** in `normalizeRiskClass()`:
```tsx
if (normalized === 'NEW_RISK' || normalized === 'NEU') {
  return 'NEW_RISK';
}
```

## Design-Prinzipien

### Farbauswahl

- **Entsättigt**: Professionelle B2B-Farben, keine Neonfarben
- **WCAG AA konform**: Mindestkontrast 4.5:1 für Text
- **Semantisch**: Rot=Gefahr, Orange=Warnung, Grün=Sicher

### Konsistenz

- Alle Risikofarben kommen aus einer zentralen Quelle
- Keine Hardcoded-Farben in Komponenten
- Einheitliche Darstellung über alle Screens

### Barrierefreiheit

- Text immer sichtbar (nicht nur Farbe)
- Icon-Unterstützung für zusätzliche Unterscheidung
- Ausreichender Kontrast

## Betroffene Dateien

Diese Dateien wurden aktualisiert, um das neue System zu verwenden:

- `src/pages/DashboardPage.tsx`
- `src/pages/SystemsListPage.tsx`
- `src/pages/AuditHistoryPage.tsx`
- `src/pages/RiskAssessmentPage.tsx`
- `src/pages/ScannerPage.tsx`
- `src/components/RiskSuggestionCard.tsx` (verwendet weiterhin eigene Logik für spezielle Darstellung)

## CSS Custom Properties

Für fortgeschrittene Anpassungen können CSS-Variablen verwendet werden.
Diese sind in `RISK_CSS_VARIABLES` in `riskDesignTokens.ts` definiert und können in globales CSS eingefügt werden.
