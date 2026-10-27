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

---

## 8. Modul Baru: Kalkulator HPP & Estimasi Harga Jual (Pricing & Cost Calculator)

### 8.1 Latar Belakang & Kebutuhan Pengguna
Unit usaha seringkali mengeluarkan modal belanja bahan/jasa terlebih dahulu sebelum menentukan harga penawaran ke pembeli. Pengguna membutuhkan alat hitung HPP interaktif yang menghitung seluruh modal dasar, memberikan simulasi margin keuntungan, dan langsung mengonversinya menjadi invoice atau penawaran harga.

### 8.2 User Story
*Sebagai pemilik usaha multi-lini, saya ingin merinci seluruh biaya modal proyek (bahan baku, jasa/tenaga kerja, overhead), agar saya mengetahui modal dasar per unit dan mendapatkan perbandingan harga jual yang menguntungkan serta aman sebelum menawarkan ke konsumen.*

### 8.3 Kriteria Penerimaan (GIVEN / WHEN / THEN)
1. **Rincian Komponen Modal Dinamis:**
   - GIVEN: Halaman Kalkulator HPP dibuka.
   - WHEN: Pengguna memilih unit usaha (Percetakan / Konveksi / Desain / Web Dev) dan memasukkan target kuantitas output (contoh: 100 pcs).
   - THEN: Pengguna dapat menambah/menghapus baris biaya modal dengan kategori (`Bahan Baku`, `Tenaga Kerja/Jasa`, `Overhead/Operasional`).
2. **Kalkulasi Total HPP & HPP/Unit Real-Time:**
   - GIVEN: Total biaya modal dimasukkan sebesar Rp 1.500.000 untuk 100 pcs.
   - WHEN: Nilai diinput/diubah.
   - THEN: Sistem otomatis menampilkan HPP Total = Rp 1.500.000 dan HPP per Pcs = Rp 15.000 secara instan.
3. **Simulasi Perbandingan Multi-Skenario Harga:**
   - GIVEN: HPP telah terhitung.
   - WHEN: Sistem memproses simulasi.
   - THEN: Menampilkan 4 tier perbandingan harga jual:
     - Tier Tipis/Minimal (Margin 20%) -> Harga Jual & Laba Kotor.
     - Tier Standar/Pasar (Margin 35%) -> Harga Jual & Laba Kotor.
     - Tier Rekomendasi/Ideal (Margin 50%) -> Harga Jual & Laba Kotor.
     - Tier Kustom -> Pengguna dapat memasukkan persentase margin/markup sendiri secara fleksibel.
4. **Konversi Langsung ke Invoice (1-Click Bridge):**
   - GIVEN: Pengguna memilih salah satu tier harga rekomendasi.
   - WHEN: Pengguna menekan tombol "Buat Invoice dari Hasil Ini".
   - THEN: Sistem mengarahkan ke form pembuatan invoice baru (`/invoices/new`) dengan field unit bisnis, deskripsi item barang/jasa, kuantitas, dan harga satuan yang sudah otomatis terisi.

---

## 9. Modul Autentikasi Sesi & Idle Auto-Logout (1 Jam Inaktif)

### 9.1 Latar Belakang & Kebutuhan
Sebelum pengguna mengakses dashboard dan modul ERP, wajib melewati gerbang login terverifikasi. Sesi harus memiliki perlindungan otomatis: jika operator meninggalkan komputer selama 1 jam tanpa interaksi, sistem otomatis mengakhiri sesi (logout) untuk mencegah akses tidak sah pada data finansial dan nota tagihan.

### 9.2 Spesifikasi Teknis
1. **Rute Terproteksi & Pengecualian:**
   - Public: `/login`, `/api/auth/login`, `/api/auth/logout`, `/invoices/[id]/print` (halaman verifikasi dokumen cetak via QR).
   - Protected: Seluruh halaman lain (`/`, `/invoices/*`, `/clients/*`, `/calculator/*`, `/settings/*`).
2. **Manajemen Sesi:**
   - Cookie HttpOnly `rk_session` terenkripsi / tertanda tangan aman (HMAC SHA-256 via Web Crypto API natif).
   - Masa berlaku sesi: 3.600 detik (1 jam).
3. **Idle Timeout Watcher (Client-Side & Server-Side):**
   - Client watcher memantau interaksi pengguna (`mousemove`, `keydown`, `click`, `scroll`).
   - Setiap interaksi aktif memperbarui timestamp aktivitas (dibatasi throttling 2 menit ke `/api/auth/touch`).
   - Bila tidak ada interaksi selama 60 menit berturut-turut, klien memanggil `/api/auth/logout` dan mengarahkan ke `/login?reason=idle_timeout`.
   - Di sisi server (Middleware), setiap request memvalidasi umur token; jika melebihi 3.600 detik sejak aktivitas terakhir, request langsung diarahkan ke `/login`.

---

## 10. Modul Manajemen Proyek (HPP Real) & Direktori Vendor Berbasis Kualitas

**Status:** DRAFT (Menunggu Gerbang 1 Approval)  
**Tanggal:** 2026-10-27  

### 10.1 Problem Statement
1. Pengguna butuh mencatat dan menyimpan proyek dengan modal riil (HPP real) saat perencanaan atau produksi berlangsung, bahkan **sebelum atau tanpa membuat invoice**.
2. Saat ini belum ada entitas Proyek mandiri; sistem hanya mengenal Invoice. Pengguna tidak bisa menyimpan catatan modal riil jika proyek belum siap ditagihkan.
3. Saat memilih pihak ketiga (vendor subkon/material), data vendor saat ini hanya berupa string nama tanpa informasi esensial: alamat/lokasi (berpengaruh pada waktu kirim dan ongkir), rating kualitas buatan pengguna (1-5 bintang), serta catatan kelebihan/kekurangan vendor.
4. Ketiadaan halaman mandiri pengelolaan vendor (`/vendors`) dan proyek (`/projects`) menyulitkan pengawasan katalog rekanan produksi dan perbandingan laba antar proyek.

### 10.2 Target Goals & Non-Goals

#### Goals (In-Scope — Iterasi Ini):
1. **Entitas & Halaman Proyek Mandiri (`/projects`):**
   - Membuat dan menyimpan Proyek mandiri tanpa kewajiban membuat invoice.
   - Atribut proyek: Nama Proyek, Unit Bisnis, Klien (opsional), Status (`PLANNING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`), Nilai Penawaran/Omzet Target, Realisasi Nilai.
   - Pencatatan HPP Real proyek (`project_costs`): daftar pos pengeluaran riil (vendor, bahan baku, ongkir, jasa pihak ketiga).
   - Indikator finansial otomatis: Total Modal Real, Laba Kotor (Profit = Omzet - Total Modal), dan Margin Keuntungan (%).
   - Jembatan 1-Klik: "Terbitkan Invoice dari Proyek Ini" (otomatis mengonversi proyek menjadi draft invoice jika sudah siap tagih).
2. **Halaman Terpisah Manajemen Vendor (`/vendors`):**
   - CRUD lengkap data Vendor: Nama, Alamat lengkap / Lokasi, No. Telepon / WhatsApp, Rating Kualitas (1 - 5 bintang), Catatan Reputasi/Kualitas, Kategori Spesialisasi.
   - Manajemen katalog tarif item/jasa per vendor.
3. **Smart Vendor Picker & Komparasi Kualitas:**
   - Dialog pemilihan item vendor di form proyek, kalkulator HPP, dan invoice: menampilkan Harga Modal, Rating Kualitas (bintang), Alamat, dan Catatan.
   - Opsi filter dan sorting (harga termurah, rating tertinggi).
4. **Isolasi Kerahasiaan Modal & Cetak Bersih:**
   - Data modal (HPP real), vendor, laba, dan margin berstatus STRICTLY INTERNAL.
   - Lembar cetak dokumen A4 dan ekspor PDF resmi invoice dijamin 100% bebas dari data HPP/vendor internal.

#### Non-Goals (Out-of-Scope):
1. **Integrasi Purchase Order (PO) Formal:** Sistem tidak mencetak surat pesanan pembelian (PO) resmi ke vendor.
2. **Manajemen Utang/Piutang Akrual Multi-Jurnal:** Sistem tidak menerapkan double-entry bookkeeping akuntansi.
3. **Geolokasi GPS / Radius Jarak Otomatis:** Alamat dicatat sebagai teks deskriptif terstruktur tanpa API Maps berbayar.

### 10.3 User Stories & Kriteria Penerimaan (Format GIVEN/WHEN/THEN)

#### Story 1: Simpan Proyek Mandiri dengan HPP Real (Tanpa Invoice)
*Sebagai pemilik usaha, saya ingin menyimpan proyek baru dengan rincian biaya modal riil (HPP real) tanpa harus membuat invoice, agar saya dapat melacak pengeluaran proyek yang sedang berjalan.*

- **Kriteria 1.1:**
  - GIVEN: Pengguna berada di halaman `/projects/new` atau Kalkulator HPP.
  - WHEN: Pengguna memasukkan nama proyek "Pengadaan Kaos Komunitas 100 pcs", unit bisnis "Konveksi", nilai target Rp 6.000.000, serta menambahkan pos modal real (Kain Rp 2.500.000, Sablon DTF Vendor A Rp 1.200.000, Jahit Rp 800.000).
  - THEN: Proyek tersimpan dengan Total Modal Real = Rp 4.500.000, Estimasi Laba = Rp 1.500.000, Margin = 25.0%, dengan status `IN_PROGRESS` dan tanpa invoice.
- **Kriteria 1.2 (Konversi ke Invoice saat Selesai):**
  - GIVEN: Proyek tersimpan di database dengan HPP real.
  - WHEN: Pengguna menekan tombol "Terbitkan Invoice".
  - THEN: Sistem membuat draft invoice terkait, menyalin data klien dan nilai tagihan, serta menautkan `invoiceId` ke proyek tersebut.

#### Story 2: Manajemen Vendor Mandiri di Halaman `/vendors`
*Sebagai pemilik bisnis, saya ingin mengelola direktori rekanan vendor di halaman tersendiri lengkap dengan alamat, rating, dan catatan kualitas, agar saya memiliki pusat data rekanan yang terorganisir.*

- **Kriteria 2.1:**
  - GIVEN: Pengguna berada di halaman `/vendors`.
  - WHEN: Pengguna menambah vendor baru dengan Nama: "CV Sablon Kilat", Alamat: "Jl. Percetakan Negara No. 12, Jakarta Pusat", Telepon: "081234567890", Rating: 5, Catatan: "Hasil sablon DTF sangat presisi, jarang meleset".
  - THEN: Vendor tersimpan di database dan tampil di daftar vendor dengan badge rating 5 bintang dan alamat jelas.

#### Story 3: Pemilihan Vendor Berbasis Harga, Alamat, dan Rating
*Sebagai operator saat menyusun modal proyek, saya ingin memilih item dari vendor dengan melihat perbandingan harga, rating bintang, dan alamat, agar saya dapat memutuskan vendor paling efisien dan berkualitas.*

- **Kriteria 3.1:**
  - GIVEN: Form biaya proyek terbuka dan pengguna membuka picker vendor.
  - WHEN: Sistem memuat katalog vendor.
  - THEN: Menampilkan kartu/tabel vendor dengan kolom Nama Vendor, Harga Modal Satuan, Alamat Vendor, Rating (1-5 Bintang), dan Catatan Kualitas serta tombol "Pilih".

### 10.4 Batasan Teknis & Keamanan
1. **Performa Agregasi:** Kalkulasi total modal real dan laba dihitung instan < 50ms.
2. **Integritas Relasi:** Jika vendor dihapus, riwayat modal proyek tetap aman (gunakan `onDelete: set null` pada referensi vendor dan simpan `vendorNameSnapshot`).
3. **Format Presisi:** Semua nominal modal dan laba disimpan sebagai integer mata uang IDR rupiah murni.

### 10.5 Spesifikasi Antarmuka & Rute Baru
1. `/projects`: Daftar proyek, filter status (`PLANNING`, `IN_PROGRESS`, `COMPLETED`), kartu laba & modal.
2. `/projects/new`: Form pembuatan proyek baru & input HPP real awal.
3. `/projects/[id]`: Detail proyek, ringkasan HPP real, daftar pengeluaran vendor, tombol terbitkan invoice.
4. `/vendors`: Direktori master vendor, filter rating & kategori, CRUD vendor.
5. Update Navbar: Tambah navigasi "Proyek" dan "Vendor".

### 10.6 Kontrak Data Skema Drizzle ORM
```typescript
// vendors
export const vendors = pgTable('vendors', {
  id: serial('id').primaryKey(),
  businessId: integer('business_id').references(() => businesses.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address'),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  rating: integer('rating').notNull().default(5), // Skala 1 - 5
  qualityNotes: text('quality_notes'),
  category: varchar('category', { length: 50 }).notNull().default('general'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// projects (Proyek Mandiri untuk Lacak HPP Real)
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  businessId: integer('business_id').notNull().references(() => businesses.id),
  clientId: integer('client_id').references(() => clients.id, { onDelete: 'set null' }),
  invoiceId: integer('invoice_id').references(() => invoices.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 30 }).notNull().default('PLANNING'), // PLANNING, IN_PROGRESS, COMPLETED, CANCELLED
  targetRevenue: integer('target_revenue').notNull().default(0), // Nilai proyek / omzet
  totalCost: integer('total_cost').notNull().default(0), // Total HPP Real
  grossProfit: integer('gross_profit').notNull().default(0), // Omzet - Total Cost
  profitMargin: numeric('profit_margin', { precision: 5, scale: 2 }).default('0'), // Persentase margin
  startDate: varchar('start_date', { length: 10 }),
  endDate: varchar('end_date', { length: 10 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// project_costs (Rincian Biaya Modal Real per Proyek)
export const projectCosts = pgTable('project_costs', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  vendorId: integer('vendor_id').references(() => vendors.id, { onDelete: 'set null' }),
  vendorNameSnapshot: varchar('vendor_name_snapshot', { length: 255 }),
  itemName: varchar('item_name', { length: 255 }).notNull(),
  category: varchar('category', { length: 50 }).notNull().default('vendor'), // vendor, material, labor, shipping, other
  quantity: numeric('quantity', { precision: 10, scale: 2 }).notNull().default('1'),
  unit: varchar('unit', { length: 50 }),
  unitCost: integer('unit_cost').notNull().default(0),
  totalCost: integer('total_cost').notNull().default(0),
  isPaidToVendor: boolean('is_paid_to_vendor').notNull().default(false),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
```

