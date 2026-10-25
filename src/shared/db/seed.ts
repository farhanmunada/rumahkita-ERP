import * as dotenv from 'dotenv';
dotenv.config();

import { db } from './client';
import { businesses } from './schema';
import { eq } from 'drizzle-orm';

const INITIAL_BUSINESSES = [
  {
    slug: 'percetakan',
    name: 'RK Offset & Percetakan',
    tagline: 'Solusi Cetak Offset, Digital, dan Packaging Berkualitas',
    invoicePrefix: 'PRT',
    address: 'Jl. Percetakan Raya No. 45, Jakarta',
    phone: '0812-3456-7890',
    email: 'percetakan@rk-corp.id',
    bankName: 'BCA',
    bankAccountNumber: '8830-123-456',
    bankAccountHolder: 'PT RK Sinergi Mandiri',
    defaultTerms: '1. Pembayaran DP 50% saat PO disetujui, pelunasan sebelum barang dikirim.\n2. Komplain maksimal 2x24 jam setelah barang diterima.',
  },
  {
    slug: 'desain',
    name: 'RK Creative Studio',
    tagline: 'Desain Grafis, Branding Identity, dan UI/UX Design',
    invoicePrefix: 'DSN',
    address: 'Jl. Kreatif Kreator No. 12, Jakarta',
    phone: '0812-9876-5432',
    email: 'studio@rk-corp.id',
    bankName: 'Mandiri',
    bankAccountNumber: '137-00-1234567-8',
    bankAccountHolder: 'PT RK Sinergi Mandiri',
    defaultTerms: '1. Revisi maksimal 3 kali minor sesuai brief awal.\n2. Aset final diserahkan setelah pelunasan invoice.',
  },
  {
    slug: 'web-dev',
    name: 'RK Digital Tech',
    tagline: 'Web & Mobile Development, Cloud Architecture, and IT Solutions',
    invoicePrefix: 'WEB',
    address: 'Gedung Cyber 2 Lantai 8, Jakarta Selatan',
    phone: '0811-2233-4455',
    email: 'tech@rk-corp.id',
    bankName: 'BCA',
    bankAccountNumber: '8830-987-654',
    bankAccountHolder: 'PT RK Sinergi Mandiri',
    defaultTerms: '1. Garansi bug 30 hari kalender setelah serah terima pekerjaan (UAT).\n2. Pembayaran jatuh tempo maksimal 14 hari kalender setelah invoice terbit.',
  },
  {
    slug: 'konveksi',
    name: 'RK Apparel & Konveksi',
    tagline: 'Produksi Seragam, Kaos, Kemeja, dan Jaket Komunitas/Perusahaan',
    invoicePrefix: 'KNV',
    address: 'Kawasan Industri Sentra Garmen Blok B3, Bandung',
    phone: '0813-7788-9900',
    email: 'konveksi@rk-corp.id',
    bankName: 'BNI',
    bankAccountNumber: '023-456-7891',
    bankAccountHolder: 'PT RK Sinergi Mandiri',
    defaultTerms: '1. Toleransi ukuran produksi +/- 1-2 cm.\n2. Pelunasan tagihan wajib diselesaikan sebelum pengiriman ekspedisi.',
  },
];

async function seed() {
  console.log('Seeding initial businesses...');
  for (const b of INITIAL_BUSINESSES) {
    const existing = await db
      .select()
      .from(businesses)
      .where(eq(businesses.slug, b.slug))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(businesses).values(b);
      console.log(`- Created business: ${b.name} (${b.invoicePrefix})`);
    } else {
      console.log(`- Business already exists: ${b.name}`);
    }
  }
  console.log('Seeding completed.');
}

seed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
