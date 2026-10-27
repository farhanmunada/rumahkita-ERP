# Dokumen Arsitektur Sistem: RK-ERP Multi-Business Invoice Generator

**Status:** MENUNGGU GERBANG 2 APPROVAL  
**Tanggal:** 2026-10-25  
**Basis Data:** Neon DB (Serverless PostgreSQL) + Drizzle ORM  
**Framework:** Next.js 15 (App Router, TypeScript, Tailwind CSS)

---

## 1. Ringkasan Arsitektur

RK-ERP adalah web generator invoice multi-lini usaha untuk 4 unit bisnis (Percetakan, Desain, Web Dev, Konveksi). Arsitektur dirancang menggunakan pola **Feature-First** (modular per domain bisnis) dengan pemisahan tegas antara routing (`app/`), logika domain (`src/features/`), dan modul bersama (`src/shared/`).

```text
[ Browser / Klien ]
        │
        ▼ (HTTP / Server Actions)
[ Next.js App Router (app/) ]
        │
        ▼ (Type-safe DTO & Services)
[ Domain Features (src/features/) ]
   ├── businesses/ (Profil & Rekening 4 Unit)
   ├── clients/    (Direktori Pelanggan)
   └── invoices/   (Kalkulator, Generator No, Preview A4)
        │
        ▼ (Drizzle ORM pgTable / HTTP Client)
[ Shared DB Core (src/shared/db/) ]
        │
        ▼ (HTTPS / Connection Pooling)
[ Neon DB (Serverless PostgreSQL) ]
```

---

## 2. Struktur Direktori Berkas (Feature-First)

```text
RK-ERP/
├── app/                                 # Next.js App Router
│   ├── api/                             # Internal REST Route Handlers
│   │   ├── businesses/route.ts
│   │   ├── businesses/[id]/route.ts
│   │   ├── clients/route.ts
│   │   ├── clients/[id]/route.ts
│   │   ├── invoices/route.ts
│   │   ├── invoices/[id]/route.ts
│   │   ├── invoices/[id]/status/route.ts
│   │   └── invoices/next-number/route.ts
│   ├── clients/page.tsx                 # Direktori & modal klien
│   ├── invoices/
│   │   ├── page.tsx                     # Daftar invoice, filter status & unit
│   │   ├── new/page.tsx                 # Form pembuatan invoice dinamis
│   │   ├── [id]/page.tsx                # Preview resmi & cetak A4
│   │   └── [id]/edit/page.tsx           # Form edit invoice
│   ├── settings/
│   │   └── businesses/page.tsx          # Konfigurasi profil 4 bisnis
│   ├── layout.tsx                       # Root layout (Navbar & navigasi)
│   ├── page.tsx                         # Dashboard utama & statistik ringkas
│   └── globals.css                      # Tailwind base & CSS @media print A4
│
├── src/
│   ├── features/
│   │   ├── businesses/
│   │   │   ├── components/
│   │   │   │   └── BusinessSettingsForm.tsx
│   │   │   ├── services/business.service.ts
│   │   │   └── types.ts
│   │   ├── clients/
│   │   │   ├── components/
│   │   │   │   ├── ClientList.tsx
│   │   │   │   └── ClientModal.tsx
│   │   │   ├── services/client.service.ts
│   │   │   └── types.ts
│   │   └── invoices/
│   │       ├── components/
│   │       │   ├── InvoiceForm.tsx
│   │       │   ├── InvoicePreviewA4.tsx
│   │       │   ├── InvoiceStatusBadge.tsx
│   │       │   └── InvoiceFilterBar.tsx
│   │       ├── services/
│   │       │   ├── invoice.service.ts
│   │       │   ├── invoice-calculator.ts
│   │       │   └── invoice-number.ts
│   │       └── types.ts
│   │
│   └── shared/
│       ├── components/
│       │   ├── ui/                      # Button, Input, Select, Badge, Card, Modal
│       │   └── Navbar.tsx               # Header navigasi utama (print:hidden)
│       ├── db/
│       │   ├── client.ts                # Neon DB HTTP client & drizzle instance
│       │   ├── schema.ts                # Drizzle pgTable definitions & relations
│       │   └── seed.ts                  # Seed script 4 profil bisnis awal
│       └── lib/
│           ├── currency.ts              # Format rupiah (Intl.NumberFormat)
│           ├── date.ts                  # Format tanggal lokal Indonesia
│           └── utils.ts                 # cn (clsx + tailwind-merge)
│
├── docs/                                # Dokumentasi resmi (PRD, RESEARCH, ARCHITECTURE)
├── drizzle.config.ts                    # Drizzle Kit config untuk PostgreSQL
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

---

## 3. Spesifikasi Skema Database (Drizzle ORM `pgTable`)

Penyimpanan menggunakan Neon DB Serverless PostgreSQL dengan pool stateless berbasis HTTP query runner (`@neondatabase/serverless`).

```typescript
// src/shared/db/schema.ts
import { pgTable, serial, varchar, text, integer, numeric, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const businesses = pgTable('businesses', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 50 }).notNull().unique(), // percetakan, desain, web-dev, konveksi
  name: varchar('name', { length: 255 }).notNull(),
  tagline: text('tagline'),
  invoicePrefix: varchar('invoice_prefix', { length: 20 }).notNull(), // PRT, DSN, WEB, KNV
  address: text('address'),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  bankName: varchar('bank_name', { length: 100 }),
  bankAccountNumber: varchar('bank_account_number', { length: 100 }),
  bankAccountHolder: varchar('bank_account_holder', { length: 255 }),
  defaultTerms: text('default_terms'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const clients = pgTable('clients', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  companyName: varchar('company_name', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  address: text('address'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const invoices = pgTable('invoices', {
  id: serial('id').primaryKey(),
  businessId: integer('business_id').notNull().references(() => businesses.id),
  clientId: integer('client_id').notNull().references(() => clients.id),
  invoiceNumber: varchar('invoice_number', { length: 100 }).notNull().unique(),
  issueDate: varchar('issue_date', { length: 10 }).notNull(), // YYYY-MM-DD
  dueDate: varchar('due_date', { length: 10 }).notNull(),   // YYYY-MM-DD
  status: varchar('status', { length: 20 }).notNull().default('DRAFT'), // DRAFT, SENT, PAID, CANCELLED
  subtotal: integer('subtotal').notNull().default(0),
  discountType: varchar('discount_type', { length: 20 }).default('fixed'), // fixed | percentage
  discountValue: integer('discount_value').default(0),
  taxPercent: integer('tax_percent').default(0),
  taxAmount: integer('tax_amount').default(0),
  totalAmount: integer('total_amount').notNull().default(0),
  notes: text('notes'),
  terms: text('terms'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const invoiceItems = pgTable('invoice_items', {
  id: serial('id').primaryKey(),
  invoiceId: integer('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  itemType: varchar('item_type', { length: 20 }).notNull().default('service'), // goods | service
  description: text('description').notNull(),
  quantity: numeric('quantity', { precision: 10, scale: 2 }).notNull().default('1'),
  unit: varchar('unit', { length: 50 }), // pcs, rim, lembar, paket, jam
  unitPrice: integer('unit_price').notNull().default(0),
  totalPrice: integer('total_price').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Relasi Drizzle
export const businessesRelations = relations(businesses, ({ many }) => ({
  invoices: many(invoices),
}));

export const clientsRelations = relations(clients, ({ many }) => ({
  invoices: many(invoices),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  business: one(businesses, { fields: [invoices.businessId], references: [businesses.id] }),
  client: one(clients, { fields: [invoices.clientId], references: [clients.id] }),
  items: many(invoiceItems),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, { fields: [invoiceItems.invoiceId], references: [invoices.id] }),
}));
```

---

## 4. Mekanisme Cetak A4 & Desain Output

1. **CSS Paged Media (`@media print`):**
   - `@page { size: A4 portrait; margin: 12mm 15mm; }`
   - Wrapper preview utama diberi class: `w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white p-8 print:p-0 print:shadow-none print:m-0`
   - Elemen non-dokumen (Navbar, breadcrumb, tombol Cetak, filter) disembunyikan total via `print:hidden`.
   - Hindari pemotongan tabel di tengah baris via `break-inside-avoid`.
2. **Kalkulasi Finansial Presisi:**
   - Semua nilai rupiah disimpan dalam integer sen IDR (tanpa floating point).
   - Rumus:
     - `subtotal = sum(item.quantity * item.unitPrice)`
     - `diskonNominal = discountType === 'percentage' ? round(subtotal * discountValue / 100) : discountValue`
     - `setelahDiskon = max(0, subtotal - diskonNominal)`
     - `pajakNominal = round(setelahDiskon * taxPercent / 100)`
     - `grandTotal = setelahDiskon + pajakNominal`

---

## 5. Rencana Sub-Tugas Implementasi (Task Breakdown)

Pekerjaan dipecah menjadi 10 sub-tugas terisolasi:

| Sub-Tugas | Berkas Terkait | Deskripsi Aksi | Verifikasi |
|---|---|---|---|
| **ST-1** | `package.json`, `tsconfig.json`, `tailwind.config.ts`, `globals.css` | Bootstrap project Next.js 15, Tailwind CSS, TypeScript, pasang pustaka `@neondatabase/serverless`, `drizzle-orm`, `drizzle-kit`, `zod`, `lucide-react`, `clsx`, `tailwind-merge` | `npm run build` / verify dependencies |
| **ST-2** | `src/shared/db/schema.ts`, `src/shared/db/client.ts`, `drizzle.config.ts`, `src/shared/db/seed.ts` | Definisikan skema PostgreSQL Drizzle, setup client HTTP Neon, buat migration & seed script 4 bisnis | Syntax check & Drizzle validation |
| **ST-3** | `src/shared/lib/`, `src/shared/components/ui/`, `src/shared/components/Navbar.tsx` | Helper format Rupiah, tanggal, utilities cn, komponen tombol, input, select, card, modal dialog | Typecheck `npx tsc --noEmit` |
| **ST-4** | `src/features/businesses/`, `app/api/businesses/`, `app/settings/businesses/page.tsx` | Service CRUD unit bisnis, API endpoint, form konfigurasi identitas/kop/rekening 4 bisnis | Test API endpoint bisnis |
| **ST-5** | `src/features/clients/`, `app/api/clients/`, `app/clients/page.tsx` | Service CRUD klien, API endpoint, UI direktori & modal tambah/edit pelanggan | Test API endpoint klien |
| **ST-6** | `src/features/invoices/services/invoice-calculator.ts`, `invoice-number.ts`, `app/api/invoices/next-number/route.ts` | Logic kalkulasi real-time & generator penomoran otomatis format `INV/[PREFIX]/[YYYY]/[MM]/[XXXX]` | Unit test / assertion test |
| **ST-7** | `src/features/invoices/components/InvoiceForm.tsx`, `app/invoices/new/page.tsx`, `app/invoices/[id]/edit/page.tsx` | Form pembuatan & edit invoice dinamis (multi-item barang/jasa, kalkulator reaktif) | Verify form state & submit |
| **ST-8** | `src/features/invoices/components/InvoicePreviewA4.tsx`, `app/invoices/[id]/page.tsx` | Layout lembar invoice standar A4, kop surat bisnis dinamis, tombol cetak `window.print()` & download PDF | Visual & print CSS check |
| **ST-9** | `app/page.tsx`, `app/invoices/page.tsx`, `InvoiceFilterBar.tsx`, `InvoiceStatusBadge.tsx` | Dashboard ringkas metrik, daftar invoice dengan filter status (Draft/Sent/Paid) & unit bisnis | Navigation & query test |
| **ST-10** | `.env.example`, `README.md`, verifikasi menyeluruh | Finalisasi lint, typecheck, build produksi, sanitasi kode | `npx tsc --noEmit` & `npm run build` hijau |

---

## 6. Protokol Kepatuhan Gerbang 2

Sesuai aturan arsitektur:
- Rencana di atas melibatkan >3 file baru dan penetapan skema database PostgreSQL.
- Implementasi kode **DITAHAN** hingga pengguna menyetujui dokumen arsitektur ini.
- Setelah persetujuan diberikan, eksekusi akan berjalan langkah demi langkah (ST-1 s/d ST-10) dengan verifikasi ketat pada tiap langkah.

---

## 7. Arsitektur Modul Baru: Kalkulator HPP & Estimasi Harga Jual (Costing & Pricing Calculator)

### 7.1 Alur Data & State Flow
```text
[ Input Modal Proyek ] (Bahan Baku + Tenaga Kerja + Overhead + Qty Target)
        │
        ▼ (Pure Function: calculateCostingTotals)
[ Total HPP & Modal per Unit ]
        │
        ▼ (Simulasi Margin vs Markup)
[ 4 Tier Perbandingan Harga Jual ]
  ├── 1. Margin Tipis (20%)    -> Cocok untuk partai besar / rekanan
  ├── 2. Margin Standar (35%)  -> Harga pasar harian kompetitif
  ├── 3. Margin Ideal (50%)    -> Margin keuntungan optimal
  └── 4. Kustom (User Def.)    -> Input persentase atau nominal bebas
        │
        ▼ (1-Click Bridge via URL State / Session)
[ Redirect ke /invoices/new?business_id=...&item_desc=...&qty=...&price=... ]
        │
        ▼
[ Form Invoice Terisi Otomatis Siap Terbit ]
```

### 7.2 Struktur Berkas Tambahan (Feature-First)
```text
src/features/costing/
├── components/
│   ├── CostCalculator.tsx          # Komponen utama form kalkulator modal & tier harga
│   ├── CostItemList.tsx            # Baris dinamis input pos biaya modal (Material/Labor/Overhead)
│   └── PriceTierComparison.tsx     # Kartu perbandingan 4 skenario harga jual & laba kotor
├── services/
│   ├── costing-calculator.ts       # Logika kalkulasi murni (HPP, margin, markup, laba)
│   └── costing-presets.ts          # Template pos modal default per lini bisnis
└── types.ts                        # Definisi tipe CostItem, CostCategory, PriceTier, CalculationResult

```

---

## 9. Arsitektur Modul Manajemen Proyek (HPP Real) & Direktori Vendor

### 9.1 Diagram Relasi Data (ERD)
```text
┌─────────────────┐       ┌─────────────────┐
│   businesses    │       │     clients     │
└────────┬────────┘       └────────┬────────┘
         │ 1                       │ 1
         │                         │
         ├────────────────┐        │
         │ 1              │ 1      │ 0..1
         ▼                ▼        ▼
┌─────────────────┐     ┌─────────────────┐
│     vendors     │     │    projects     │◀─────┐ 0..1
└────────┬────────┘     └────────┬────────┘      │
         │ 1                     │ 1             │
         │                       │               │
         ▼ 0..*                  ▼ 1..*          │ (Bridge)
┌─────────────────┐     ┌─────────────────┐      │
│  vendor_costs   │     │  project_costs  │      │
│ (Tarif Katalog) │     │   (HPP Real)    │      │
└─────────────────┘     └─────────────────┘      │
                                                 │
                                ┌────────────────┴┐
                                │    invoices     │
                                └─────────────────┘
```

### 9.2 Perubahan Skema Database (`src/shared/db/schema.ts`)
1. **Tabel `vendors`:**
   - Menyimpan identitas vendor rekanan: Nama, Alamat, Kontak, Rating Kualitas (1-5), Catatan Reputasi/Kualitas, Kategori Spesialisasi.
2. **Pembaruan Tabel `vendor_costs`:**
   - Menambahkan kolom `vendorId` (foreign key ke `vendors.id` dengan `onDelete: 'set null'`) untuk mengaitkan item katalog ke profil vendor terstruktur.
3. **Tabel `projects`:**
   - Entitas mandiri pelacakan proyek:
     - `businessId`, `clientId` (opsional), `invoiceId` (opsional, tertaut jika sudah dibuat invoice).
     - `name`, `description`, `status` (`PLANNING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`).
     - `targetRevenue`: Target penawaran / omzet proyek (IDR integer).
     - `totalCost`: Total HPP Real proyek terakumulasi (IDR integer).
     - `grossProfit`: Laba kotor (`targetRevenue - totalCost`).
     - `profitMargin`: Persentase margin (`(grossProfit / targetRevenue) * 100`).
4. **Tabel `project_costs`:**
   - Pos pengeluaran modal riil per proyek:
     - `projectId`: Foreign key ke `projects.id` (`onDelete: 'cascade'`).
     - `vendorId`: Foreign key ke `vendors.id` (`onDelete: 'set null'`).
     - `vendorNameSnapshot`: Backup nama vendor saat input.
     - `itemName`, `category` (`vendor`, `material`, `labor`, `shipping`, `other`), `quantity`, `unit`, `unitCost`, `totalCost`.
     - `isPaidToVendor`: Status pelunasan modal ke vendor.
     - `notes`: Catatan khusus pengeluaran.

### 9.3 Rincian Struktur Direktori Modul Baru
```text
src/features/
├── vendors/
│   ├── components/
│   │   ├── VendorList.tsx           # Tabel & kartu vendor, filter rating
│   │   ├── VendorModal.tsx          # Form popup tambah/edit profil vendor
│   │   └── VendorRatingDisplay.tsx  # Komponen render bintang & badge reputasi
│   ├── services/
│   │   └── vendor.service.ts        # Query CRUD vendor & katalog tarif
│   └── types.ts                     # Definisi tipe DTO Vendor
│
├── projects/
│   ├── components/
│   │   ├── ProjectList.tsx          # Direktori proyek, filter status & perbandingan laba
│   │   ├── ProjectForm.tsx          # Form inisiasi/edit proyek & budget target
│   │   ├── ProjectDetailView.tsx    # Header KPI laba, ringkasan HPP, tombol buat invoice
│   │   ├── ProjectCostManager.tsx   # Kelola tabel HPP real proyek (tambah/hapus modal)
│   │   └── VendorItemPickerModal.tsx# Picker vendor cerdas (bandingkan harga, rating, alamat)
│   ├── services/
│   │   ├── project.service.ts       # CRUD proyek, agregasi HPP otomatis
│   │   └── project-bridge.service.ts# Logika konversi proyek menjadi draft invoice
│   └── types.ts                     # Definisi tipe DTO Proyek & Biaya Real

app/
├── vendors/
│   └── page.tsx                     # Halaman master direktori vendor
├── api/vendors/
│   ├── route.ts                     # GET list vendor & POST vendor baru
│   └── [id]/route.ts                # PUT update & DELETE vendor
├── projects/
│   ├── page.tsx                     # Halaman direktori seluruh proyek
│   ├── new/page.tsx                 # Form pembuatan proyek baru
│   └── [id]/page.tsx                # Halaman detail HPP real & laba proyek
└── api/projects/
    ├── route.ts                     # GET & POST project
    ├── [id]/route.ts                # GET, PUT, DELETE project
    ├── [id]/costs/route.ts          # POST & DELETE pos modal HPP real
    └── [id]/generate-invoice/route.ts # POST buat invoice dari data proyek
```

### 9.4 Pembaruan Navigasi & Integrasi Antar Modul
1. **Navbar (`src/shared/components/Navbar.tsx`):**
   - Menambahkan menu `Proyek` (`/projects`) dan `Vendor` (`/vendors`) berdampingan dengan `Invoice` dan `Klien`.
2. **Kalkulator HPP (`CostCalculator.tsx`):**
   - Menambahkan tombol aksi kedua: **"Simpan sebagai Proyek Baru"** di samping tombol "Buat Invoice", memungkinkan pengguna menyimpan draft simulasi langsung menjadi proyek dengan HPP real.
3. **Bridge Proyek ke Invoice:**
   - Saat tombol "Terbitkan Invoice" ditekan di detail proyek, endpoint membuat invoice baru dengan relasi `invoiceId`, mengisi item invoice dari proyek, dan menandai status proyek menjadi `COMPLETED` atau `INVOICED`.

### 9.5 Rencana Verifikasi Modul Proyek & Vendor
1. **Verifikasi Database & Migrasi:**
   - Generate Drizzle migration: `npx drizzle-kit generate`.
   - Push / apply migration ke Neon PostgreSQL.
   - Eksekusi query probe untuk memastikan fisik tabel `vendors`, `projects`, dan `project_costs` benar-benar tercipta di PostgreSQL.
2. **Unit Tests:**
   - Tes kalkulasi laba kotor & persentase margin proyek (termasuk kasus division by zero jika omzet = 0).
   - Tes relasi cascade delete dan snapshot saat vendor dihapus.
3. **Typecheck & Linter:**
   - `npx tsc --noEmit` wajib 0 error.
   - `npm run lint` wajib bersih.
4. **Build Check:**
   - `npm run build` sukses tanpa warning kritis.
