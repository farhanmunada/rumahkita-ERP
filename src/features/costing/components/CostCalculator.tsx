'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  Calculator,
  Sliders,
  DollarSign,
  Package,
  Layers,
  Store,
  Truck,
  Globe,
  Database,
  CheckCircle,
  Briefcase,
  X,
} from 'lucide-react';
import { CostItem, PricingMethod, PriceTier, CostCategory } from '../types';
import { calculateCostingTotals } from '../services/costing-calculator';
import { CostItemList } from './CostItemList';
import { PriceTierComparison } from './PriceTierComparison';
import { VendorCostPickerModal } from './VendorCostPickerModal';
import { VendorCostManagerModal } from './VendorCostManagerModal';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { formatRupiah } from '@/shared/lib/currency';
import { type VendorCost } from '@/shared/db/schema';

interface BusinessOption {
  id: number;
  name: string;
  slug: string;
  invoicePrefix: string;
}

interface CostCalculatorProps {
  businesses: BusinessOption[];
  initialVendorCosts?: VendorCost[];
}

export function CostCalculator({ businesses, initialVendorCosts = [] }: CostCalculatorProps) {
  const router = useRouter();

  // Master Vendor DB State
  const [vendorCosts, setVendorCosts] = useState<VendorCost[]>(initialVendorCosts);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // State Unit Bisnis
  const [selectedBusinessSlug, setSelectedBusinessSlug] = useState<string>(
    businesses[0]?.slug || 'percetakan'
  );

  const activeBusiness = useMemo(() => {
    return businesses.find((b) => b.slug === selectedBusinessSlug) || businesses[0];
  }, [businesses, selectedBusinessSlug]);

  const isWebDev = selectedBusinessSlug === 'web-dev';

  // State Pesanan
  const [productName, setProductName] = useState(
    isWebDev ? 'Pengembangan Aplikasi Web / SaaS' : 'Produksi Cetak Brosur A4'
  );
  const [outputQuantity, setOutputQuantity] = useState(isWebDev ? 1 : 100);
  const [outputUnit, setOutputUnit] = useState(isWebDev ? 'paket' : 'lembar');

  // State Metode Harga & Margin Kustom
  const [pricingMethod, setPricingMethod] = useState<PricingMethod>('margin');
  const [customPercentage, setCustomPercentage] = useState(40);

  // State Baris Biaya Modal (Default kosong, diisi manual atau dari database vendor)
  const [costItems, setCostItems] = useState<CostItem[]>([]);

  const fetchVendorCosts = async () => {
    try {
      const res = await fetch('/api/vendor-costs');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setVendorCosts(json.data);
      }
    } catch (e) {
      console.error('Failed to refresh vendor costs', e);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Mutasi Baris Modal
  const handleAddItem = () => {
    const newItem: CostItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: '',
      category: isWebDev ? 'other' : 'vendor',
      quantity: 1,
      unit: isWebDev ? 'bulan' : 'pcs',
      unitCost: 0,
      totalCost: 0,
    };
    setCostItems([...costItems, newItem]);
  };

  const handleSelectItemFromMaster = (vendorCost: VendorCost) => {
    const newItem: CostItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: vendorCost.itemName,
      category: (vendorCost.category as CostCategory) || 'vendor',
      vendorName: vendorCost.vendorName || undefined,
      quantity: 1,
      unit: vendorCost.unit || 'pcs',
      unitCost: vendorCost.baseCost,
      totalCost: vendorCost.baseCost,
      vendorCostId: vendorCost.id,
    };
    setCostItems((prev) => [...prev, newItem]);
    showToast(`"${vendorCost.itemName}" berhasil dimuat ke kalkulator.`);
  };

  const handleSaveToMaster = async (item: CostItem) => {
    if (!item.name.trim() || item.unitCost <= 0) {
      alert('Nama item dan HPP satuan harus terisi valid.');
      return;
    }

    try {
      const res = await fetch('/api/vendor-costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: activeBusiness.id,
          itemName: item.name.trim(),
          vendorName: item.vendorName?.trim() || null,
          category: item.category,
          unit: item.unit || 'pcs',
          baseCost: item.unitCost,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menyimpan');
      }
      await fetchVendorCosts();
      showToast(`Item "${item.name}" berhasil disimpan ke database master HPP!`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menyimpan item ke database');
    }
  };

  const handleUpdateItem = (id: string, updates: Partial<CostItem>) => {
    setCostItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updates };
          updated.totalCost = updated.quantity * updated.unitCost;
          return updated;
        }
        return item;
      })
    );
  };

  const handleDeleteItem = (id: string) => {
    setCostItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Hasil Kalkulasi Finansial
  const calculation = useMemo(() => {
    return calculateCostingTotals(
      costItems,
      outputQuantity,
      pricingMethod,
      customPercentage
    );
  }, [costItems, outputQuantity, pricingMethod, customPercentage]);

  // Direct Bridge: Jadikan Invoice
  const handleApplyToInvoice = (tier: PriceTier) => {
    const query = new URLSearchParams({
      businessId: activeBusiness?.id?.toString() || '1',
      description: `${productName} (${tier.name})`,
      quantity: outputQuantity.toString(),
      unit: outputUnit,
      unitPrice: tier.unitPrice.toString(),
    });

    router.push(`/invoices/new?${query.toString()}`);
  };

  // State & handler untuk Simpan Hasil HPP ke Proyek Berjalan
  const [clients, setClients] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isSaveProjectModalOpen, setIsSaveProjectModalOpen] = useState(false);
  const [targetTierForProject, setTargetTierForProject] = useState<PriceTier | null>(null);
  const [projectFormName, setProjectFormName] = useState('');
  const [projectFormClientId, setProjectFormClientId] = useState<string>('');
  const [projectFormTargetRevenue, setProjectFormTargetRevenue] = useState('');
  const [projectFormStatus, setProjectFormStatus] = useState('IN_PROGRESS');
  const [projectFormDescription, setProjectFormDescription] = useState('');
  const [isSavingProject, setIsSavingProject] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch('/api/clients')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setClients(data);
      })
      .catch((e) => console.error('Failed to fetch clients', e));
  }, []);

  useEffect(() => {
    if (isSaveProjectModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSaveProjectModalOpen]);

  const handleOpenSaveProject = (tier: PriceTier) => {
    setTargetTierForProject(tier);
    setProjectFormName(productName ? `${productName} (${tier.name})` : `Proyek Baru (${tier.name})`);
    setProjectFormTargetRevenue(tier.totalPrice.toString());
    setProjectFormStatus('IN_PROGRESS');
    setProjectFormDescription(`Proyek dari estimasi kalkulator HPP [Tier: ${tier.name}]. Rincian modal: ${costItems.length} item.`);
    setIsSaveProjectModalOpen(true);
  };

  const handleSaveProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectFormName.trim()) {
      alert('Nama proyek wajib diisi');
      return;
    }
    setIsSavingProject(true);
    try {
      const payload = {
        name: projectFormName.trim(),
        businessId: activeBusiness?.id || 1,
        clientId: projectFormClientId ? Number(projectFormClientId) : null,
        status: projectFormStatus || 'IN_PROGRESS',
        targetRevenue: parseFloat(projectFormTargetRevenue) || 0,
        description: projectFormDescription.trim() || null,
        costs: costItems.map((c) => ({
          itemName: c.name || 'Pos Pengeluaran',
          category: c.category,
          vendorNameSnapshot: c.vendorName || null,
          quantity: c.quantity.toString(),
          unit: c.unit || 'pcs',
          unitCost: c.unitCost,
          totalCost: c.totalCost,
          notes: c.notes || null,
        })),
      };

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menyimpan proyek');
      }

      const createdProject = await res.json();
      setIsSaveProjectModalOpen(false);
      router.push(`/projects/${createdProject.id}`);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsSavingProject(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Preset Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Calculator className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Kalkulator HPP & Simulasi Harga Jual
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Hitung modal dasar pengeluaran awal, simulasikan margin laba, dan bandingkan harga sebelum menawarkan ke konsumen.
            </p>
          </div>

          {/* Unit Usaha Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Unit Usaha:</span>
            <select
              value={selectedBusinessSlug}
              onChange={(e) => setSelectedBusinessSlug(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {businesses.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Input Spesifikasi Pesanan */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Produk / Proyek
            </label>
            <Input
              type="text"
              placeholder="Contoh: Cetak Brosur Full Color A4"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="text-xs h-9"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Jumlah Output (Qty)
            </label>
            <Input
              type="number"
              min="1"
              value={outputQuantity || ''}
              onChange={(e) => setOutputQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="text-xs h-9 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Satuan Output
            </label>
            <Input
              type="text"
              placeholder="lembar / pcs / paket"
              value={outputUnit}
              onChange={(e) => setOutputUnit(e.target.value)}
              className="text-xs h-9"
            />
          </div>
        </div>

        {/* Toggle Metode & Persentase Kustom */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span>Metode Formula:</span>
            </span>
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
              <button
                type="button"
                onClick={() => setPricingMethod('margin')}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  pricingMethod === 'margin'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Profit Margin (%)
              </button>
              <button
                type="button"
                onClick={() => setPricingMethod('markup')}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  pricingMethod === 'markup'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Markup Modal (%)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600">Skenario Kustom:</span>
            <input
              type="range"
              min="5"
              max="150"
              step="5"
              value={customPercentage}
              onChange={(e) => setCustomPercentage(parseInt(e.target.value) || 40)}
              className="w-28 accent-blue-600 cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {customPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Web Dev Special Note Banner */}
      {isWebDev && (
        <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs flex items-start gap-2.5">
          <Globe className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold">Skema HPP Unit Web Dev (Direct Cloud & Service):</span>
            <span className="text-blue-800 ml-1">
              Untuk proyek website / aplikasi, pos HPP menggunakan biaya pengeluaran langsung seperti sewa Domain, VPS / Hosting server, lisensi API berbayar, dan estimasi man-days developer/desainer (bukan maklon pabrik/percetakan fisik).
            </span>
          </div>
        </div>
      )}

      {/* Rangkuman Modal (HPP Overview Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Modal */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Total Pengeluaran Modal (HPP):</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            {formatRupiah(calculation.totalCost)}
          </div>
          <div className="text-[11px] text-slate-400">
            Total biaya modal untuk {calculation.outputQuantity} {outputUnit || 'pcs'}
          </div>
        </div>

        {/* Modal per Unit */}
        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-blue-700 text-xs font-semibold">
            <span>Modal Dasar per Satuan:</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black font-mono text-blue-900">
            {formatRupiah(calculation.unitCost)}
            <span className="text-xs font-normal text-slate-500 ml-1">
              /{outputUnit || 'pcs'}
            </span>
          </div>
          <div className="text-[11px] text-blue-600">
            Batas minimal tidak boleh dijual di bawah nominal ini
          </div>
        </div>

        {/* Komposisi Biaya */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-slate-500 font-semibold">
            <span>Komposisi Modal:</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-600">Tagihan Vendor:</span>
              <span className="font-semibold text-blue-600">{formatRupiah(calculation.vendorCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Ongkir & Ekspedisi:</span>
              <span className="font-semibold text-amber-600">{formatRupiah(calculation.shippingCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Kemasan & Packaging:</span>
              <span className="font-semibold text-indigo-600">{formatRupiah(calculation.packagingCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Jasa / Man-Days / Lain:</span>
              <span className="font-semibold text-slate-700">
                {formatRupiah(calculation.laborCost + calculation.materialCost + calculation.overheadCost)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Rincian Komponen Biaya */}
      <CostItemList
        items={costItems}
        onAddItem={handleAddItem}
        onUpdateItem={handleUpdateItem}
        onDeleteItem={handleDeleteItem}
        onSaveToMaster={handleSaveToMaster}
        onOpenMasterPicker={() => setIsPickerOpen(true)}
        onOpenMasterManager={() => setIsManagerOpen(true)}
        businessSlug={selectedBusinessSlug}
      />

      {/* Simulasi Perbandingan Harga Jual */}
      <PriceTierComparison
        tiers={calculation.tiers}
        outputQuantity={calculation.outputQuantity}
        outputUnit={outputUnit}
        method={pricingMethod}
        onApplyToInvoice={handleApplyToInvoice}
        onSaveAsProject={handleOpenSaveProject}
      />

      {/* Modal Picker dari DB */}
      <VendorCostPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        vendorCosts={vendorCosts}
        activeBusinessId={activeBusiness.id}
        onSelectItem={handleSelectItemFromMaster}
        onOpenManager={() => setIsManagerOpen(true)}
      />

      {/* Modal Manager Master HPP DB */}
      <VendorCostManagerModal
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
        businesses={businesses}
        activeBusinessId={activeBusiness.id}
        vendorCosts={vendorCosts}
        onRefresh={fetchVendorCosts}
      />

      {/* Modal Simpan Sebagai Proyek Berjalan */}
      {isSaveProjectModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in duration-150">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  Simpan sebagai Proyek Berjalan
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Simpan kalkulasi modal HPP ke projek tanpa wajib membuat invoice sekarang
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSaveProjectModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProjectSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Proyek <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={projectFormName}
                  onChange={(e) => setProjectFormName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Misal: Redesign Website & Branding"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Klien (Opsional)
                  </label>
                  <select
                    value={projectFormClientId}
                    onChange={(e) => setProjectFormClientId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tanpa Klien / Belum Ditentukan</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Proyek
                  </label>
                  <select
                    value={projectFormStatus}
                    onChange={(e) => setProjectFormStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="IN_PROGRESS">Sedang Berjalan</option>
                    <option value="PLANNING">Perencanaan / Draft</option>
                    <option value="COMPLETED">Selesai</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Nilai Penawaran / Omzet (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  value={projectFormTargetRevenue}
                  onChange={(e) => setProjectFormTargetRevenue(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0 jika belum diset"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi / Catatan Proyek
                </label>
                <textarea
                  rows={2}
                  value={projectFormDescription}
                  onChange={(e) => setProjectFormDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Catatan tambahan mengenai proyek atau estimasi HPP..."
                />
              </div>

              {/* Rincian Ringkas HPP yang Ditransfer */}
              <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100/80 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Pos Biaya Modal Dialihkan:</span>
                  <span className="font-semibold text-slate-800">{costItems.length} item</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Total Biaya Modal (HPP):</span>
                  <span className="font-mono font-bold text-slate-900">{formatRupiah(calculation.totalCost)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Target Omzet:</span>
                  <span className="font-mono font-bold text-blue-600">
                    {formatRupiah(parseFloat(projectFormTargetRevenue) || 0)}
                  </span>
                </div>
                <div className="pt-1.5 border-t border-blue-100 flex justify-between items-center text-slate-700 font-medium">
                  <span>Estimasi Laba Kotor:</span>
                  <span className="font-mono font-bold text-emerald-600">
                    {formatRupiah((parseFloat(projectFormTargetRevenue) || 0) - calculation.totalCost)}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSaveProjectModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingProject}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>{isSavingProject ? 'Menyimpan Proyek...' : 'Simpan Proyek Sekarang'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
