/**
 * RiskBadge Component
 * ===================
 * Einheitliche Darstellung von Risikoklassen als Badge/Chip.
 *
 * Verwendung:
 * <RiskBadge riskClass="HIGH_RISK" />
 * <RiskBadge riskClass="HIGH_RISK" size="sm" />
 * <RiskBadge riskClass={system.riskClass} showIcon />
 * <RiskBadge riskClass="PROHIBITED" variant="pill" />
 */

import React from 'react';
import {
  getRiskToken,
  normalizeRiskClass,
  type RiskClassExtended,
  type RiskIcon,
} from '../utils/riskDesignTokens';

// Icon Komponenten (inline SVG für Performance)
const RiskIcons: Record<RiskIcon, React.FC<{ className?: string }>> = {
  prohibited: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  ),
  warning: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  check: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  question: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

// Size Konfiguration
const SIZE_CONFIG = {
  xs: {
    padding: 'px-1.5 py-0.5',
    text: 'text-xs',
    iconSize: 'w-3 h-3',
    gap: 'gap-1',
  },
  sm: {
    padding: 'px-2 py-0.5',
    text: 'text-xs',
    iconSize: 'w-3.5 h-3.5',
    gap: 'gap-1',
  },
  md: {
    padding: 'px-2.5 py-1',
    text: 'text-sm',
    iconSize: 'w-4 h-4',
    gap: 'gap-1.5',
  },
  lg: {
    padding: 'px-3 py-1.5',
    text: 'text-base',
    iconSize: 'w-5 h-5',
    gap: 'gap-2',
  },
} as const;

type BadgeSize = keyof typeof SIZE_CONFIG;

// Variant Konfiguration
type BadgeVariant = 'badge' | 'pill' | 'outline' | 'subtle';

interface RiskBadgeProps {
  /** Risikoklasse (wird automatisch normalisiert) */
  riskClass: string | null | undefined;

  /** Größe des Badges */
  size?: BadgeSize;

  /** Variante: badge (standard), pill (rund), outline (nur Rahmen), subtle (sehr dezent) */
  variant?: BadgeVariant;

  /** Icon anzeigen */
  showIcon?: boolean;

  /** Nur Icon anzeigen (ohne Label) */
  iconOnly?: boolean;

  /** Kurzform des Labels verwenden */
  shortLabel?: boolean;

  /** Sprache für Label */
  lang?: 'de' | 'en';

  /** Zusätzliche CSS-Klassen */
  className?: string;

  /** Click Handler */
  onClick?: () => void;

  /** Tooltip Text */
  title?: string;
}

/**
 * RiskBadge - Einheitliches Badge für Risikoklassen
 *
 * @example
 * // Standard Badge
 * <RiskBadge riskClass="HIGH_RISK" />
 *
 * // Mit Icon
 * <RiskBadge riskClass="PROHIBITED" showIcon />
 *
 * // Klein und rund
 * <RiskBadge riskClass="MINIMAL_RISK" size="sm" variant="pill" />
 *
 * // Nur Icon
 * <RiskBadge riskClass="LIMITED_RISK" iconOnly showIcon />
 */
export const RiskBadge: React.FC<RiskBadgeProps> = ({
  riskClass,
  size = 'sm',
  variant = 'badge',
  showIcon = false,
  iconOnly = false,
  shortLabel = false,
  lang = 'de',
  className = '',
  onClick,
  title,
}) => {
  const normalizedRisk = normalizeRiskClass(riskClass);
  const token = getRiskToken(normalizedRisk);
  const sizeConfig = SIZE_CONFIG[size];

  // Icon Komponente
  const IconComponent = RiskIcons[token.icon];

  // Basis-Klassen
  const baseClasses = `
    inline-flex items-center font-medium
    ${sizeConfig.padding}
    ${sizeConfig.text}
    ${sizeConfig.gap}
    ${onClick ? 'cursor-pointer' : ''}
  `.trim();

  // Variant-spezifische Klassen
  const variantClasses = {
    badge: `${token.badge.bg} ${token.badge.text} ${token.badge.border} border rounded`,
    pill: `${token.badge.bg} ${token.badge.text} ${token.badge.border} border rounded-full`,
    outline: `bg-transparent ${token.badge.text} ${token.badge.border} border-2 rounded`,
    subtle: `${token.badge.bg} ${token.badge.text} rounded border-none`,
  };

  // Label bestimmen
  const label = shortLabel ? token.label.short : token.label[lang];

  return (
    <span
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      title={title || label}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {showIcon && (
        <IconComponent className={`${sizeConfig.iconSize} flex-shrink-0`} />
      )}
      {!iconOnly && <span>{label}</span>}
    </span>
  );
};

/**
 * RiskIndicator - Dezente Farbmarkierung für Tabellenzeilen
 * Zeigt nur eine farbige Linie links an
 */
interface RiskIndicatorProps {
  riskClass: string | null | undefined;
  className?: string;
}

export const RiskIndicator: React.FC<RiskIndicatorProps> = ({
  riskClass,
  className = '',
}) => {
  const token = getRiskToken(riskClass);

  return (
    <div
      className={`w-1 rounded-full ${token.row.borderLeft.replace('border-l-', 'bg-')} ${className}`}
      title={token.label.de}
    />
  );
};

/**
 * RiskDot - Minimaler Farbindikator (Punkt)
 * Für sehr kompakte Darstellungen
 */
interface RiskDotProps {
  riskClass: string | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  title?: string;
}

export const RiskDot: React.FC<RiskDotProps> = ({
  riskClass,
  size = 'md',
  className = '',
  title,
}) => {
  const token = getRiskToken(riskClass);

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  // Konvertiere border-Klasse zu bg-Klasse
  const bgColor = token.row.borderLeft.replace('border-l-', 'bg-');

  return (
    <span
      className={`inline-block rounded-full ${bgColor} ${sizeClasses[size]} ${className}`}
      title={title || token.label.de}
    />
  );
};

/**
 * RiskRow - Wrapper für Tabellenzeilen mit Risiko-Farbcodierung
 */
interface RiskRowProps {
  riskClass: string | null | undefined;
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'tr' | 'li';
}

export const RiskRow: React.FC<RiskRowProps> = ({
  riskClass,
  children,
  className = '',
  as: Component = 'div',
}) => {
  const token = getRiskToken(riskClass);

  return (
    <Component
      className={`${token.row.bg} ${token.row.borderLeft} border-l-4 ${token.row.hoverBg} transition-colors ${className}`}
    >
      {children}
    </Component>
  );
};

/**
 * useRiskClasses - Hook für direkten Zugriff auf CSS-Klassen
 */
export function useRiskClasses(riskClass: string | null | undefined) {
  const token = getRiskToken(riskClass);

  return {
    normalized: normalizeRiskClass(riskClass) as RiskClassExtended,
    token,
    badgeClasses: `${token.badge.bg} ${token.badge.text} ${token.badge.border} border`,
    rowClasses: `${token.row.bg} ${token.row.borderLeft} border-l-4 ${token.row.hoverBg}`,
    chartColor: token.chart.fill,
    label: token.label.de,
    labelEn: token.label.en,
    labelShort: token.label.short,
  };
}

export default RiskBadge;
