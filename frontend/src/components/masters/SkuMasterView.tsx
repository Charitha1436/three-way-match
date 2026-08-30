'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Database, Plus, Search, Trash2, CheckCircle2 } from 'lucide-react';

export const SkuMasterView: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    skuErpCode: '',
    name: '',
    eanCode: '',
    agreedRate: '',
    mrp: '',
    uom: 'PCS',
  });

  const { data: skus = [] } = useQuery({
    queryKey: ['skuMasters'],
    queryFn: async () => {
      try {
        const res = await api.get('/masters/sku');
        return res.data || [];
      } catch {
        return [];
      }
    },
  });

  const addMutation = useMutation({
    mutationFn: async (newSku: typeof formData) => {
      return api.post('/masters/sku', {
        ...newSku,
        agreedRate: parseFloat(newSku.agreedRate) || 0,
        mrp: parseFloat(newSku.mrp) || 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skuMasters'] });
      setIsAddOpen(false);
      setFormData({ skuErpCode: '', name: '', eanCode: '', agreedRate: '', mrp: '', uom: 'PCS' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/masters/sku/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skuMasters'] });
    },
  });

  const fallbackList = [
    { _id: '1', skuErpCode: '11423', name: 'Cheesy Spicy Veg Momos 24.0 Pieces', eanCode: '890123456781', agreedRate: 220.76, mrp: 305, uom: 'PCS' },
    { _id: '2', skuErpCode: '11797', name: 'Meatigo Hot Wings 250.0 g', eanCode: '890123456782', agreedRate: 126.67, mrp: 175, uom: 'PCS' },
    { _id: '3', skuErpCode: '18003', name: 'Meatigo Chicken Curry Cut Skinless Frozen 450.0 g', eanCode: '890123456783', agreedRate: 141.14, mrp: 195, uom: 'PCS' },
    { _id: '4', skuErpCode: '18004', name: 'Meatigo Chicken Boneless Breast Frozen 450.0 g', eanCode: '890123456784', agreedRate: 199.05, mrp: 275, uom: 'PCS' },
    { _id: '5', skuErpCode: '33390', name: 'Chicken Seekh Kebab 500.0 g', eanCode: '890123456785', agreedRate: 228.00, mrp: 315, uom: 'PCS' },
  ];

  const displayList = Array.isArray(skus) && skus.length > 0 ? skus : fallbackList;

  const filteredSkus = displayList.filter((s: any) =>
    (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.skuErpCode || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs w-64 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            onClick={() => setIsAddOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Master SKU
          </button>
        </div>
      </div>

      {isAddOpen && (
        <div className="bg-white p-5 rounded-xl border border-indigo-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">New SKU Entry</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <input
              type="text"
              placeholder="ERP Item Code (e.g. 18003)"
              value={formData.skuErpCode}
              onChange={(e) => setFormData({ ...formData, skuErpCode: e.target.value })}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
            />
            <input
              type="text"
              placeholder="Product Name / Description"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
            />
            <input
              type="text"
              placeholder="EAN Code"
              value={formData.eanCode}
              onChange={(e) => setFormData({ ...formData, eanCode: e.target.value })}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
            />
            <input
              type="number"
              placeholder="Agreed Contract Rate (₹)"
              value={formData.agreedRate}
              onChange={(e) => setFormData({ ...formData, agreedRate: e.target.value })}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
            />
            <input
              type="number"
              placeholder="MRP (₹)"
              value={formData.mrp}
              onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => addMutation.mutate(formData)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs"
              >
                Save Record
              </button>
              <button
                onClick={() => setIsAddOpen(false)}
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
            {filteredSkus.map((sku: any, idx: number) => (
              <tr key={sku._id || idx} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-mono font-semibold text-slate-900">{sku.skuErpCode}</td>
                <td className="py-3 px-4 font-medium">{sku.name}</td>
                <td className="py-3 px-4 font-mono text-slate-500">{sku.eanCode || '—'}</td>
                <td className="py-3 px-4 text-right font-mono font-semibold">₹{Number(sku.agreedRate || 0).toFixed(2)}</td>
                <td className="py-3 px-4 text-right font-mono text-slate-500">₹{Number(sku.mrp || 0).toFixed(2)}</td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => deleteMutation.mutate(sku._id)}
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
  );
};