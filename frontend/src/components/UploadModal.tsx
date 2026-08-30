'use client';

import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import api from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPo: string;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, defaultPo }) => {
  const [docType, setDocType] = useState<'PO' | 'GRN' | 'INVOICE'>('PO');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF or image file.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', docType);

    try {
      await api.post('/documents/upload', formData);

      queryClient.invalidateQueries({ queryKey: ['match', defaultPo] });
      queryClient.invalidateQueries({ queryKey: ['summary', defaultPo] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      onClose();
    } catch (err: any) {
      const serverMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(serverMsg || 'Failed to upload and parse document.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold text-slate-900 mb-1">Upload Document</h2>
        <p className="text-xs text-slate-500 mb-4">Gemini will automatically extract and resolve line items against SKU Master.</p>

        {error && <div className="p-3 mb-4 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg break-words">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Document Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(['PO', 'GRN', 'INVOICE'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDocType(t)}
                  className={`py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                    docType === t
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t === 'PO' ? 'PO' : t === 'GRN' ? 'GRN (Delivery)' : 'Invoice'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">File (PDF / Image)</label>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-slate-200 rounded-lg p-1"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-all flex items-center justify-center gap-2 mt-6"
          >
            <Upload className="w-4 h-4" />
            {loading ? 'Parsing via Gemini...' : 'Upload & Process'}
          </button>
        </form>
      </div>
    </div>
  );
};