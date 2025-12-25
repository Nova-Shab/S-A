import React, { useState, useMemo } from "react";
import {
  ChangeHistoryEntry,
  ChangeAction,
  CHANGE_ACTION_LABELS,
  formatHistoryValue
} from "../models/types";

// =============================================================================
// V-04: ChangeHistoryPanel - Änderungshistorie anzeigen
// =============================================================================

interface ChangeHistoryPanelProps {
  history: ChangeHistoryEntry[];
  maxItems?: number;
  showFilters?: boolean;
}

export const ChangeHistoryPanel: React.FC<ChangeHistoryPanelProps> = ({
  history,
  maxItems,
  showFilters = true
}) => {
  const [actionFilter, setActionFilter] = useState<ChangeAction | "">("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter and sort history
  const filteredHistory = useMemo(() => {
    let result = [...history];

    if (actionFilter) {
      result = result.filter(entry => entry.action === actionFilter);
    }

    // Sort by timestamp descending (newest first)
    result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (maxItems) {
      result = result.slice(0, maxItems);
    }

    return result;
  }, [history, actionFilter, maxItems]);

  // Format timestamp
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Gerade eben";
    if (diffMins < 60) return `Vor ${diffMins} Min.`;
    if (diffHours < 24) return `Vor ${diffHours} Std.`;
    if (diffDays < 7) return `Vor ${diffDays} Tag${diffDays > 1 ? "en" : ""}`;

    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Get icon for action
  const getActionIcon = (action: ChangeAction) => {
    switch (action) {
      case "CREATE":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      case "UPDATE":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        );
      case "STATUS":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case "RISK_CLASS":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case "AUDIT":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      case "DELETE":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        );
    }
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>Keine Änderungen erfasst</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      {showFilters && (
        <div className="flex items-center gap-4 mb-4">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value as ChangeAction | "")}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Alle Änderungen</option>
            {Object.entries(CHANGE_ACTION_LABELS).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
          <span className="text-sm text-gray-500">
            {filteredHistory.length} von {history.length} Einträgen
          </span>
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        {/* Entries */}
        <div className="space-y-4">
          {filteredHistory.map((entry) => {
            const actionConfig = CHANGE_ACTION_LABELS[entry.action];
            const isExpanded = expandedId === entry.id;

            return (
              <div key={entry.id} className="relative flex gap-4">
                {/* Icon */}
                <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full ${actionConfig.color}`}>
                  {getActionIcon(entry.action)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div
                    className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {actionConfig.label}
                        </span>
                        {entry.fieldLabel && (
                          <span className="text-gray-500">
                            - {entry.fieldLabel}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                        {formatTimestamp(entry.timestamp)}
                      </span>
                    </div>

                    {/* User */}
                    {entry.userName && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{entry.userName}</span>
                      </div>
                    )}

                    {/* Description */}
                    {entry.description && (
                      <p className="text-sm text-gray-600 mb-2">{entry.description}</p>
                    )}

                    {/* Value changes (collapsed) */}
                    {entry.action !== "CREATE" && (entry.oldValue || entry.newValue) && !isExpanded && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400 truncate max-w-[120px]" title={formatHistoryValue(entry.oldValue, entry.field)}>
                          {formatHistoryValue(entry.oldValue, entry.field)}
                        </span>
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                        <span className="text-gray-700 truncate max-w-[120px] font-medium" title={formatHistoryValue(entry.newValue, entry.field)}>
                          {formatHistoryValue(entry.newValue, entry.field)}
                        </span>
                      </div>
                    )}

                    {/* Value changes (expanded) */}
                    {isExpanded && entry.action !== "CREATE" && (entry.oldValue || entry.newValue) && (
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-gray-400 mb-1">Vorher:</div>
                            <div className="text-sm bg-red-50 text-red-700 p-2 rounded break-words">
                              {formatHistoryValue(entry.oldValue, entry.field)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400 mb-1">Nachher:</div>
                            <div className="text-sm bg-green-50 text-green-700 p-2 rounded break-words">
                              {formatHistoryValue(entry.newValue, entry.field)}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(entry.timestamp).toLocaleString("de-DE", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit"
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Show more */}
      {maxItems && history.length > maxItems && (
        <div className="text-center pt-2">
          <span className="text-sm text-gray-500">
            +{history.length - maxItems} weitere Einträge
          </span>
        </div>
      )}
    </div>
  );
};
