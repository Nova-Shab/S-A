/**
 * Risk Class Design Tokens
 * =========================
 * Zentrales Mapping für einheitliche Risiko-Farbcodierung im gesamten System.
 *
 * WICHTIG: Alle Risikofarben MÜSSEN aus dieser Datei importiert werden.
 * Keine Hardcoded-Farben in Komponenten verwenden!
 *
 * ## Risikoklassen nach EU AI Act:
 * - PROHIBITED: Verbotene KI-Systeme (Art. 5)
 * - HIGH_RISK: Hochrisiko-Systeme (Annex III)
 * - LIMITED_RISK: Begrenztes Risiko (Art. 50)
 * - MINIMAL_RISK: Minimales Risiko
 * - UNKNOWN: Nicht klassifiziert
 *
 * ## Neue Risikoklasse hinzufügen:
 * 1. Typ in RiskClassExtended erweitern
 * 2. Eintrag in RISK_DESIGN_TOKENS hinzufügen
 * 3. Normalizer in normalizeRiskClass anpassen
 */

import { RiskClass } from '../models/types';

// Erweiterte Risikoklasse mit UNKNOWN für nicht klassifizierte Systeme
export type RiskClassExtended = RiskClass | 'UNKNOWN';

// Icon-Typ für optionale Icons
export type RiskIcon = 'prohibited' | 'warning' | 'info' | 'check' | 'question';

/**
 * Design Token für eine Risikoklasse
 * Enthält alle visuellen Eigenschaften für konsistente Darstellung
 */
export interface RiskDesignToken {
  // Identifikation
  key: RiskClassExtended;

  // Labels (mehrsprachig vorbereitet)
  label: {
    de: string;
    en: string;
    short: string; // Kurzform für enge Platzverhältnisse
  };

  // Farben für Badge/Chip (entsättigt, B2B-freundlich)
  badge: {
    bg: string;
    text: string;
    border: string;
  };

  // Farben für Tabellenzeilen (dezent)
  row: {
    bg: string;
    borderLeft: string;
    hoverBg: string;
  };

  // Farben für Charts/Diagramme
  chart: {
    fill: string;
    stroke: string;
    gradient?: {
      from: string;
      to: string;
    };
  };

  // Icon
  icon: RiskIcon;

  // Sortierreihenfolge (niedriger = kritischer)
  sortOrder: number;

  // WCAG Kontrast-geprüft
  wcagCompliant: boolean;
}

/**
 * Zentrale Design Tokens für alle Risikoklassen
 *
 * Farbpalette:
 * - Entsättigt und professionell (B2B)
 * - WCAG AA konform (Kontrast mindestens 4.5:1 für Text)
 * - Konsistent über Light/Dark Mode (Dark Mode Farben in Kommentaren)
 */
export const RISK_DESIGN_TOKENS: Record<RiskClassExtended, RiskDesignToken> = {
  PROHIBITED: {
    key: 'PROHIBITED',
    label: {
      de: 'Verboten',
      en: 'Prohibited',
      short: 'Verb.',
    },
    badge: {
      bg: 'bg-rose-100',      // Dark: bg-rose-900/30
      text: 'text-rose-800',   // Dark: text-rose-200
      border: 'border-rose-300', // Dark: border-rose-700
    },
    row: {
      bg: 'bg-rose-50/50',
      borderLeft: 'border-l-rose-500',
      hoverBg: 'hover:bg-rose-50',
    },
    chart: {
      fill: '#be123c',       // rose-700
      stroke: '#9f1239',     // rose-800
      gradient: {
        from: '#e11d48',     // rose-600
        to: '#9f1239',       // rose-800
      },
    },
    icon: 'prohibited',
    sortOrder: 0,
    wcagCompliant: true,
  },

  HIGH_RISK: {
    key: 'HIGH_RISK',
    label: {
      de: 'Hochrisiko',
      en: 'High Risk',
      short: 'Hoch',
    },
    badge: {
      bg: 'bg-amber-100',      // Dark: bg-amber-900/30
      text: 'text-amber-800',   // Dark: text-amber-200
      border: 'border-amber-300', // Dark: border-amber-700
    },
    row: {
      bg: 'bg-amber-50/50',
      borderLeft: 'border-l-amber-500',
      hoverBg: 'hover:bg-amber-50',
    },
    chart: {
      fill: '#d97706',       // amber-600
      stroke: '#b45309',     // amber-700
      gradient: {
        from: '#f59e0b',     // amber-500
        to: '#b45309',       // amber-700
      },
    },
    icon: 'warning',
    sortOrder: 1,
    wcagCompliant: true,
  },

  LIMITED_RISK: {
    key: 'LIMITED_RISK',
    label: {
      de: 'Begrenztes Risiko',
      en: 'Limited Risk',
      short: 'Begr.',
    },
    badge: {
      bg: 'bg-sky-100',        // Dark: bg-sky-900/30
      text: 'text-sky-800',     // Dark: text-sky-200
      border: 'border-sky-300', // Dark: border-sky-700
    },
    row: {
      bg: 'bg-sky-50/50',
      borderLeft: 'border-l-sky-500',
      hoverBg: 'hover:bg-sky-50',
    },
    chart: {
      fill: '#0284c7',       // sky-600
      stroke: '#0369a1',     // sky-700
      gradient: {
        from: '#0ea5e9',     // sky-500
        to: '#0369a1',       // sky-700
      },
    },
    icon: 'info',
    sortOrder: 2,
    wcagCompliant: true,
  },

  MINIMAL_RISK: {
    key: 'MINIMAL_RISK',
    label: {
      de: 'Minimales Risiko',
      en: 'Minimal Risk',
      short: 'Min.',
    },
    badge: {
      bg: 'bg-emerald-100',      // Dark: bg-emerald-900/30
      text: 'text-emerald-800',   // Dark: text-emerald-200
      border: 'border-emerald-300', // Dark: border-emerald-700
    },
    row: {
      bg: 'bg-emerald-50/50',
      borderLeft: 'border-l-emerald-500',
      hoverBg: 'hover:bg-emerald-50',
    },
    chart: {
      fill: '#059669',       // emerald-600
      stroke: '#047857',     // emerald-700
      gradient: {
        from: '#10b981',     // emerald-500
        to: '#047857',       // emerald-700
      },
    },
    icon: 'check',
    sortOrder: 3,
    wcagCompliant: true,
  },

  UNKNOWN: {
    key: 'UNKNOWN',
    label: {
      de: 'Nicht klassifiziert',
      en: 'Unclassified',
      short: 'N/A',
    },
    badge: {
      bg: 'bg-slate-100',      // Dark: bg-slate-800
      text: 'text-slate-600',   // Dark: text-slate-300
      border: 'border-slate-300', // Dark: border-slate-600
    },
    row: {
      bg: 'bg-slate-50/50',
      borderLeft: 'border-l-slate-400',
      hoverBg: 'hover:bg-slate-50',
    },
    chart: {
      fill: '#64748b',       // slate-500
      stroke: '#475569',     // slate-600
      gradient: {
        from: '#94a3b8',     // slate-400
        to: '#475569',       // slate-600
      },
    },
    icon: 'question',
    sortOrder: 4,
    wcagCompliant: true,
  },
};

/**
 * Normalizer: Konvertiert verschiedene Risikoklassen-Strings in einheitliches Format
 *
 * Akzeptiert:
 * - "HIGH_RISK", "high_risk", "HIGH", "high", "Hoch", "hochrisiko", "Hochrisiko"
 * - "LIMITED_RISK", "limited", "begrenzt", "Begrenztes Risiko"
 * - etc.
 *
 * @param value - Beliebiger Risikoklassen-String oder null/undefined
 * @returns Normalisierte RiskClassExtended
 */
export function normalizeRiskClass(value: string | null | undefined): RiskClassExtended {
  if (!value || value.trim() === '') {
    return 'UNKNOWN';
  }

  const normalized = value.toUpperCase().trim().replace(/[\s-_]+/g, '_');

  // PROHIBITED
  if (
    normalized === 'PROHIBITED' ||
    normalized === 'VERBOTEN' ||
    normalized === 'FORBIDDEN' ||
    normalized === 'BANNED'
  ) {
    return 'PROHIBITED';
  }

  // HIGH_RISK
  if (
    normalized === 'HIGH_RISK' ||
    normalized === 'HIGH' ||
    normalized === 'HIGHRISK' ||
    normalized === 'HOCHRISIKO' ||
    normalized === 'HOCH' ||
    normalized === 'HOHERISIKO' ||
    normalized === 'HOHES_RISIKO'
  ) {
    return 'HIGH_RISK';
  }

  // LIMITED_RISK
  if (
    normalized === 'LIMITED_RISK' ||
    normalized === 'LIMITED' ||
    normalized === 'LIMITEDRISK' ||
    normalized === 'BEGRENZT' ||
    normalized === 'BEGRENZTES_RISIKO' ||
    normalized === 'BEGRENZTESRISIKO' ||
    normalized === 'MEDIUM' ||
    normalized === 'MEDIUM_RISK' ||
    normalized === 'MITTEL'
  ) {
    return 'LIMITED_RISK';
  }

  // MINIMAL_RISK
  if (
    normalized === 'MINIMAL_RISK' ||
    normalized === 'MINIMAL' ||
    normalized === 'MINIMALRISK' ||
    normalized === 'LOW' ||
    normalized === 'LOW_RISK' ||
    normalized === 'LOWRISK' ||
    normalized === 'MINIMALES_RISIKO' ||
    normalized === 'MINIMALESRISIKO' ||
    normalized === 'GERING' ||
    normalized === 'GERINGES_RISIKO'
  ) {
    return 'MINIMAL_RISK';
  }

  // UNKNOWN als Fallback
  return 'UNKNOWN';
}

/**
 * Gibt das Design Token für eine Risikoklasse zurück
 * Normalisiert den Input automatisch
 *
 * @param riskClass - Risikoklasse (wird normalisiert)
 * @returns Design Token
 */
export function getRiskToken(riskClass: string | null | undefined): RiskDesignToken {
  const normalized = normalizeRiskClass(riskClass);
  return RISK_DESIGN_TOKENS[normalized];
}

/**
 * Gibt das Label für eine Risikoklasse zurück
 *
 * @param riskClass - Risikoklasse
 * @param lang - Sprache ('de' | 'en')
 * @param short - Kurzform verwenden
 */
export function getRiskLabel(
  riskClass: string | null | undefined,
  lang: 'de' | 'en' = 'de',
  short: boolean = false
): string {
  const token = getRiskToken(riskClass);
  return short ? token.label.short : token.label[lang];
}

/**
 * Gibt die Badge-CSS-Klassen für eine Risikoklasse zurück
 */
export function getRiskBadgeClasses(riskClass: string | null | undefined): string {
  const token = getRiskToken(riskClass);
  return `${token.badge.bg} ${token.badge.text} ${token.badge.border} border`;
}

/**
 * Gibt die Row-CSS-Klassen für eine Risikoklasse zurück
 * Für Tabellenzeilen mit dezenter Farbcodierung
 */
export function getRiskRowClasses(riskClass: string | null | undefined): string {
  const token = getRiskToken(riskClass);
  return `${token.row.bg} ${token.row.borderLeft} border-l-4 ${token.row.hoverBg}`;
}

/**
 * Gibt die Chart-Farbe für eine Risikoklasse zurück
 */
export function getRiskChartColor(riskClass: string | null | undefined): string {
  const token = getRiskToken(riskClass);
  return token.chart.fill;
}

/**
 * Gibt alle Chart-Farben als Array zurück (für Pie/Bar Charts)
 * Sortiert nach Kritikalität (PROHIBITED zuerst)
 */
export function getAllRiskChartColors(): { key: RiskClassExtended; color: string; label: string }[] {
  return Object.values(RISK_DESIGN_TOKENS)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(token => ({
      key: token.key,
      color: token.chart.fill,
      label: token.label.de,
    }));
}

/**
 * Sortiert ein Array nach Risikoklasse (kritischste zuerst)
 */
export function sortByRiskClass<T extends { riskClass?: string | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const tokenA = getRiskToken(a.riskClass);
    const tokenB = getRiskToken(b.riskClass);
    return tokenA.sortOrder - tokenB.sortOrder;
  });
}

// CSS Variable Ausgabe für tailwind.config.js oder globales CSS
export const RISK_CSS_VARIABLES = `
:root {
  /* PROHIBITED */
  --risk-prohibited-bg: #ffe4e6;
  --risk-prohibited-text: #9f1239;
  --risk-prohibited-border: #fda4af;
  --risk-prohibited-chart: #be123c;

  /* HIGH_RISK */
  --risk-high-bg: #fef3c7;
  --risk-high-text: #92400e;
  --risk-high-border: #fcd34d;
  --risk-high-chart: #d97706;

  /* LIMITED_RISK */
  --risk-limited-bg: #e0f2fe;
  --risk-limited-text: #075985;
  --risk-limited-border: #7dd3fc;
  --risk-limited-chart: #0284c7;

  /* MINIMAL_RISK */
  --risk-minimal-bg: #d1fae5;
  --risk-minimal-text: #065f46;
  --risk-minimal-border: #6ee7b7;
  --risk-minimal-chart: #059669;

  /* UNKNOWN */
  --risk-unknown-bg: #f1f5f9;
  --risk-unknown-text: #475569;
  --risk-unknown-border: #cbd5e1;
  --risk-unknown-chart: #64748b;
}

/* Dark Mode */
.dark {
  --risk-prohibited-bg: rgba(159, 18, 57, 0.2);
  --risk-prohibited-text: #fda4af;
  --risk-prohibited-border: #9f1239;

  --risk-high-bg: rgba(217, 119, 6, 0.2);
  --risk-high-text: #fcd34d;
  --risk-high-border: #b45309;

  --risk-limited-bg: rgba(2, 132, 199, 0.2);
  --risk-limited-text: #7dd3fc;
  --risk-limited-border: #0369a1;

  --risk-minimal-bg: rgba(5, 150, 105, 0.2);
  --risk-minimal-text: #6ee7b7;
  --risk-minimal-border: #047857;

  --risk-unknown-bg: rgba(71, 85, 105, 0.2);
  --risk-unknown-text: #cbd5e1;
  --risk-unknown-border: #475569;
}
`;
