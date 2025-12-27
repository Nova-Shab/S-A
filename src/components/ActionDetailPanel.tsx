import React, { useState, useEffect } from 'react';
import { ActionItem } from '../services/actionsService';

interface ActionDetailPanelProps {
  action: ActionItem;
  language: 'de' | 'en';
  onClose: () => void;
  onUpdate: (id: number, updates: Partial<ActionItem>) => void;
}

export const ActionDetailPanel: React.FC<ActionDetailPanelProps> = ({
  action,
  language,
  onClose,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedStatus, setEditedStatus] = useState(action.status);
  const [editedResponsible, setEditedResponsible] = useState(action.responsible);
  const [editedTargetDate, setEditedTargetDate] = useState(action.targetDate || '');
  const [editedNotes, setEditedNotes] = useState(action.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when action changes
  useEffect(() => {
    setEditedStatus(action.status);
    setEditedResponsible(action.responsible);
    setEditedTargetDate(action.targetDate || '');
    setEditedNotes(action.notes || '');
    setIsEditing(false);
  }, [action]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(action.id, {
        status: editedStatus,
        responsible: editedResponsible,
        targetDate: editedTargetDate || undefined,
        notes: editedNotes || undefined,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving action:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedStatus(action.status);
    setEditedResponsible(action.responsible);
    setEditedTargetDate(action.targetDate || '');
    setEditedNotes(action.notes || '');
    setIsEditing(false);
  };

  // Quick status change
  const handleQuickStatusChange = async (newStatus: typeof action.status) => {
    setIsSaving(true);
    try {
      await onUpdate(action.id, { status: newStatus });
      setEditedStatus(newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Status badge styling
  const getStatusBadge = (status: string, isButton = false) => {
    const styles: Record<string, string> = {
      open: 'bg-audit-bg text-audit-steel border border-audit-light',
      in_progress: 'bg-blue-50 text-blue-700 border border-blue-200',
      completed: 'bg-green-50 text-green-700 border border-green-200',
      deferred: 'bg-gray-100 text-gray-600 border border-gray-200',
    };
    const labels: Record<string, Record<string, string>> = {
      de: { open: 'Offen', in_progress: 'In Bearbeitung', completed: 'Abgeschlossen', deferred: 'Zurückgestellt' },
      en: { open: 'Open', in_progress: 'In Progress', completed: 'Completed', deferred: 'Deferred' },
    };
    const baseClass = isButton
      ? `px-3 py-1.5 text-sm font-medium rounded-audit cursor-pointer transition-all hover:ring-2 hover:ring-offset-1 hover:ring-audit-steel ${styles[status]}`
      : `px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`;
    return (
      <span className={baseClass}>
        {labels[language]?.[status] || status}
      </span>
    );
  };

  // Severity badge styling
  const getSeverityBadge = (severity: string) => {
    const styles: Record<string, string> = {
      hoch: 'bg-red-50 text-red-700 border border-red-200',
      mittel: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
      niedrig: 'bg-green-50 text-green-700 border border-green-200',
    };
    const labels: Record<string, Record<string, string>> = {
      de: { hoch: 'Hoch', mittel: 'Mittel', niedrig: 'Niedrig' },
      en: { hoch: 'High', mittel: 'Medium', niedrig: 'Low' },
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[severity]}`}>
        {labels[language]?.[severity] || severity}
      </span>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-25 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-xl z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-audit-light bg-audit-bg flex items-start justify-between">
          <div className="flex-1 pr-4">
            <h2 className="text-lg font-semibold text-audit-deep line-clamp-2">
              {action.requirementTitle}
            </h2>
            <p className="text-sm text-audit-cool mt-1">{action.category}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-audit-cool hover:text-audit-deep hover:bg-white rounded-audit transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Quick Status Actions */}
          {!isEditing && (
            <div className="mb-6">
              <label className="block text-xs font-medium text-audit-cool mb-2 uppercase tracking-wide">
                {language === 'de' ? 'Status ändern' : 'Change Status'}
              </label>
              <div className="flex flex-wrap gap-2">
                {(['open', 'in_progress', 'completed', 'deferred'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleQuickStatusChange(status)}
                    disabled={isSaving || action.status === status}
                    className={`transition-all ${action.status === status ? 'ring-2 ring-offset-1 ring-audit-steel' : ''}`}
                  >
                    {getStatusBadge(status, true)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* System Info */}
          <div className="mb-6 p-4 bg-audit-bg rounded-audit">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <svg className="w-5 h-5 text-audit-steel" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-audit-deep">{action.systemName}</div>
                <div className="text-xs text-audit-cool">
                  {action.systemRiskClass?.replace('_', ' ') || (language === 'de' ? 'Nicht klassifiziert' : 'Not classified')}
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="space-y-4">
            {/* Status & Severity Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-audit-cool mb-1 uppercase tracking-wide">
                  {language === 'de' ? 'Status' : 'Status'}
                </label>
                {isEditing ? (
                  <select
                    value={editedStatus}
                    onChange={(e) => setEditedStatus(e.target.value as typeof action.status)}
                    className="w-full px-3 py-2 text-sm border border-audit-light rounded-audit focus:outline-none focus:ring-2 focus:ring-audit-steel"
                  >
                    <option value="open">{language === 'de' ? 'Offen' : 'Open'}</option>
                    <option value="in_progress">{language === 'de' ? 'In Bearbeitung' : 'In Progress'}</option>
                    <option value="completed">{language === 'de' ? 'Abgeschlossen' : 'Completed'}</option>
                    <option value="deferred">{language === 'de' ? 'Zurückgestellt' : 'Deferred'}</option>
                  </select>
                ) : (
                  <div>{getStatusBadge(action.status)}</div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-audit-cool mb-1 uppercase tracking-wide">
                  {language === 'de' ? 'Priorität' : 'Priority'}
                </label>
                <div>{getSeverityBadge(action.severity)}</div>
              </div>
            </div>

            {/* Responsible */}
            <div>
              <label className="block text-xs font-medium text-audit-cool mb-1 uppercase tracking-wide">
                {language === 'de' ? 'Verantwortlich' : 'Responsible'}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedResponsible}
                  onChange={(e) => setEditedResponsible(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-audit-light rounded-audit focus:outline-none focus:ring-2 focus:ring-audit-steel"
                  placeholder={language === 'de' ? 'Name eingeben...' : 'Enter name...'}
                />
              ) : (
                <div className="text-sm text-audit-deep">{action.responsible || '-'}</div>
              )}
            </div>

            {/* Target Date */}
            <div>
              <label className="block text-xs font-medium text-audit-cool mb-1 uppercase tracking-wide">
                {language === 'de' ? 'Fälligkeitsdatum' : 'Due Date'}
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={editedTargetDate}
                  onChange={(e) => setEditedTargetDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-audit-light rounded-audit focus:outline-none focus:ring-2 focus:ring-audit-steel"
                />
              ) : (
                <div className={`text-sm ${action.isOverdue ? 'text-red-600 font-medium' : 'text-audit-deep'}`}>
                  {formatDate(action.targetDate)}
                  {action.isOverdue && (
                    <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                      {language === 'de' ? 'Überfällig' : 'Overdue'}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Recommended Action */}
            <div>
              <label className="block text-xs font-medium text-audit-cool mb-1 uppercase tracking-wide">
                {language === 'de' ? 'Empfohlene Maßnahme' : 'Recommended Action'}
              </label>
              <div className="text-sm text-audit-deep bg-audit-bg p-3 rounded-audit">
                {action.recommendedAction}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-audit-cool mb-1 uppercase tracking-wide">
                {language === 'de' ? 'Notizen' : 'Notes'}
              </label>
              {isEditing ? (
                <textarea
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-audit-light rounded-audit focus:outline-none focus:ring-2 focus:ring-audit-steel resize-none"
                  placeholder={language === 'de' ? 'Notizen hinzufügen...' : 'Add notes...'}
                />
              ) : (
                <div className="text-sm text-audit-deep">
                  {action.notes || (language === 'de' ? 'Keine Notizen' : 'No notes')}
                </div>
              )}
            </div>

            {/* Meta Info */}
            <div className="pt-4 border-t border-audit-light">
              <div className="grid grid-cols-2 gap-4 text-xs text-audit-cool">
                <div>
                  <span className="block font-medium uppercase tracking-wide mb-1">
                    {language === 'de' ? 'Erstellt' : 'Created'}
                  </span>
                  {new Date(action.createdAt).toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US')}
                </div>
                <div>
                  <span className="block font-medium uppercase tracking-wide mb-1">
                    {language === 'de' ? 'Aktualisiert' : 'Updated'}
                  </span>
                  {new Date(action.updatedAt).toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US')}
                </div>
              </div>
              {action.lastModifiedBy && (
                <div className="mt-3 text-xs text-audit-cool">
                  <span className="font-medium uppercase tracking-wide">
                    {language === 'de' ? 'Zuletzt bearbeitet von: ' : 'Last modified by: '}
                  </span>
                  {action.lastModifiedBy.firstName} {action.lastModifiedBy.lastName}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-audit-light bg-white">
          {isEditing ? (
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 text-sm font-medium text-audit-cool border border-audit-light rounded-audit hover:bg-audit-bg transition-colors"
              >
                {language === 'de' ? 'Abbrechen' : 'Cancel'}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-audit-steel rounded-audit hover:bg-audit-deep transition-colors disabled:opacity-50"
              >
                {isSaving
                  ? (language === 'de' ? 'Speichern...' : 'Saving...')
                  : (language === 'de' ? 'Speichern' : 'Save')}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full px-4 py-2 text-sm font-medium text-audit-steel border border-audit-steel rounded-audit hover:bg-audit-bg transition-colors"
            >
              <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {language === 'de' ? 'Bearbeiten' : 'Edit'}
            </button>
          )}
        </div>
      </div>
    </>
  );
};
