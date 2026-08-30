'use client';

import React, { useState } from 'react';
import { ItemGrid } from './ItemGrid';
import { AlertTriangle, ZoomIn, ZoomOut, RotateCw, FileText, CheckCircle2, ExternalLink } from 'lucide-react';

interface DocumentDetailViewProps {
  documentType: 'PO' | 'GRN' | 'INVOICE';
  documents: any[];
  poRef: string;
}

export const DocumentDetailView: React.FC<DocumentDetailViewProps> = ({
  documentType,
  documents = [],
  poRef,
}) => {
  const [selectedDocIdx, setSelectedDocIdx] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);

  if (!documents || documents.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
        No documents uploaded for this view yet.
      </div>
    );
  }

  const activeDoc = documents[selectedDocIdx] || documents[0];
  const items = activeDoc.items || [];
  const fileName = activeDoc.filePath || `${documentType.toLowerCase()}_sample.pdf`;
  
  // Point directly to backend uploads host
  const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const fileUrl = `${backendBaseUrl}/uploads/${fileName}`;

  const accentColor =
    documentType === 'PO'
      ? 'border-l-indigo-600'
      : documentType === 'GRN'
      ? 'border-l-emerald-600'
      : 'border-l-blue-600';

  const docTitle =
    documentType === 'PO'
      ? 'Purchase Order'
      : documentType === 'GRN'
      ? 'Goods Receipt Note (GRN)'
      : 'Tax Invoice';

  const docNumber =
    activeDoc.poNumber ||
    activeDoc.grnNumber ||
    activeDoc.invoiceNumber ||
    poRef;

  const docDate =
    activeDoc.poDate ||
    activeDoc.grnDate ||
    activeDoc.invoiceDate ||
    '2026-03-17';

  const totalAmount = items.reduce((sum: number, it: any) => {
    const qty = it.quantity ?? it.receivedQuantity ?? 0;
    const rate = it.unitRate ?? it.unitPrice ?? 0;
    return sum + (qty * rate);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Sub-document selector pills */}
      {documents.length > 1 && (
        <div className="flex items-center gap-2 pb-1 overflow-x-auto">
          <span className="text-xs font-semibold text-slate-500 uppercase mr-1">Select Document:</span>
          {documents.map((doc, idx) => {
            const label =
              doc.grnNumber
                ? `GRN: ${doc.grnNumber}`
                : doc.invoiceNumber
                ? `Invoice: ${doc.invoiceNumber}`
                : `PO (v${idx + 1})`;
            const isSelected = selectedDocIdx === idx;
            return (
              <button
                key={idx}
                onClick={() => setSelectedDocIdx(idx)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Details */}
        <div className={`lg:col-span-5 bg-white rounded-xl border border-slate-200 border-l-4 ${accentColor} p-5 shadow-sm space-y-4`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Document Details</span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">{docTitle}</h3>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" /> Processed
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 font-medium block">Document No</label>
              <p className="font-mono font-bold text-slate-900 mt-0.5">{docNumber}</p>
            </div>
            <div>
              <label className="text-slate-400 font-medium block">Document Date</label>
              <p className="font-semibold text-slate-800 mt-0.5">{docDate}</p>
            </div>
            <div>
              <label className="text-slate-400 font-medium block">PO Reference</label>
              <p className="font-mono font-semibold text-indigo-600 mt-0.5">{poRef}</p>
            </div>
            <div>
              <label className="text-slate-400 font-medium block">Total Line Items</label>
              <p className="font-semibold text-slate-800 mt-0.5">{items.length} Items</p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <label className="text-[11px] text-slate-400 font-medium block">Vendor / Billing Entity</label>
            <p className="text-xs font-semibold text-slate-900 mt-0.5">{activeDoc.vendorName || 'M/s AFP Supply Chain & Foods Pvt Ltd'}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Sector 18, Industrial Area, Gurugram, HR</p>
          </div>
        </div>

        {/* Right Column: Interactive Document Canvas Preview */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-medium truncate">
              <FileText className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
              <span className="truncate font-semibold">{fileName}</span>
            </div>
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded px-1.5 py-0.5">
              <button
                onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
                className="p-1 hover:bg-slate-100 rounded text-slate-600"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono font-medium text-slate-600 px-1">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(140, z + 10))}
                className="p-1 hover:bg-slate-100 rounded text-slate-600"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(100)}
                className="p-1 hover:bg-slate-100 rounded text-slate-600 ml-0.5"
                title="Reset Zoom"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-100/70 min-h-[220px] max-h-[260px] overflow-auto flex items-start justify-center">
            <div
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              className="bg-white border border-slate-300 rounded shadow-sm p-4 w-full text-left transition-transform duration-150"
            >
              <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-2">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{docTitle.toUpperCase()}</h4>
                  <p className="text-[10px] text-slate-500 font-mono">Ref: {docNumber}</p>
                </div>
                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {docDate}
                </span>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-600">
                  <span>Vendor:</span>
                  <span className="font-semibold text-slate-800">M/s AFP Supply Chain</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>PO Reference:</span>
                  <span className="font-mono text-slate-800">{poRef}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Parsed Lines:</span>
                  <span className="font-semibold text-slate-800">{items.length} SKUs</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold pt-1 border-t border-slate-100">
                  <span>Calculated Document Total:</span>
                  <span className="font-mono">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Line Items */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800">
            {docTitle} Line Items ({items.length})
          </h3>
          <span className="text-xs text-slate-500 font-medium">Document ID: {docNumber}</span>
        </div>
        <ItemGrid
          items={items}
          mode={documentType === 'PO' ? 'PO' : documentType === 'GRN' ? 'GRN' : 'INVOICE'}
        />
      </div>
    </div>
  );
};