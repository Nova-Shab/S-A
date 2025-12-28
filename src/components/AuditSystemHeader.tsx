/**
 * AuditSystemHeader - Shows linked system info in audit views
 * Provides context about which system the current audit belongs to
 */

import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useSystems } from "../context/SystemsContext";
import { RiskBadge } from "./RiskBadge";
import { RegisteredAiSystem } from "../models/types";

interface AuditSystemHeaderProps {
  className?: string;
  compact?: boolean;
}

export const AuditSystemHeader: React.FC<AuditSystemHeaderProps> = ({
  className = "",
  compact = false,
}) => {
  const [searchParams] = useSearchParams();
  const { getSystemById } = useSystems();
  const [system, setSystem] = useState<RegisteredAiSystem | null>(null);

  const systemId = searchParams.get("systemId");

  useEffect(() => {
    if (systemId) {
      const foundSystem = getSystemById(systemId);
      setSystem(foundSystem || null);
    } else {
      setSystem(null);
    }
  }, [systemId, getSystemById]);

  // Don't render if no system is linked
  if (!systemId || !system) {
    return null;
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-2 text-sm text-gray-600 ${className}`}>
        <span className="text-gray-400">System:</span>
        <Link
          to={`/systems/${system.id}`}
          className="font-medium text-audit-primary hover:underline"
        >
          {system.systemInfo.systemName}
        </Link>
        {system.riskClass && (
          <RiskBadge riskClass={system.riskClass} size="xs" />
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 mb-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* System Icon */}
          <div className="w-10 h-10 rounded-lg bg-audit-surface flex items-center justify-center">
            <svg className="w-5 h-5 text-audit-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">
                {system.systemInfo.systemName}
              </h3>
              {system.riskClass && (
                <RiskBadge riskClass={system.riskClass} size="sm" />
              )}
            </div>
            {system.systemInfo.primaryPurpose && (
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                {system.systemInfo.primaryPurpose}
              </p>
            )}
          </div>
        </div>

        {/* Link to system details */}
        <Link
          to={`/systems/${system.id}`}
          className="text-sm text-audit-primary hover:text-audit-primary-dark flex items-center gap-1"
        >
          <span>Zum System</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </Link>
      </div>

      {/* Quick stats */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span className="font-medium">Abteilung:</span>
          <span>{system.department || "—"}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-medium">Verantwortlich:</span>
          <span>{system.responsiblePerson || "—"}</span>
        </div>
        {system.auditCount > 0 && (
          <div className="flex items-center gap-1">
            <span className="font-medium">Audits:</span>
            <span>{system.auditCount}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditSystemHeader;
