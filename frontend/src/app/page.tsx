'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { AppHeader } from '@/components/reconciliation/AppHeader';
import { UploadModal } from '@/components/modals/UploadModal';
import { ItemGrid } from '@/components/reconciliation/ItemGrid';
import { DocumentDetailView } from '@/components/reconciliation/DocumentDetailView';
import {
  Layers,
  ShoppingCart,
  Truck,
  ReceiptText,
  Database,
  LayoutDashboard,
  ShieldCheck,
  FileSpreadsheet,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Download
} from 'lucide-react';

export default function Home() {
  const [navSection, setNavSection] = useState<'RECONCILIATION' | 'SKU_MASTER' | 'AUDIT'>('RECONCILIATION');
  const [poNumber, setPoNumber] = useState('CI4PO05788');
  const [activeTab, setActiveTab] = useState<'PO' | 'FULFILLMENT' | 'DELIVERY' | 'SUMMARY'>('SUMMARY');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // SKU Master Local State
  const [skuSearch, setSkuSearch] = useState('');
  const [isAddSkuOpen, setIsAddSkuOpen] = useState(false);
  const [skuList, setSkuList] = useState([
    { id: '1', skuErpCode: '11423', name: 'Cheesy Spicy Veg Momos 24.0 Pieces', eanCode: '890123456781', agreedRate: 220.76, mrp: 305, uom: 'PCS' },
    { id: '2', skuErpCode: '11797', name: 'Meatigo Hot Wings 250.0 g', eanCode: '890123456782', agreedRate: 126.67, mrp: 175, uom: 'PCS' },
    { id: '3', skuErpCode: '18003', name: 'Meatigo Chicken Curry Cut Skinless Frozen 450.0 g', eanCode: '890123456783', agreedRate: 141.14, mrp: 195, uom: 'PCS' },
    { id: '4', skuErpCode: '18004', name: 'Meatigo Chicken Boneless Breast Frozen 450.0 g', eanCode: '890123456784', agreedRate: 199.05, mrp: 275, uom: 'PCS' },
    { id: '5', skuErpCode: '33390', name: 'Chicken Seekh Kebab 500.0 g', eanCode: '890123456785', agreedRate: 228.00, mrp: 315, uom: 'PCS' },
    { id: '6', skuErpCode: '398656', name: 'Meatigo Chicken Drumsticks 450.0 g', eanCode: '890123456786', agreedRate: 188.19, mrp: 260, uom: 'PCS' },
    { id: '7', skuErpCode: '432518', name: 'Meatigo Chicken Kheema 450.0 g', eanCode: '890123456787', agreedRate: 199.05, mrp: 275, uom: 'PCS' },
    { id: '8', skuErpCode: '4459', name: 'Original Chicken Momos 24.0 Pieces', eanCode: '890123456788', agreedRate: 220.76, mrp: 305, uom: 'PCS' },
  ]);
  const [newSku, setNewSku] = useState({ skuErpCode: '', name: '', eanCode: '', agreedRate: '', mrp: '' });

  const { data: matchData } = useQuery({
    queryKey: ['match', poNumber],
    queryFn: async () => {
      const res = await api.get(`/match/${poNumber}`);
      return res.data;
    },
    enabled: Boolean(poNumber),
  });

  const { data: summaryData } = useQuery({
    queryKey: ['summary', poNumber],
    queryFn: async () => {
      const res = await api.get(`/summary/${poNumber}`);
      return res.data;
    },
    enabled: Boolean(poNumber),
  });

  const poCount = matchData?.documents?.poCount || matchData?.pos?.length || (matchData?.items?.length ? 1 : 0);
  const grnCount = matchData?.documents?.grnCount || matchData?.grns?.length || 0;
  const invoiceCount = matchData?.documents?.invoiceCount || matchData?.invoices?.length || 0;

  const pos = matchData?.pos || (matchData?.items ? [{ poNumber, items: matchData.items }] : []);
  const grns = matchData?.grns || [];
  const invoices = matchData?.invoices || [];
  const matchStatus = matchData?.overallStatus || summaryData?.status || 'INSUFFICIENT_DOCUMENTS';

  // Export CSV Function
  const handleExportCsv = () => {
    const items = matchData?.items || [];
    let csvContent = 'Item Code,Description,PO Qty,PO Unit Price,PO Amount,Received Qty,Invoiced Qty,Invoiced Rate,Status\n';
    items.forEach((item: any) => {
      csvContent += `"${item.itemCode}","${item.description}",${item.poQuantity},${item.poUnitPrice},${item.poAmount},${item.receivedQuantity},${item.invoicedQuantity},${item.invoicedUnitPrice},${item.matchStatus}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `3Way_Reconciliation_${poNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddSku = () => {
    if (!newSku.skuErpCode || !newSku.name) return;
    setSkuList([
      ...skuList,
      {
        id: String(Date.now()),
        skuErpCode: newSku.skuErpCode,
        name: newSku.name,
        eanCode: newSku.eanCode || '—',
        agreedRate: parseFloat(newSku.agreedRate) || 0,
        mrp: parseFloat(newSku.mrp) || 0,
        uom: 'PCS'
      }
    ]);
    setNewSku({ skuErpCode: '', name: '', eanCode: '', agreedRate: '', mrp: '' });
    setIsAddSkuOpen(false);
  };

  const handleDeleteSku = (id: string) => {
    setSkuList(skuList.filter(s => s.id !== id));
  };

  const filteredSkus = skuList.filter(s =>
    s.name.toLowerCase().includes(skuSearch.toLowerCase()) ||
    s.skuErpCode.toLowerCase().includes(skuSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Interactive Left Rail */}
      <aside className="w-16 bg-slate-900 flex flex-col items-center py-5 border-r border-slate-800 text-slate-400 gap-6 flex-shrink-0">
        <button
          onClick={() => setNavSection('RECONCILIATION')}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white shadow-md transition-all"
          title="Home"
        >
          <Layers className="w-5 h-5" />
        </button>

        <nav className="flex flex-col gap-4 mt-2">
          {/* Icon 1: Reconciliation Dashboard */}
          <button
            onClick={() => setNavSection('RECONCILIATION')}
            className={`p-2.5 rounded-lg transition-all ${
              navSection === 'RECONCILIATION'
                ? 'bg-slate-800 text-indigo-400 shadow-inner'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
            title="Reconciliation Dashboard"
          >
            <LayoutDashboard className="w-5 h-5" />
          </button>

          {/* Icon 2: SKU Master Catalog */}
          <button
            onClick={() => setNavSection('SKU_MASTER')}
            className={`p-2.5 rounded-lg transition-all ${
              navSection === 'SKU_MASTER'
                ? 'bg-slate-800 text-indigo-400 shadow-inner'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
            title="SKU Master Catalog"
          >
            <Database className="w-5 h-5" />
          </button>

          {/* Icon 3: Audit Trail */}
          <button
            onClick={() => setNavSection('AUDIT')}
            className={`p-2.5 rounded-lg transition-all ${
              navSection === 'AUDIT'
                ? 'bg-slate-800 text-indigo-400 shadow-inner'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
            title="Reconciliation Audit Trail"
          >
            <ShieldCheck className="w-5 h-5" />
          </button>

          {/* Icon 4: Export CSV */}
          <button
            onClick={handleExportCsv}
            className="p-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-all text-slate-400"
            title="Download Reconciliation CSV Report"
          >
            <FileSpreadsheet className="w-5 h-5" />
          </button>
        </nav>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader
          poNumber={poNumber}
          setPoNumber={setPoNumber}
          status={matchStatus}
          onOpenUpload={() => setIsUploadOpen(true)}
        />

        {/* View 1: SKU Master View */}
        {navSection === 'SKU_MASTER' && (
          <div className="p-6 max-w-7xl w-full mx-auto space-y-6 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-indigo-600" /> SKU Master Catalog
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Central product reference catalogue for automated 3-way line item mapping</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by ERP Code or Name..."
                    value={skuSearch}
                    onChange={(e) => setSkuSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs w-64 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  onClick={() => setIsAddSkuOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add Master SKU
                </button>
              </div>
            </div>

            {isAddSkuOpen && (
              <div className="bg-white p-5 rounded-xl border border-indigo-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">New SKU Master Entry</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <input
                    type="text"
                    placeholder="ERP Item Code (e.g. 18005)"
                    value={newSku.skuErpCode}
                    onChange={(e) => setNewSku({ ...newSku, skuErpCode: e.target.value })}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Product Name / Description"
                    value={newSku.name}
                    onChange={(e) => setNewSku({ ...newSku, name: e.target.value })}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="EAN Code"
                    value={newSku.eanCode}
                    onChange={(e) => setNewSku({ ...newSku, eanCode: e.target.value })}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Agreed Contract Rate (₹)"
                    value={newSku.agreedRate}
                    onChange={(e) => setNewSku({ ...newSku, agreedRate: e.target.value })}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="MRP (₹)"
                    value={newSku.mrp}
                    onChange={(e) => setNewSku({ ...newSku, mrp: e.target.value })}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddSku}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs"
                    >
                      Save Record
                    </button>
                    <button
                      onClick={() => setIsAddSkuOpen(false)}
                      className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                    <th className="py-3 px-4">ERP Code</th>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">EAN Code</th>
                    <th className="py-3 px-4 text-right">Agreed Rate</th>
                    <th className="py-3 px-4 text-right">MRP</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredSkus.map((sku) => (
                    <tr key={sku.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">{sku.skuErpCode}</td>
                      <td className="py-3 px-4 font-medium">{sku.name}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{sku.eanCode}</td>
                      <td className="py-3 px-4 text-right font-mono font-semibold">₹{Number(sku.agreedRate).toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">₹{Number(sku.mrp).toFixed(2)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteSku(sku.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete SKU"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* View 2: Audit Trail View */}
        {navSection === 'AUDIT' && (
          <div className="p-6 max-w-7xl w-full mx-auto space-y-6 flex-1">
            <div className="flex items-center justify-between bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" /> Reconciliation Audit Trail
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Immutable audit validation events for PO #{poNumber}</p>
              </div>
              <button
                onClick={handleExportCsv}
                className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" /> Export CSV Report
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Processed Document Log</h3>
              <div className="divide-y divide-slate-100 text-xs">
                {(summaryData?.associatedDocuments || []).map((doc: any, idx: number) => (
                  <div key={idx} className="py-3.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{doc.type} Processed: #{doc.number}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">Date: {doc.date} | Parsed {doc.itemsCount} Line Items</p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Logged & Validated
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* View 3: Main 3-Way Match Tabs View */}
        {navSection === 'RECONCILIATION' && (
          <>
            {/* Top Tab Bar */}
            <div className="bg-white border-b border-slate-200 px-6 flex gap-8 text-sm font-semibold">
              <button
                onClick={() => setActiveTab('PO')}
                className={`py-3.5 border-b-2 flex items-center gap-2 transition-all ${
                  activeTab === 'PO' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <ShoppingCart className="w-4 h-4" /> Purchase Order ({poCount})
              </button>

              <button
                onClick={() => setActiveTab('FULFILLMENT')}
                className={`py-3.5 border-b-2 flex items-center gap-2 transition-all ${
                  activeTab === 'FULFILLMENT' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <ReceiptText className="w-4 h-4" /> Fulfillment ({invoiceCount})
              </button>

              <button
                onClick={() => setActiveTab('DELIVERY')}
                className={`py-3.5 border-b-2 flex items-center gap-2 transition-all ${
                  activeTab === 'DELIVERY' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Truck className="w-4 h-4" /> Delivery ({grnCount})
              </button>

              <button
                onClick={() => setActiveTab('SUMMARY')}
                className={`py-3.5 border-b-2 flex items-center gap-2 transition-all ${
                  activeTab === 'SUMMARY' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Layers className="w-4 h-4" /> Summary
              </button>
            </div>

            {/* Reconciliation Content */}
            <div className="p-6 space-y-6 max-w-7xl w-full mx-auto flex-1">
              {activeTab === 'SUMMARY' && summaryData && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total PO Value</span>
                      <div className="text-2xl font-bold text-slate-900 mt-2">
                        ₹{Number(summaryData.cards?.poAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Invoiced Value</span>
                      <div className="text-2xl font-bold text-slate-900 mt-2">
                        ₹{Number(summaryData.cards?.totalInvoiced || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Quantity Received</span>
                      <div className="text-2xl font-bold text-slate-900 mt-2">
                        {Number(summaryData.cards?.totalReceived || 0).toLocaleString('en-IN')}{' '}
                        <span className="text-sm font-normal text-slate-500">Units</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-3">Associated Documents</h3>
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Document Type</th>
                          <th className="py-2.5 px-3">Reference Number</th>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3 text-right">Items Count</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                        {summaryData.associatedDocuments?.map((d: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-semibold font-sans text-indigo-600">{d.type}</td>
                            <td className="py-2.5 px-3 font-semibold text-slate-900">{d.number}</td>
                            <td className="py-2.5 px-3 text-slate-600">{d.date}</td>
                            <td className="py-2.5 px-3 text-right font-medium">{d.itemsCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold text-slate-800">3-Way Match Line Item Reconciliation</h3>
                      <span className="text-xs font-semibold text-slate-500">{matchData?.items?.length || 0} Total Line Items</span>
                    </div>
                    <ItemGrid items={matchData?.items || []} mode="RECONCILIATION" />
                  </div>
                </div>
              )}

              {activeTab === 'PO' && (
                <DocumentDetailView documentType="PO" documents={pos} poRef={poNumber} />
              )}

              {activeTab === 'FULFILLMENT' && (
                <DocumentDetailView documentType="INVOICE" documents={invoices} poRef={poNumber} />
              )}

              {activeTab === 'DELIVERY' && (
                <DocumentDetailView documentType="GRN" documents={grns} poRef={poNumber} />
              )}
            </div>
          </>
        )}

        <UploadModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          defaultPo={poNumber}
        />
      </div>
    </div>
  );
}