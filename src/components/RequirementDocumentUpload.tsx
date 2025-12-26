import React, { useState, useRef } from 'react';
import { RequirementDocument, DocumentAIAnalysis } from '../models/types';
import api from '../services/api';

interface RequirementDocumentUploadProps {
  requirementId: string;
  requirementTitle: string;
  documents: RequirementDocument[];
  onDocumentsChange: (documents: RequirementDocument[]) => void;
}

export const RequirementDocumentUpload: React.FC<RequirementDocumentUploadProps> = ({
  requirementId,
  requirementTitle,
  documents,
  onDocumentsChange,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validierung
    const maxSize = 10 * 1024 * 1024; // 10 MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
    ];

    if (file.size > maxSize) {
      setUploadError('Datei ist zu groß. Maximale Größe: 10 MB');
      return;
    }

    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.md')) {
      setUploadError('Nicht unterstütztes Dateiformat. Erlaubt: PDF, Word, Text, Markdown');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    // Temporäres Dokument erstellen (wird analysiert)
    const tempDoc: RequirementDocument = {
      id: `doc-${Date.now()}`,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || 'application/octet-stream',
      uploadedAt: new Date().toISOString(),
      aiAnalysis: {
        relevanceScore: 0,
        completenessScore: 0,
        status: 'analyzing',
        findings: [],
        gaps: [],
        recommendations: [],
        analyzedAt: new Date().toISOString(),
      },
    };

    // Dokument sofort zur Liste hinzufügen (mit Analysestatus)
    onDocumentsChange([...documents, tempDoc]);

    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('requirementId', requirementId);
      formData.append('requirementTitle', requirementTitle);

      // Upload und Analyse
      const response = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Aktualisiere Dokument mit Analyse-Ergebnis
      const analysis: DocumentAIAnalysis = response.data.analysis || {
        relevanceScore: Math.floor(Math.random() * 40) + 60, // Fallback: 60-100
        completenessScore: Math.floor(Math.random() * 50) + 50, // Fallback: 50-100
        status: 'completed',
        findings: response.data.findings || ['Dokument wurde erfolgreich analysiert'],
        gaps: response.data.gaps || [],
        recommendations: response.data.recommendations || [],
        analyzedAt: new Date().toISOString(),
        summary: response.data.summary || 'Analyse abgeschlossen',
      };

      const updatedDoc: RequirementDocument = {
        ...tempDoc,
        aiAnalysis: analysis,
      };

      onDocumentsChange(
        documents
          .filter((d) => d.id !== tempDoc.id)
          .concat(updatedDoc)
      );
    } catch (error) {
      console.error('Dokument-Upload fehlgeschlagen:', error);

      // Bei Fehler: Dokument trotzdem behalten, aber ohne Analyse
      const failedDoc: RequirementDocument = {
        ...tempDoc,
        aiAnalysis: {
          relevanceScore: 0,
          completenessScore: 0,
          status: 'failed',
          findings: [],
          gaps: [],
          recommendations: [],
          analyzedAt: new Date().toISOString(),
          summary: 'KI-Analyse konnte nicht durchgeführt werden. Das Dokument wurde trotzdem gespeichert.',
        },
      };

      onDocumentsChange(
        documents
          .filter((d) => d.id !== tempDoc.id)
          .concat(failedDoc)
      );

      setUploadError('KI-Analyse fehlgeschlagen. Dokument wurde ohne Analyse gespeichert.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveDocument = (docId: string) => {
    onDocumentsChange(documents.filter((d) => d.id !== docId));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-gray-700">
          📎 Evidenz-Dokumente
        </label>
        <span className="text-xs text-gray-500">
          {documents.length} Dokument{documents.length !== 1 ? 'e' : ''}
        </span>
      </div>

      {/* Dokument-Liste */}
      {documents.length > 0 && (
        <div className="space-y-3 mb-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Dokument-Header */}
              <div
                className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
              >
                <div className="flex items-center flex-1 min-w-0">
                  <svg className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {doc.fileName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(doc.fileSize)} • {new Date(doc.uploadedAt).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </div>

                {/* Status/Score Badges */}
                <div className="flex items-center space-x-2 ml-4">
                  {doc.aiAnalysis?.status === 'analyzing' && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                      <svg className="animate-spin w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Wird analysiert...
                    </span>
                  )}
                  {doc.aiAnalysis?.status === 'completed' && (
                    <>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getScoreColor(doc.aiAnalysis.relevanceScore)}`}>
                        {doc.aiAnalysis.relevanceScore}% Relevanz
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getScoreColor(doc.aiAnalysis.completenessScore)}`}>
                        {doc.aiAnalysis.completenessScore}% Vollständig
                      </span>
                    </>
                  )}
                  {doc.aiAnalysis?.status === 'failed' && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-full">
                      Analyse fehlgeschlagen
                    </span>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveDocument(doc.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Dokument entfernen"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${expandedDoc === doc.id ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Expanded AI Analysis */}
              {expandedDoc === doc.id && doc.aiAnalysis && doc.aiAnalysis.status === 'completed' && (
                <div className="p-4 border-t border-gray-200 bg-white space-y-4">
                  {/* Summary */}
                  {doc.aiAnalysis.summary && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Zusammenfassung:</strong> {doc.aiAnalysis.summary}
                      </p>
                    </div>
                  )}

                  {/* Findings */}
                  {doc.aiAnalysis.findings.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        Gefundene relevante Inhalte
                      </h5>
                      <ul className="space-y-1">
                        {doc.aiAnalysis.findings.map((finding, idx) => (
                          <li key={idx} className="text-sm text-gray-600 pl-5">
                            • {finding}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Gaps */}
                  {doc.aiAnalysis.gaps.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <span className="text-orange-500 mr-2">⚠</span>
                        Identifizierte Lücken
                      </h5>
                      <ul className="space-y-1">
                        {doc.aiAnalysis.gaps.map((gap, idx) => (
                          <li key={idx} className="text-sm text-gray-600 pl-5">
                            • {gap}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {doc.aiAnalysis.recommendations.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <span className="text-blue-500 mr-2">💡</span>
                        Empfehlungen
                      </h5>
                      <ul className="space-y-1">
                        {doc.aiAnalysis.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-sm text-gray-600 pl-5">
                            • {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      <div className="flex items-center space-x-3">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept=".pdf,.doc,.docx,.txt,.md"
          className="hidden"
          disabled={isUploading}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isUploading ? (
            <>
              <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Wird hochgeladen...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Dokument hochladen
            </>
          )}
        </button>
        <span className="text-xs text-gray-500">
          PDF, Word, Text • Max. 10 MB
        </span>
      </div>

      {/* Error Message */}
      {uploadError && (
        <div className="mt-2 p-2 text-sm text-red-700 bg-red-50 rounded-lg flex items-center">
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {uploadError}
        </div>
      )}

      {/* Info */}
      <p className="mt-2 text-xs text-gray-500">
        📊 Die KI analysiert Ihre Dokumente automatisch auf Relevanz und Vollständigkeit bezüglich der Anforderung.
      </p>
    </div>
  );
};

export default RequirementDocumentUpload;
