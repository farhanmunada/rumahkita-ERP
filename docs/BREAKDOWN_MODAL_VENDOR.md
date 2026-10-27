# Breakdown Fitur: Pelacakan Modal Proyek & Pemilihan Vendor Berbasis Kualitas/Lokasi

**Status:** PROPOSAL & BREAKDOWN  
**Tanggal:** 2026-10-27  
**Target Platform:** Web (Next.js App Router + Drizzle ORM + Neon PostgreSQL)  

---

## 1. Latar Belakang & Kebutuhan Pengguna

1. **Pelacakan Modal (HPP) per Proyek/Invoice:**
   - Saat ini invoice hanya mencatat harga jual ke klien (omzet).
   - Pengguna butuh mencatat pengeluaran riil (modal kerja/HPP) untuk setiap invoice/projek.
   - Tujuan: Mengetahui laba kotor (*gross profit*) dan persentase margin secara akurat per projek.

2. **Database Vendor Lengkap (Harga, Lokasi/Alamat, Rating Kualitas):**
   - Saat ini vendor hanya berupa teks string nama di tabel `vendor_costs`.
   - Pengguna butuh data vendor komprehensif: Nama, Alamat/Lokasi, Rating Kualitas (1-5), Catatan Kualitas/Reputasi, Kontak.
   - Pengguna butuh memilih vendor terbaik saat kalkulasi & pembuatan invoice dengan membandingkan harga vs jarak vs kualitas.

---

## 2. Breakdown Komponen Fitur

### A. Modul Master Vendor (Vendor Directory)
- **Entitas Vendor:**
  - `name`: Nama vendor / workshop / toko.
  - `address`: Alamat lengkap / domisili (membantu pertimbangan ongkir & kecepatan logistik).
  - `phone`: Kontak telepon / WhatsApp.
  - `rating`: Skor kualitas 1 - 5 bintang (penilaian subjektif pemilik).
  - `quality_notes`: Catatan kelebihan/kekurangan (contoh: "Warna tajam, tapi antrean lama", "Cepat tapi packing tipis").
  - `category`: Jenis spesialisasi (Percetakan, Sablon, Jahit, Aset Digital, Hosting, dll.).
- **Relasi Item Vendor (Vendor Catalog):**
  - Satu vendor memiliki banyak item/tarif pekerjaan.
  - Mencatat nama item, unit satuan, harga modal (HPP).

### B. Entitas Proyek Mandiri (`projects`) & HPP Real (`project_costs`)
- **Proyek Berdiri Sendiri (Tidak Wajib Invoice):**
  - Pengguna dapat membuat dan menyimpan Proyek kapan saja untuk melacak modal riil (HPP real) saat perencanaan atau produksi sedang berjalan.
  - Setiap proyek memiliki: Nama Proyek, Unit Bisnis, Klien (opsional), Status (`PLANNING`, `IN_PROGRESS`, `COMPLETED`), Target/Realisasi Omzet.
- **Rincian HPP Real (`project_costs`):**
  - Setiap proyek memiliki daftar pengeluaran riil: item vendor terpilih, bahan baku, ongkir, dsb.
  - Kalkulasi laba kotor (*gross profit*) dan persentase margin otomatis terhitung di level proyek.
- **Jembatan Fleksibel ke Invoice (`invoiceId` opsional):**
  - Proyek dapat disimpan tanpa invoice.
  - Kapan saja pengguna siap menagih klien, tersedia tombol "Terbitkan Invoice dari Proyek Ini" (1-click bridge).
  - Invoice juga dapat langsung menautkan dirinya ke Proyek terkait.

### C. Antarmuka Pemilihan Vendor (Smart Vendor Picker)
- Saat membuat invoice atau menghitung HPP di kalkulator:
  - Tampilkan modal pemilihan item vendor dengan visual kartu perbandingan:
    - Harga modal per satuan.
    - Rating bintang & badge reputasi.
    - Alamat / jarak relatif.
    - Catatan kualitas singkat.
  - Fitur sort: Termurah, Rating Tertinggi, atau Nama.
  - Tombol aksi 1-klik untuk memasukkan ke invoice sebagai pos modal sekaligus rekomendasi harga jual ke klien.

### D. Visualisasi & Laporan Laba (Profit Analytics)
- **Pada Detail & Form Invoice:**
  - Panel ringkasan: Omzet vs Modal vs Laba vs Margin.
  - Status modal (Internal view: tidak tampil di cetak A4/PDF klien).
- **Pada Daftar Invoice / Dashboard:**
  - Kolom / badge laba & margin per invoice.
  - Filter proyek paling menguntungkan (High Margin vs Low Margin).

---

## 3. Masukan & Usulan Tambahan (Value-Add Recommendations)

1. **Status Pembayaran Modal Vendor (Payable Status):**
   - Menambahkan status pelunasan ke vendor: `UNPAID` / `PAID`.
   - Mengapa penting: Pemilik tahu invoice mana yang sudah untung bersih dan tagihan vendor mana yang masih harus dilunasi.

2. **Pemisahan Lembar Cetak (Privacy Boundary):**
   - Data modal, nama vendor, dan rating vendor strictly hanya terlihat oleh owner (internal ERP).
   - Invoice print/PDF untuk klien tetap steril, hanya menampilkan deskripsi item dan harga jual.

3. **Multi-Vendor Benchmark per Item:**
   - Jika pengguna sering memesan barang yang sama (misal "Brosur A4 Art Paper 150gr"), pengguna bisa melihat perbandingan langsung:
     - Vendor A: Rp 150.000 / rim (Bintang 5, Jakarta Barat)
     - Vendor B: Rp 130.000 / rim (Bintang 3, Tangerang)
   - Memudahkan negosiasi dan pengambilan keputusan cepat.

---

## 4. Rencana Skema Database (Drizzle ORM)

```typescript
// 1. Tabel Vendors
export const vendors = pgTable('vendors', {
  id: serial('id').primaryKey(),
  businessId: integer('business_id').references(() => businesses.id),
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address'),
  phone: varchar('phone', { length: 50 }),
  rating: integer('rating').default(5), // 1-5 bintang
  qualityNotes: text('quality_notes'),
  category: varchar('category', { length: 50 }).default('general'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// 2. Hubungkan vendor_costs ke vendorId
// vendorCosts.vendorId -> references vendors.id

// 3. Tabel Invoice Costs (Modal Proyek)
export const invoiceCosts = pgTable('invoice_costs', {
  id: serial('id').primaryKey(),
  invoiceId: integer('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  vendorId: integer('vendor_id').references(() => vendors.id),
  description: text('description').notNull(),
  category: varchar('category', { length: 50 }).notNull().default('vendor'),
  quantity: numeric('quantity', { precision: 10, scale: 2 }).notNull().default('1'),
  unit: varchar('unit', { length: 50 }),
  unitCost: integer('unit_cost').notNull().default(0),
  totalCost: integer('total_cost').notNull().default(0),
  isPaidToVendor: boolean('is_paid_to_vendor').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
```

---

## 5. Pertanyaan Klarifikasi untuk Pengguna

1. **Struktur Proyek:** Apakah 1 proyek selalu identik dengan 1 invoice, atau 1 invoice bisa punya beberapa proyek? (Asumsi saat ini: 1 invoice = 1 proyek pesanan).
2. **Input Modal:** Apakah modal dimasukkan saat pembuatan invoice (estimasi modal), atau bisa diupdate belakangan setelah pengerjaan selesai (realisasi modal)?
3. **Penyimpanan Vendor:** Apakah ingin halaman khusus kelola vendor (`/vendors`), atau cukup modal popup di dalam kalkulator/invoice?
