'use client';

import React from 'react';
import { FileText, AlertOctagon, CheckCircle2, Clock, UploadCloud } from 'lucide-react';

interface AppHeaderProps {
  poNumber: string;
  setPoNumber: (val: string) => void;
  status: string;
  onOpenUpload: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  poNumber,
  setPoNumber,
  status,
  onOpenUpload,
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'MATCHED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Fully Matched
          </span>
        );
      case 'MISMATCH':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" /> Discrepancies Detected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-500" /> Insufficient Documents
          </span>
        );
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">3-Way Match Engine</h1>
          <div className="mt-0.5">{getStatusBadge()}</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs">
          <span className="text-slate-400 font-semibold mr-2 uppercase">PO Ref:</span>
          <input
            type="text"
            value={poNumber}
            onChange={(e) => setPoNumber(e.target.value)}
            className="bg-transparent font-mono font-bold text-slate-800 focus:outline-none w-28"
          />
        </div>

        <button
          onClick={onOpenUpload}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <UploadCloud className="w-4 h-4" /> + Upload Document
        </button>
      </div>
    </header>
  );
};