'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface ItemGridProps {
  items: any[];
  mode?: 'RECONCILIATION' | 'PO' | 'GRN' | 'INVOICE';
}

export const ItemGrid: React.FC<ItemGridProps> = ({ items = [], mode = 'RECONCILIATION' }) => {
  if (!items || items.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm bg-slate-50 rounded-lg border border-dashed border-slate-200">
        No line items available for this view.
      </div>
    );
  }

  // Document-specific table for PO tab
  if (mode === 'PO') {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <th className="py-3 px-4">Item Code</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4 text-right">Ordered Qty</th>
              <th className="py-3 px-4 text-right">Unit Price</th>
              <th className="py-3 px-4 text-right">Total Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-normal">
            {items.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-mono font-medium text-slate-900">{item.itemCode || `ITEM-${idx + 1}`}</td>
                <td className="py-3 px-4 max-w-xs truncate">{item.description}</td>
                <td className="py-3 px-4 text-right font-semibold">{item.quantity ?? item.poQuantity ?? 0}</td>
                <td className="py-3 px-4 text-right font-mono">₹{Number(item.unitPrice ?? item.poUnitPrice ?? 0).toFixed(2)}</td>
                <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                  ₹{Number((item.quantity ?? item.poQuantity ?? 0) * (item.unitPrice ?? item.poUnitPrice ?? 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Document-specific table for Delivery (GRN) tab
  if (mode === 'GRN') {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <th className="py-3 px-4">Item Code</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4 text-right">Received Qty</th>
              <th className="py-3 px-4 text-right">Unit Price</th>
              <th className="py-3 px-4 text-right">MRP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-normal">
            {items.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-mono font-medium text-slate-900">{item.itemCode || `ITEM-${idx + 1}`}</td>
                <td className="py-3 px-4 max-w-xs truncate">{item.description}</td>
                <td className="py-3 px-4 text-right font-semibold text-emerald-700">{item.receivedQuantity ?? 0}</td>
                <td className="py-3 px-4 text-right font-mono">₹{Number(item.unitPrice ?? 0).toFixed(2)}</td>
                <td className="py-3 px-4 text-right font-mono text-slate-500">₹{Number(item.mrp ?? 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Document-specific table for Fulfillment (Invoice) tab
  if (mode === 'INVOICE') {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <th className="py-3 px-4">Item Code</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4 text-right">Invoiced Qty</th>
              <th className="py-3 px-4 text-right">Unit Rate</th>
              <th className="py-3 px-4 text-right">Total Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-normal">
            {items.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-mono font-medium text-slate-900">{item.itemCode || `ITEM-${idx + 1}`}</td>
                <td className="py-3 px-4 max-w-xs truncate">{item.description}</td>
                <td className="py-3 px-4 text-right font-semibold text-indigo-700">{item.quantity ?? 0}</td>
                <td className="py-3 px-4 text-right font-mono">₹{Number(item.unitRate ?? item.unitPrice ?? 0).toFixed(2)}</td>
                <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                  ₹{Number((item.quantity ?? 0) * (item.unitRate ?? item.unitPrice ?? 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Summary 3-Way Match Table
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
            <th className="py-3 px-3">Item Code</th>
            <th className="py-3 px-3">Description</th>
            <th className="py-3 px-3 text-right">PO Qty</th>
            <th className="py-3 px-3 text-right">GRN Qty</th>
            <th className="py-3 px-3 text-right">Inv Qty</th>
            <th className="py-3 px-3 text-right">Agreed Rate</th>
            <th className="py-3 px-3 text-right">Inv Rate</th>
            <th className="py-3 px-3 text-center">Match Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">
          {items.map((item, idx) => {
            const poQ = item.poQuantity ?? 0;
            const grnQ = item.receivedQuantity ?? 0;
            const invQ = item.invoicedQuantity ?? 0;
            const poP = item.poUnitPrice ?? 0;
            const invP = item.invoicedUnitPrice ?? poP;

            const isQtyMatch = poQ > 0 && poQ === grnQ && grnQ === invQ;
            const isPriceMatch = Math.abs(poP - invP) < 0.05;
            const isMatched = isQtyMatch && isPriceMatch;

            return (
              <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-3 font-mono font-medium text-slate-900">{item.itemCode || `ITEM-${idx + 1}`}</td>
                <td className="py-3 px-3 max-w-[220px] truncate" title={item.description}>
                  {item.description}
                </td>
                <td className="py-3 px-3 text-right font-medium">{poQ}</td>
                <td className={`py-3 px-3 text-right font-medium ${grnQ !== poQ && grnQ > 0 ? 'text-amber-600 font-semibold' : ''}`}>
                  {grnQ}
                </td>
                <td className={`py-3 px-3 text-right font-medium ${invQ !== poQ && invQ > 0 ? 'text-amber-600 font-semibold' : ''}`}>
                  {invQ}
                </td>
                <td className="py-3 px-3 text-right font-mono">₹{Number(poP).toFixed(2)}</td>
                <td className="py-3 px-3 text-right font-mono">₹{Number(invP).toFixed(2)}</td>
                <td className="py-3 px-3 text-center">
                  {isMatched ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> MATCHED
                    </span>
                  ) : grnQ > 0 || invQ > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      <AlertCircle className="w-3 h-3" /> VARIANCE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                      <Clock className="w-3 h-3" /> PENDING
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};