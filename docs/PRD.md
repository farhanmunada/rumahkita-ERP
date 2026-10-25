# Product Requirements Document (PRD): RK-ERP Multi-Business Invoice Generator

**Status:** DRAFT (Menunggu Gerbang 1 Approval)  
**Tanggal:** 2026-10-25  
**Target Platform:** Web Application (Next.js App Router + TypeScript + Tailwind CSS + Neon DB Serverless PostgreSQL / Drizzle ORM)  

---

## 1. Problem Statement

Pengguna memiliki 4 lini bisnis mandiri (Percetakan, Desain, Web Dev, Konveksi) yang mencakup transaksi barang fisik dan penyediaan jasa profesional. Saat ini proses pembuatan tagihan (invoice) belum terintegrasi:
- Penomoran dan kop surat masih rawan bercampur atau dibuat manual.
- Belum ada sistem pencatatan terpusat yang memisahkan transaksi per unit usaha namun tetap dalam satu dashboard kontrol.
- Format cetak tagihan fisik maupun PDF membutuhkan tampilan profesional standar A4 tanpa elemen UI aplikasi yang mengganggu.

Ketiadaan generator invoice yang terstandarisasi menghambat kecepatan penagihan ke klien dan berisiko menimbulkan salah catat piutang.

---

## 2. Target Goals & Non-Goals

### 2.1 Goals (In-Scope — Iterasi Ini)
1. **Manajemen Unit Bisnis (Multi-Company Profile):**
   - Mendukung 4 profil bisnis default: Percetakan, Desain, Web Dev, Konveksi.
   - Konfigurasi kop mandiri per bisnis: Nama, Logo, Alamat, Kontak, Rekening Bank, Prefix Invoice (e.g., `PRT`, `DSN`, `WEB`, `KNV`), Catatan/Syarat Pembayaran default.
2. **Manajemen Klien (Client Directory):**
   - Data nama klien/perusahaan, kontak telepon/WhatsApp, email, dan alamat penagihan.
3. **Generator & Kalkulator Invoice Fleksibel:**
   - Pemilihan unit bisnis penerbit invoice.
   - Penomoran otomatis berbasis prefix unit, tahun, bulan, dan nomor urut (contoh: `INV/PRT/2026/10/0001`).
   - Fleksibilitas tipe item: **Barang** (kuantitas, satuan unit: pcs/rim/meter/dll., harga satuan) dan **Jasa** (uraian pekerjaan, durasi/paket, tarif).
   - Perhitungan otomatis real-time: Subtotal, Diskon (nominal/persentase), Pajak (PPN opsional 0%/11%/12%), Grand Total.
   - Status invoice: `DRAFT`, `SENT`, `PAID`, `CANCELLED`.
4. **Preview & Cetak Standar Industri A4:**
   - Pratinjau langsung invoice dengan tata letak kop surat resmi unit bisnis terpilih.
   - Cetak langsung browser (`window.print()`) dan opsi "Simpan sebagai PDF" dengan stylesheet cetak A4 terisolasi tanpa tombol navigasi web.

### 2.2 Non-Goals (Out-of-Scope — Mencegah Scope Creep)
1. **Payment Gateway Otomatis:** Pembayaran online otomatis (Midtrans/Xendit) tidak diimplementasikan pada iterasi awal; konfirmasi pelunasan dicatat secara manual (status update).
2. **Akuntansi Buku Besar (General Ledger):** Sistem tidak mencatat jurnal debet/kredit ganda, neraca saldo, atau laporan laba rugi komprehensif.
3. **Manajemen Stok Gudang (Inventory/WMS):** Sistem tidak mengurangi kuantitas stok barang fisik secara otomatis saat invoice terbit.
4. **Integrasi e-Faktur Pajak DJP:** Tidak ada integrasi API langsung ke sistem perpajakan instansi pemerintah.
5. **Autentikasi Multi-Role Kompleks:** Aplikasi berjalan untuk single-operator/internal owner tanpa pembagian permission rumit per pengguna.

---

## 3. User Stories & Kriteria Penerimaan (Format GIVEN/WHEN/THEN)

### Story 1: Konfigurasi Profil Unit Bisnis
*Sebagai pemilik usaha, saya ingin mengatur identitas dan rekening bank tiap lini bisnis, agar tagihan yang diterbitkan memiliki kop dan rekening tujuan yang sah.*

- **Kriteria 1.1:**
  - GIVEN: Halaman Pengaturan Unit Bisnis terbuka.
  - WHEN: Pengguna memperbarui nomor rekening, alamat, dan prefix nomor invoice untuk unit "Percetakan".
  - THEN: Data tersimpan di database dan langsung digunakan sebagai data default saat membuat invoice baru unit tersebut.

### Story 2: Pembuatan Invoice Baru (Barang & Jasa)
*Sebagai operator, saya ingin membuat invoice baru dengan memilih unit bisnis, klien, dan menambahkan item barang maupun jasa, agar total tagihan terkalkulasi presisi.*

- **Kriteria 2.1 (Penomoran Otomatis):**
  - GIVEN: Form invoice baru dibuka dan pengguna memilih unit bisnis "Web Dev" (prefix: `WEB`).
  - WHEN: Sistem memuat form.
  - THEN: Kolom nomor invoice otomatis terisi dengan format urutan berikutnya, misalnya `INV/WEB/2026/10/0001`.
- **Kriteria 2.2 (Kalkulasi Item Dinamis):**
  - GIVEN: Invoice memiliki 1 item barang (10 rim brosur @ Rp 150.000) dan 1 item jasa (Desain Layout 1 paket @ Rp 250.000).
  - WHEN: Pengguna menetapkan diskon Rp 50.000 dan PPN 11%.
  - THEN: Sistem mengkalkulasi Subtotal = Rp 1.750.000, Nilai setelah Diskon = Rp 1.700.000, PPN = Rp 187.000, Grand Total = Rp 1.887.000 secara otomatis dan instan tanpa delay.

### Story 3: Pratinjau & Cetak A4 / Unduh PDF
*Sebagai operator, saya ingin melihat pratinjau invoice format A4 dan mencetaknya atau menyimpannya sebagai PDF, agar siap dikirimkan kepada pelanggan.*

- **Kriteria 3.1:**
  - GIVEN: Pengguna berada di halaman detail/preview invoice.
  - WHEN: Pengguna menekan tombol "Cetak / Simpan PDF".
  - THEN: Dialog cetak browser (`window.print()`) terbuka, elemen navigasi aplikasi (header, tombol, footer) tersembunyi total, dan lembar invoice tertata rapi sesuai standar A4 portrait.

### Story 4: Pembaruan Status Pembayaran
*Sebagai pemilik bisnis, saya ingin mengubah status invoice menjadi "PAID" saat klien telah mentransfer uang, agar piutang terdata lunas.*

- **Kriteria 4.1:**
  - GIVEN: Sebuah invoice berstatus "SENT".
  - WHEN: Pengguna mengubah status menjadi "PAID".
  - THEN: Status berubah di database, badge warna status di daftar invoice terbarui menjadi hijau, dan tanggal pelunasan tercatat.

---

## 4. Batasan Teknis & Keamanan (Technical & Security Constraints)

1. **Performa:** Waktu render pratinjau invoice dan kalkulasi form wajib instan (<100ms) tanpa round-trip jaringan yang tidak perlu (state kalkulasi client-side reaktif).
2. **Format Keuangan:** Semua angka finansial disimpan sebagai integer sen/angka bulat IDR murni untuk menghindari floating-point rounding error. Formatter mata uang menggunakan standar `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' })`.
3. **Keamanan & Validasi:**
   - Validasi data input form di client dan server menggunakan schema validator teruji (Zod).
   - Sanitasi teks deskripsi untuk mencegah injeksi HTML/XSS saat dicetak ke dokumen.
4. **Penyimpanan Serverless PostgreSQL (Neon DB):** Menggunakan Neon DB melalui driver `@neondatabase/serverless` dan `drizzle-orm/neon-http` (HTTP stateless runner, ideal untuk serverless). Konfigurasi kredensial koneksi disimpan aman via variabel lingkungan `DATABASE_URL` di `.env` (tidak di-commit).

---

## 5. Definition of Done (DoD)

Fitur dinyatakan tuntas jika memenuhi seluruh syarat absolut berikut:
1. Skema database Drizzle ORM terdefinisi (`pgTable`) dan migrasi Neon DB PostgreSQL berjalan sukses.
2. 4 data unit bisnis awal (Percetakan, Desain, Web Dev, Konveksi) ter-seed dan dapat diedit.
3. Alur CRUD invoice (Create, Read/Preview, Update Status, Delete) berfungsi penuh.
4. Generator penomoran unik per unit bisnis berjalan tanpa bentrok.
5. Mode cetak browser A4 terverifikasi bersih tanpa elemen UI yang bocor ke kertas/PDF.
6. Typecheck TypeScript 0 error (`npx tsc --noEmit`).
7. Linter kode bersih (`npm run lint`).
8. Build produksi sukses (`npm run build`).

---

## 6. Spesifikasi Antarmuka (Web Frontend)

### 6.1 Daftar Rute & Fungsi
- `/`: Dashboard ringkas (statistik ringkas invoice bulan berjalan, filter per unit bisnis, tabel invoice terbaru).
- `/invoices`: Direktori seluruh invoice dengan filter status (Draft, Sent, Paid) dan filter unit usaha.
- `/invoices/new`: Form pembuatan invoice baru dinamis.
- `/invoices/[id]`: Halaman pratinjau invoice resmi (tampilan A4) dengan tombol aksi (Cetak, Edit Status, Hapus).
- `/invoices/[id]/edit`: Form pengeditan invoice eksisting.
- `/clients`: Direktori data pelanggan.
- `/settings/businesses`: Halaman konfigurasi identitas 4 lini bisnis (kop, rekening bank, prefix).

### 6.2 Tata Letak Halaman Preview Invoice A4 (ASCII Wireframe)
```
+-------------------------------------------------------------------------+
| [Header Web Nav - disembunyikan saat cetak: [<- Kembali] [Cetak/PDF] ]  |
+-------------------------------------------------------------------------+
|  KERTAS A4 (bg-white shadow border p-8 max-w-[210mm] mx-auto)          |
|                                                                         |
|  [LOGO BISNIS]               INVOICE                                    |
|  Nama Lini Bisnis            Nomor   : INV/WEB/2026/10/0001             |
|  Alamat, Kontak, Email       Tanggal : 25 Oktober 2026                  |
|                              Jatuh Tempo: 08 November 2026              |
|  ---------------------------------------------------------------------  |
|  TAGIHAN KEPADA:                                                        |
|  Nama Klien / Perusahaan                                                |
|  Alamat & No. HP                                                        |
|                                                                         |
|  +----+------------------------+-------+--------+------------+--------+ |
|  | No | Deskripsi Item         | Tipe  | Qty    | Harga (Rp) | Total  | |
|  +----+------------------------+-------+--------+------------+--------+ |
|  | 1  | Pembuatan Landing Page | Jasa  | 1 pkt  | 3.000.000  | 3.000k | |
|  | 2  | Maintenance Server 1bln| Jasa  | 1 bln  |   500.000  |   500k | |
|  +----+------------------------+-------+--------+------------+--------+ |
|                                                                         |
|  PEMBAYARAN DITRANSFER KE:                 Subtotal      : Rp 3.500.000 |
|  Bank BCA / Mandiri                        Diskon        : Rp   100.000 |
|  No Rek: 123-456-789                       PPN (11%)     : Rp   374.000 |
|  a.n. Pemilik Usaha                        ---------------------------- |
|                                            GRAND TOTAL   : Rp 3.774.000 |
|                                                                         |
|  Catatan / Syarat Pembayaran:                                           |
|  - Pembayaran maksimal 14 hari sejak invoice terbit                     |
|                                            [ Tanda Tangan & Cap ]       |
+-------------------------------------------------------------------------+
```

### 6.3 Token Desain & Styling
- Palet Warna: Slate/Neutral bersih (`#0f172a` primary text, `#f8fafc` background app, `#ffffff` surface paper, `#2563eb` action accent).
- Status Badge:
  - `DRAFT`: Abu-abu (`bg-slate-100 text-slate-700`)
  - `SENT`: Biru (`bg-blue-100 text-blue-700`)
  - `PAID`: Hijau zamrud (`bg-emerald-100 text-emerald-700`)
  - `CANCELLED`: Merah bata (`bg-rose-100 text-rose-700`)
- Tipografi: Inter / System Sans, tabular-nums untuk angka dan kolom harga.

---

## 7. Spesifikasi Kontrak Data & API Internal

### 7.1 Skema Data Inti (Drizzle ORM pgTable - Neon DB PostgreSQL)
- **`businesses`**:
  - `id`: serial primary key
  - `slug`: varchar(50) unique not null (e.g. `percetakan`, `desain`, `web-dev`, `konveksi`)
  - `name`: varchar(255) not null
  - `tagline`: text
  - `invoice_prefix`: varchar(20) not null (e.g. `PRT`, `DSN`, `WEB`, `KNV`)
  - `address`: text
  - `phone`: varchar(50)
  - `email`: varchar(255)
  - `bank_name`: varchar(100)
  - `bank_account_number`: varchar(100)
  - `bank_account_holder`: varchar(255)
  - `default_terms`: text
  - `created_at`: timestamp with time zone default now()
  - `updated_at`: timestamp with time zone default now()
- **`clients`**:
  - `id`: serial primary key
  - `name`: varchar(255) not null
  - `company_name`: varchar(255)
  - `phone`: varchar(50)
  - `email`: varchar(255)
  - `address`: text
  - `created_at`: timestamp with time zone default now()
  - `updated_at`: timestamp with time zone default now()
- **`invoices`**:
  - `id`: serial primary key
  - `business_id`: integer references `businesses(id)` on delete restrict
  - `client_id`: integer references `clients(id)` on delete restrict
  - `invoice_number`: varchar(100) not null unique
  - `issue_date`: varchar(10) not null (YYYY-MM-DD)
  - `due_date`: varchar(10) not null (YYYY-MM-DD)
  - `status`: varchar(20) not null default 'DRAFT' (DRAFT, SENT, PAID, CANCELLED)
  - `subtotal`: integer not null default 0
  - `discount_type`: varchar(20) default 'fixed' (fixed/percentage)
  - `discount_value`: integer default 0
  - `tax_percent`: integer default 0
  - `tax_amount`: integer default 0
  - `total_amount`: integer not null default 0
  - `notes`: text
  - `terms`: text
  - `created_at`: timestamp with time zone default now()
  - `updated_at`: timestamp with time zone default now()
- **`invoice_items`**:
  - `id`: serial primary key
  - `invoice_id`: integer references `invoices(id)` on delete cascade
  - `item_type`: varchar(20) not null default 'service' ('goods' | 'service')
  - `description`: text not null
  - `quantity`: numeric(10, 2) not null default '1'
  - `unit`: varchar(50) (e.g. 'pcs', 'rim', 'lembar', 'paket', 'jam')
  - `unit_price`: integer not null default 0
  - `total_price`: integer not null default 0
  - `created_at`: timestamp with time zone default now()

### 7.2 API Endpoints (Next.js Server Actions / Route Handlers)
- `GET /api/businesses` & `PUT /api/businesses/:id`
- `GET /api/clients` & `POST /api/clients`
- `GET /api/invoices` (filter by business_id, status)
- `POST /api/invoices` (buat invoice lengkap beserta items)
- `GET /api/invoices/:id` (detail invoice, items, profil bisnis, dan klien)
- `PATCH /api/invoices/:id/status` (update status: DRAFT, SENT, PAID, CANCELLED)
- `DELETE /api/invoices/:id`
- `GET /api/invoices/next-number?business_id=:id` (generate format nomor urut berikutnya)
