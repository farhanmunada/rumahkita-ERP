'use client';

import React from 'react';
import {
  Plus,
  Trash2,
  Box,
  Users,
  Wrench,
  Truck,
  Store,
  BookmarkPlus,
  Database,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { CostItem, CostCategory } from '../types';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { formatRupiah, parseRupiahInput } from '@/shared/lib/currency';

interface CostItemListProps {
  items: CostItem[];
  onAddItem: () => void;
  onUpdateItem: (id: string, updates: Partial<CostItem>) => void;
  onDeleteItem: (id: string) => void;
  onSaveToMaster?: (item: CostItem) => void;
  onOpenMasterPicker: () => void;
  onOpenMasterManager: () => void;
  businessSlug?: string;
}

export function CostItemList({
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onSaveToMaster,
  onOpenMasterPicker,
  onOpenMasterManager,
  businessSlug,
}: CostItemListProps) {
  const isWebDev = businessSlug === 'web-dev';

  const getCategoryIcon = (category: CostCategory) => {
    switch (category) {
      case 'vendor':
        return <Store className="w-3.5 h-3.5 text-blue-600" />;
      case 'shipping':
        return <Truck className="w-3.5 h-3.5 text-amber-600" />;
      case 'packaging':
        return <Box className="w-3.5 h-3.5 text-indigo-600" />;
      case 'material':
        return <Layers className="w-3.5 h-3.5 text-cyan-600" />;
      case 'labor':
        return <Users className="w-3.5 h-3.5 text-emerald-600" />;
      case 'overhead':
        return <Wrench className="w-3.5 h-3.5 text-orange-600" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            {isWebDev
              ? 'Rincian Biaya Modal Langsung (Cloud, Lisensi & Jasa)'
              : 'Rincian Komponen Biaya Modal (HPP Vendor & Ekspedisi)'}
          </h3>
          <p className="text-xs text-slate-500">
            {isWebDev
              ? 'Input pengeluaran langsung server, domain, API, dan alokasi man-days developer.'
              : 'Input tagihan vendor maklon/cetak, ongkos kirim vendor, packaging, dan biaya terkait.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onOpenMasterPicker}
            className="gap-1.5 text-xs text-blue-700 bg-blue-50/50 border-blue-200 hover:bg-blue-100/70"
          >
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>Ambil dari Master HPP</span>
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onOpenMasterManager}
            className="gap-1.5 text-xs text-slate-700 border-slate-300 hover:bg-slate-50"
          >
            <span>Kelola Database</span>
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onAddItem}
            className="gap-1.5 text-xs text-emerald-700 bg-emerald-50/50 border-emerald-200 hover:bg-emerald-100/70"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tambah Pos</span>
          </Button>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-2.5 px-3 min-w-[200px]">Item / Pekerjaan</th>
                <th className="py-2.5 px-3 w-36">Vendor (Rekanan)</th>
                <th className="py-2.5 px-3 w-36">Kategori</th>
                <th className="py-2.5 px-3 w-20 text-center">Jumlah</th>
                <th className="py-2.5 px-3 w-24 text-center">Satuan</th>
                <th className="py-2.5 px-3 w-32 text-right">HPP Satuan</th>
                <th className="py-2.5 px-3 w-32 text-right">Subtotal</th>
                <th className="py-2.5 px-2 w-16 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Store className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                      <p className="text-xs text-slate-600 font-medium">
                        Belum ada item HPP modal untuk proyek ini.
                      </p>
                      <p className="text-[11px] text-slate-400 max-w-sm">
                        Klik &quot;Ambil dari Master HPP&quot; untuk memuat tarif vendor yang tersimpan di database, atau klik &quot;Tambah Pos&quot; untuk input manual.
                      </p>
                      <div className="flex gap-2 pt-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="primary"
                          onClick={onOpenMasterPicker}
                          className="text-xs h-7 gap-1"
                        >
                          <Database className="w-3 h-3" />
                          <span>Pilih dari Database</span>
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={onAddItem}
                          className="text-xs h-7 gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Input Manual</span>
                        </Button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2 px-3">
                      <Input
                        type="text"
                        placeholder="Contoh: Cetak Brosur A4 150gr"
                        value={item.name}
                        onChange={(e) => onUpdateItem(item.id, { name: e.target.value })}
                        className="text-xs h-8"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <Input
                        type="text"
                        placeholder="Nama Vendor"
                        value={item.vendorName || ''}
                        onChange={(e) => onUpdateItem(item.id, { vendorName: e.target.value })}
                        className="text-xs h-8"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1.5">
                        {getCategoryIcon(item.category)}
                        <select
                          value={item.category}
                          onChange={(e) =>
                            onUpdateItem(item.id, { category: e.target.value as CostCategory })
                          }
                          className="w-full text-xs h-8 rounded-lg border border-slate-200 bg-white px-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        >
                          <option value="vendor">Tagihan Vendor</option>
                          <option value="shipping">Ongkir Vendor</option>
                          <option value="packaging">Kemasan & Dus</option>
                          <option value="labor">Jasa / Man-Days</option>
                          <option value="material">Bahan Baku</option>
                          <option value="overhead">Overhead / Opr</option>
                          <option value="other">Lainnya</option>
                        </select>
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <Input
                        type="number"
                        min="0.01"
                        step="any"
                        value={item.quantity || ''}
                        onChange={(e) =>
                          onUpdateItem(item.id, {
                            quantity: Math.max(0, parseFloat(e.target.value) || 0),
                          })
                        }
                        className="text-xs h-8 text-center font-mono"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <Input
                        type="text"
                        placeholder="pcs / rim"
                        value={item.unit}
                        onChange={(e) => onUpdateItem(item.id, { unit: e.target.value })}
                        className="text-xs h-8 text-center"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <Input
                        type="text"
                        value={formatRupiah(item.unitCost)}
                        onChange={(e) =>
                          onUpdateItem(item.id, {
                            unitCost: parseRupiahInput(e.target.value),
                          })
                        }
                        className="text-xs h-8 text-right font-mono"
                      />
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-800">
                      {formatRupiah(item.quantity * item.unitCost)}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {onSaveToMaster && (
                          <button
                            type="button"
                            onClick={() => onSaveToMaster(item)}
                            className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                            title="Simpan item ini ke Master HPP Vendor di Database"
                          >
                            <BookmarkPlus className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onDeleteItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="Hapus baris"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
