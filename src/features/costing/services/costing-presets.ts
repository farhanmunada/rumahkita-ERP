import { CostItem } from '../types';

export interface BusinessPreset {
  businessSlug: string;
  defaultItemName: string;
  defaultQty: number;
  defaultUnit: string;
  items: Omit<CostItem, 'id' | 'totalCost'>[];
}

export const BUSINESS_PRESETS: Record<string, BusinessPreset> = {
  percetakan: {
    businessSlug: 'percetakan',
    defaultItemName: 'Cetak Brosur Full Color A4 (1000 Lembar)',
    defaultQty: 1000,
    defaultUnit: 'lembar',
    items: [
      { name: 'Kertas Art Paper 150gr (2 Rim)', category: 'material', quantity: 2, unit: 'rim', unitCost: 165000 },
      { name: 'Tinta & Toner Digital Print', category: 'material', quantity: 1, unit: 'paket', unitCost: 150000 },
      { name: 'Jasa Cetak Mesin Offset/Digital', category: 'labor', quantity: 1, unit: 'order', unitCost: 100000 },
      { name: 'Laminasi Doff 2 Sisi', category: 'overhead', quantity: 1000, unit: 'lembar', unitCost: 250 },
      { name: 'Ongkos Potong & Packing Dus', category: 'labor', quantity: 1, unit: 'paket', unitCost: 40000 },
    ],
  },
  konveksi: {
    businessSlug: 'konveksi',
    defaultItemName: 'Produksi Kaos Sablon Cotton Combed 30s (50 Pcs)',
    defaultQty: 50,
    defaultUnit: 'pcs',
    items: [
      { name: 'Kain Cotton Combed 30s (12 Kg)', category: 'material', quantity: 12, unit: 'kg', unitCost: 110000 },
      { name: 'Sablon DTF / Manual Plastisol A3', category: 'material', quantity: 50, unit: 'pcs', unitCost: 18000 },
      { name: 'Jasa Potong Pola & Jahit Rantai', category: 'labor', quantity: 50, unit: 'pcs', unitCost: 15000 },
      { name: 'Label Woven & Plastik Polybag', category: 'overhead', quantity: 50, unit: 'pcs', unitCost: 2500 },
    ],
  },
  desain: {
    businessSlug: 'desain',
    defaultItemName: 'Paket Branding Identity & Logo Guide',
    defaultQty: 1,
    defaultUnit: 'paket',
    items: [
      { name: 'Jasa Konsep Kreatif & Eksekusi Vektor', category: 'labor', quantity: 1, unit: 'paket', unitCost: 750000 },
      { name: 'Lisensi Font Komersial & Stok Vektor', category: 'material', quantity: 1, unit: 'lisensi', unitCost: 200000 },
      { name: 'Review & Proofing Mockup Presentasi', category: 'overhead', quantity: 1, unit: 'sesi', unitCost: 100000 },
    ],
  },
  'web-dev': {
    businessSlug: 'web-dev',
    defaultItemName: 'Pengembangan Website Company Profile + CMS',
    defaultQty: 1,
    defaultUnit: 'proyek',
    items: [
      { name: 'Langganan VPS Server & Domain .co.id 1 Thn', category: 'material', quantity: 1, unit: 'tahun', unitCost: 650000 },
      { name: 'Man-Days Software Engineer / Fullstack Dev', category: 'labor', quantity: 5, unit: 'hari', unitCost: 350000 },
      { name: 'Setup SSL, SMTP Mail, & Deployment CI/CD', category: 'overhead', quantity: 1, unit: 'setup', unitCost: 250000 },
    ],
  },
};
