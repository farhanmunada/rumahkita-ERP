# RESEARCH: Multi-Business ERP & Generator Invoice (RK-ERP)

**Tanggal:** 2026-10-25  
**Status:** Verified  
**Agent/Author:** Hermes Agent  

---

## 1. Konteks Riset

- **Pertanyaan Utama:**
  1. Bagaimana memodelkan sistem generator invoice untuk multi-lini bisnis (Percetakan, Desain, Web Dev, Konveksi) dengan pemisahan identitas kop surat dan format penomoran?
  2. Bagaimana menangani item invoice campuran antara Barang (punya satuan kuantitas: pcs, rim, meter) dan Jasa (paket, termin/milestone, jam kerja)?
  3. Bagaimana arsitektur output invoice terbaik untuk cetak browser (print) dan unduh PDF yang presisi ukuran A4 tanpa dependensi biner berat?
- **Alasan Riset:** Kebutuhan paling mendesak pengguna adalah generator invoice operasional yang siap pakai untuk 4 unit bisnis mandiri, sebelum modul ERP lainnya diperluas.
- **Scope:**
  - **In-Scope:** Manajemen profil unit bisnis, manajemen data klien, pembuatan & kalkulasi invoice (subtotal, diskon, PPN, grand total), preview invoice interaktif, cetak browser A4 teroptimasi (`@media print`), ekspor PDF.
  - **Out-of-Scope (Fase Ini):** Payment gateway otomatis, akuntansi buku besar (general ledger), manajemen stok gudang (inventory WMS), integrasi perpajakan e-Faktur DJP.

---

## 2. Temuan Utama

### 2.1 Pemodelan Multi-Lini Bisnis & Penomoran Invoice
1. **Identitas Mandiri per Lini Bisnis:**
   - 4 Unit Bisnis:
     - `Percetakan`: dominan barang fisik terukur (rim, lembar, pcs, box) + jasa cetak/finishing.
     - `Desain`: jasa kreatif (revisi, paket branding, lisensi aset).
     - `Web Dev`: jasa profesional & proyek (termin milestone, maintenance retainers, domain/hosting).
     - `Konveksi`: produksi garmen massal (lusin, pcs, varian ukuran/kain).
   - Setiap unit bisnis membutuhkan:
     - Nama resmi lini bisnis & logo
     - Alamat operasional, email, no. telepon/WhatsApp
     - Informasi rekening bank tujuan transfer
     - Prefix penomoran khusus (contoh: `INV/PRT/2026/0001`, `INV/DSN/...`, `INV/WEB/...`, `INV/KNV/...`)
     - Catatan default & syarat pembayaran (Terms & Conditions) spesifik lini bisnis.

### 2.2 Penanganan Item Invoice: Barang vs Jasa
- Komponen baris invoice (`invoice_items`) memerlukan fleksibilitas:
  - `item_type`: enum (`goods` / `service`)
  - `description`: rincian deskripsi pekerjaan atau nama barang
  - `quantity`: kuantitas (desimal atau integer)
  - `unit`: satuan unit (opsional untuk jasa, terstruktur untuk barang: `pcs`, `rim`, `lembar`, `meter`, `lusin`, `jam`, `paket`, `bulan`)
  - `unit_price`: harga per unit (IDR)
  - `total_price`: hasil kalkulasi `quantity * unit_price`
  - Perhitungan agregat: Subtotal → Diskon (nominal / persentase) → Pajak/PPN (opsional 11% / 12% / custom) → Grand Total.

### 2.3 Solusi Cetak Browser & Ekspor PDF
- **Rung 1 & 2 (Native & Dependency Ladder):**
  - **Cetak Browser Langsung (Browser Print API):**
    - Menggunakan stylesheet khusus `@media print` dengan ukuran halaman `@page { size: A4 portrait; margin: 12mm 15mm; }`.
    - Menyembunyikan seluruh UI navigasi, sidebar, dan tombol aksi saat mode cetak (`print:hidden`).
    - Memastikan pemutusan halaman (`break-inside-avoid`, `page-break-after: avoid`) pada tabel dan total kalkulasi agar rapi di 1 atau multi-halaman.
  - **Ekspor PDF Langsung di Klien:**
    - Pilihan A: Menggunakan dialog bawaan browser `window.print()` dengan opsi "Save as PDF" (100% native, 0 KB overhead dependensi tambahan).
    - Pilihan B: Menggunakan library client-side seperti `html2pdf.js` / `@react-pdf/renderer` jika pengguna membutuhkan tombol instan unduh `.pdf` tanpa dialog print.
    - **Rekomendasi:** Implementasikan native print stylesheet A4 yang presisi terlebih dahulu. Sediakan tombol "Cetak / Simpan PDF" yang memanggil `window.print()` karena mesin render Chromium/Gecko menghasilkan PDF berbasis vektor tajam dengan seleksi teks asli.

### 2.4 Pilihan Stack & Arsitektur
- **Framework:** Next.js (App Router, React 19 / 18, TypeScript)
- **Styling:** Tailwind CSS (dengan utility typography & print)
- **Database:** Neon DB (Serverless PostgreSQL) dengan Drizzle ORM (`@neondatabase/serverless` / `drizzle-orm/neon-http`)
  - *Alasan:* Serverless PostgreSQL modern, auto-scaling, driver HTTP stateless cepat untuk serverless Next.js, tanpa overhead kompilasi biner C++ lokal (seperti better-sqlite3 pada Windows), dan skema Drizzle type-safe berbasis `pgTable`.

---

## 3. Sumber & Validasi

| # | Sumber | Versi | Tanggal Akses | Status Validasi |
|---|--------|-------|---------------|-----------------|
| 1 | Next.js Official Docs | v15.x | 2026-10-25 | ✅ Verified |
| 2 | Drizzle ORM Neon HTTP Docs | latest | 2026-10-25 | ✅ Verified |
| 3 | Neon Serverless Postgres Docs | latest | 2026-10-25 | ✅ Verified |
| 4 | W3C CSS Paged Media Spec (`@page`, `@media print`) | Level 3 | 2026-10-25 | ✅ Verified |

---

## 4. Risiko & Limitasi

- **Risiko 1 (Format Cetak Lintas Browser):** Pengaturan margin cetak di browser pengguna bisa memotong kop jika margin default pengguna diset terlalu besar.  
  *Mitigasi:* Definisikan CSS `@page { margin: 10mm; size: A4; }` dan wrapper kontainer berukuran persis `210mm` x `297mm` (atau `min-h-[297mm]`) dengan `print:p-0`.
- **Risiko 2 (Penomoran Duplikat):** Pembuatan nomor invoice secara bersamaan di multi-unit bisnis.  
  *Mitigasi:* Gunakan transaksi DB atau trigger urutan nomor berdasarkan formula `[PREFIX]/[TAHUN]/[BULAN]/[NOMOR_URUT_4_DIGIT]`.

---

## 5. Rekomendasi

1. Inisialisasi projek monolitik Next.js di root repositori menggunakan TypeScript, Tailwind CSS, dan ESLint.
2. Gunakan Neon DB (Serverless PostgreSQL) + Drizzle ORM (`@neondatabase/serverless` / `drizzle-orm/neon-http`) untuk persistensi data handal, koneksi pooled stateless, dan schema type-safe.
3. Rancang UI bersih dengan navigasi:
   - Dashboard ringkas (daftar invoice terbaru, status pembayaran: Draft, Sent, Paid, Overdue).
   - Modul Unit Bisnis (kelola 4 lini: Percetakan, Desain, Web Dev, Konveksi).
   - Modul Klien (daftar pelanggan per unit atau lintas unit).
   - Form Pembuatan Invoice Dinamis (pilih unit bisnis -> nomor ter-generate otomatis -> pilih klien -> input baris barang/jasa -> kalkulasi pajak/diskon).
   - Halaman Preview & Cetak Invoice A4 profesional.
