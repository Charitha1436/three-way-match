'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2, FileText, Download } from 'lucide-react';

interface AuditTrailViewProps {
  poNumber: string;
  associatedDocs: any[];
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ poNumber, associatedDocs = [] }) => {
  const exportCsv = () => {
    const headers = 'Document Type,Reference Number,Date,Items Count\n';
    const rows = associatedDocs.map(d => `"${d.type}","${d.number}","${d.date}",${d.itemsCount}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_reconciliation_${poNumber}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" /> Reconciliation Audit Trail
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Immutable audit events and validation logs for PO #{poNumber}</p>
        </div>
        <button
          onClick={exportCsv}
          className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" /> Export Audit CSV
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Document Processing Timeline</h3>
        <div className="divide-y divide-slate-100 text-xs">
          {associatedDocs.map((doc, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{doc.type} Processed: #{doc.number}</p>
                  <p className="text-slate-500 text-[11px]">Timestamp: {doc.date} | Parsed {doc.itemsCount} line items</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> Validated
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};