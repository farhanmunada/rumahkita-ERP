'use client';

import React from 'react';
import { FilePlus, TrendingUp, CheckCircle, Sparkles, Briefcase } from 'lucide-react';
import { PriceTier, PricingMethod } from '../types';
import { Button } from '@/shared/components/ui/Button';
import { formatRupiah } from '@/shared/lib/currency';

interface PriceTierComparisonProps {
  tiers: PriceTier[];
  outputQuantity: number;
  outputUnit: string;
  method: PricingMethod;
  onApplyToInvoice: (tier: PriceTier) => void;
  onSaveAsProject: (tier: PriceTier) => void;
}

export function PriceTierComparison({
  tiers,
  outputQuantity,
  outputUnit,
  method,
  onApplyToInvoice,
  onSaveAsProject,
}: PriceTierComparisonProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>Simulasi Perbandingan Harga Jual ke Konsumen</span>
          </h3>
          <p className="text-xs text-slate-500">
            Pilih skenario harga terbaik berdasarkan daya beli konsumen atau volume pesanan.
          </p>
        </div>
        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
          Metode: <strong className="text-slate-800 uppercase">{method === 'margin' ? 'Profit Margin' : 'Markup Modal'}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiers.map((tier) => {
          const isOptimal = tier.id === 'optimal';
          const isStandard = tier.id === 'standard';

          return (
            <div
              key={tier.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition-all relative bg-white ${
                isOptimal
                  ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                  : isStandard
                  ? 'border-slate-300 shadow-sm'
                  : 'border-slate-200 shadow-xs'
              }`}
            >
              {isOptimal && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full flex items-center gap-1 shadow-sm uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  <span>Rekomendasi</span>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{tier.name}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isOptimal
                        ? 'bg-blue-100 text-blue-700'
                        : isStandard
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tier.badgeText}
                  </span>
                </div>

                {/* Harga Jual Satuan */}
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                    Harga Jual Satuan
                  </span>
                  <div className="text-xl font-black font-mono text-slate-900">
                    {formatRupiah(tier.unitPrice)}
                    <span className="text-xs font-normal text-slate-500 ml-1">
                      /{outputUnit || 'pcs'}
                    </span>
                  </div>
                </div>

                {/* Rincian Finansial Tier */}
                <div className="pt-2 border-t border-slate-100 text-xs space-y-1.5 font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>Total Omset ({outputQuantity} {outputUnit || 'pcs'}):</span>
                    <span className="font-semibold text-slate-900">
                      {formatRupiah(tier.totalPrice)}
                    </span>
                  </div>

                  <div className="flex justify-between text-emerald-700">
                    <span>Profit Bersih Satuan:</span>
                    <span className="font-bold">
                      +{formatRupiah(tier.unitProfit)}
                    </span>
                  </div>

                  <div className="flex justify-between text-emerald-800 font-bold bg-emerald-50/70 p-1.5 rounded-lg border border-emerald-100">
                    <span>Total Laba Kotor:</span>
                    <span>+{formatRupiah(tier.totalProfit)}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed min-h-[32px]">
                  {tier.description}
                </p>
              </div>

              {/* Tombol Aksi */}
              <div className="pt-4 mt-2 space-y-2">
                <Button
                  type="button"
                  size="sm"
                  variant={isOptimal ? 'primary' : 'outline'}
                  onClick={() => onSaveAsProject(tier)}
                  className="w-full text-xs font-semibold gap-1.5"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Simpan sbg Proyek</span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onApplyToInvoice(tier)}
                  className="w-full text-xs font-semibold gap-1.5 text-slate-600 hover:text-slate-900 border-slate-200"
                >
                  <FilePlus className="w-3.5 h-3.5" />
                  <span>Jadikan Invoice</span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
