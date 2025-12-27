import React from 'react';
import { ActionStatsData } from '../services/actionsService';

interface ActionChartsProps {
  data: ActionStatsData;
  language: 'de' | 'en';
}

export const ActionCharts: React.FC<ActionChartsProps> = ({ data, language }) => {
  const statusColors: Record<string, string> = {
    open: 'bg-audit-steel',
    in_progress: 'bg-blue-500',
    completed: 'bg-green-500',
    deferred: 'bg-gray-400',
  };

  const statusLabels: Record<string, Record<string, string>> = {
    de: { open: 'Offen', in_progress: 'In Bearbeitung', completed: 'Abgeschlossen', deferred: 'Zurückgestellt' },
    en: { open: 'Open', in_progress: 'In Progress', completed: 'Completed', deferred: 'Deferred' },
  };

  const totalByStatus = data.byStatus.reduce((acc, item) => acc + item.count, 0);
  const maxBySystem = Math.max(...data.bySystem.map((s) => s.total), 1);

  // Format week label
  const formatWeekLabel = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', { month: 'short' });
    return `${day}. ${month}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Status Distribution - Donut Chart */}
      <div className="bg-white rounded-audit p-6 shadow-audit border border-audit-light">
        <h3 className="text-lg font-semibold text-audit-deep mb-4">
          {language === 'de' ? 'Status-Verteilung' : 'Status Distribution'}
        </h3>

        {totalByStatus > 0 ? (
          <div className="flex items-center gap-8">
            {/* Simple Donut Visualization */}
            <div className="relative w-40 h-40 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {data.byStatus.reduce((acc, item, index) => {
                  const percentage = (item.count / totalByStatus) * 100;
                  const circumference = 2 * Math.PI * 35;
                  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                  const offset = acc.offset;

                  acc.elements.push(
                    <circle
                      key={item.status}
                      cx="50"
                      cy="50"
                      r="35"
                      fill="none"
                      strokeWidth="20"
                      className={`${statusColors[item.status].replace('bg-', 'stroke-')}`}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={-offset}
                      style={{ transition: 'stroke-dasharray 0.3s ease' }}
                    />
                  );
                  acc.offset += (percentage / 100) * circumference;
                  return acc;
                }, { elements: [] as JSX.Element[], offset: 0 }).elements}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-audit-deep">{totalByStatus}</div>
                  <div className="text-xs text-audit-cool">
                    {language === 'de' ? 'Gesamt' : 'Total'}
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-3">
              {data.byStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${statusColors[item.status]}`}></div>
                    <span className="text-sm text-audit-deep">
                      {statusLabels[language]?.[item.status] || item.label}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-audit-deep">
                    {item.count}
                    <span className="text-audit-cool ml-1">
                      ({Math.round((item.count / totalByStatus) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-audit-cool">
            {language === 'de' ? 'Keine Daten vorhanden' : 'No data available'}
          </div>
        )}
      </div>

      {/* Actions by System - Bar Chart */}
      <div className="bg-white rounded-audit p-6 shadow-audit border border-audit-light">
        <h3 className="text-lg font-semibold text-audit-deep mb-4">
          {language === 'de' ? 'Maßnahmen pro System' : 'Actions by System'}
        </h3>

        {data.bySystem.length > 0 ? (
          <div className="space-y-4">
            {data.bySystem.slice(0, 6).map((system) => (
              <div key={system.systemId}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-audit-deep truncate max-w-[200px]" title={system.systemName}>
                    {system.systemName}
                  </span>
                  <span className="text-sm text-audit-cool">
                    {system.completed}/{system.total}
                  </span>
                </div>
                <div className="h-6 bg-audit-bg rounded-audit overflow-hidden flex">
                  <div
                    className="bg-green-500 h-full transition-all duration-300"
                    style={{ width: `${(system.completed / maxBySystem) * 100}%` }}
                    title={language === 'de' ? `${system.completed} Abgeschlossen` : `${system.completed} Completed`}
                  ></div>
                  <div
                    className="bg-audit-steel h-full transition-all duration-300"
                    style={{ width: `${(system.pending / maxBySystem) * 100}%` }}
                    title={language === 'de' ? `${system.pending} Ausstehend` : `${system.pending} Pending`}
                  ></div>
                </div>
              </div>
            ))}

            {/* Legend */}
            <div className="flex items-center gap-4 pt-2 border-t border-audit-light">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <span className="text-xs text-audit-cool">
                  {language === 'de' ? 'Abgeschlossen' : 'Completed'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-audit-steel"></div>
                <span className="text-xs text-audit-cool">
                  {language === 'de' ? 'Ausstehend' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-audit-cool">
            {language === 'de' ? 'Keine Daten vorhanden' : 'No data available'}
          </div>
        )}
      </div>

      {/* Timeline - Due Dates Chart */}
      <div className="bg-white rounded-audit p-6 shadow-audit border border-audit-light lg:col-span-2">
        <h3 className="text-lg font-semibold text-audit-deep mb-4">
          {language === 'de' ? 'Fälligkeiten-Timeline (12 Wochen)' : 'Due Dates Timeline (12 Weeks)'}
        </h3>

        {data.timeline.length > 0 ? (
          <div className="relative">
            {/* Chart Area */}
            <div className="flex items-end gap-2 h-48 pb-8">
              {data.timeline.map((week, index) => {
                const maxHeight = Math.max(...data.timeline.map((w) => w.due + w.completed), 1);
                const dueHeight = (week.due / maxHeight) * 100;
                const completedHeight = (week.completed / maxHeight) * 100;
                const total = week.due + week.completed;

                return (
                  <div
                    key={week.weekStart}
                    className="flex-1 flex flex-col items-center gap-1 group relative"
                  >
                    {/* Bars */}
                    <div className="w-full flex flex-col items-center justify-end h-40">
                      {total > 0 && (
                        <div className="w-full max-w-8 flex flex-col">
                          {week.due > 0 && (
                            <div
                              className="bg-amber-400 rounded-t transition-all duration-300 group-hover:bg-amber-500"
                              style={{ height: `${dueHeight}%`, minHeight: week.due > 0 ? '4px' : '0' }}
                            ></div>
                          )}
                          {week.completed > 0 && (
                            <div
                              className={`bg-green-500 transition-all duration-300 group-hover:bg-green-600 ${week.due === 0 ? 'rounded-t' : ''} rounded-b`}
                              style={{ height: `${completedHeight}%`, minHeight: week.completed > 0 ? '4px' : '0' }}
                            ></div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Week Label */}
                    <div className="text-xs text-audit-cool transform rotate-45 origin-left translate-y-4 whitespace-nowrap">
                      {formatWeekLabel(week.weekStart)}
                    </div>

                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-audit-deep text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      {language === 'de'
                        ? `${week.due} fällig, ${week.completed} erledigt`
                        : `${week.due} due, ${week.completed} done`}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 pt-4 border-t border-audit-light">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-amber-400"></div>
                <span className="text-sm text-audit-cool">
                  {language === 'de' ? 'Fällig' : 'Due'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <span className="text-sm text-audit-cool">
                  {language === 'de' ? 'Abgeschlossen' : 'Completed'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-audit-cool">
            {language === 'de' ? 'Keine Fälligkeiten in den nächsten 12 Wochen' : 'No due dates in the next 12 weeks'}
          </div>
        )}
      </div>

      {/* Summary Stats Cards */}
      <div className="bg-white rounded-audit p-6 shadow-audit border border-audit-light lg:col-span-2">
        <h3 className="text-lg font-semibold text-audit-deep mb-4">
          {language === 'de' ? 'Zusammenfassung' : 'Summary'}
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Completion Rate */}
          <div className="p-4 bg-audit-bg rounded-audit text-center">
            <div className="text-3xl font-semibold text-audit-deep">
              {totalByStatus > 0
                ? Math.round((data.byStatus.find((s) => s.status === 'completed')?.count || 0) / totalByStatus * 100)
                : 0}%
            </div>
            <div className="text-sm text-audit-cool">
              {language === 'de' ? 'Abschlussrate' : 'Completion Rate'}
            </div>
          </div>

          {/* Systems with Actions */}
          <div className="p-4 bg-audit-bg rounded-audit text-center">
            <div className="text-3xl font-semibold text-audit-deep">
              {data.bySystem.length}
            </div>
            <div className="text-sm text-audit-cool">
              {language === 'de' ? 'Systeme mit Maßnahmen' : 'Systems with Actions'}
            </div>
          </div>

          {/* Average per System */}
          <div className="p-4 bg-audit-bg rounded-audit text-center">
            <div className="text-3xl font-semibold text-audit-deep">
              {data.bySystem.length > 0
                ? Math.round(totalByStatus / data.bySystem.length * 10) / 10
                : 0}
            </div>
            <div className="text-sm text-audit-cool">
              {language === 'de' ? 'Durchschnitt pro System' : 'Average per System'}
            </div>
          </div>

          {/* Due This Month */}
          <div className="p-4 bg-audit-bg rounded-audit text-center">
            <div className="text-3xl font-semibold text-amber-600">
              {data.timeline.slice(0, 4).reduce((acc, week) => acc + week.due, 0)}
            </div>
            <div className="text-sm text-audit-cool">
              {language === 'de' ? 'Fällig in 4 Wochen' : 'Due in 4 Weeks'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
