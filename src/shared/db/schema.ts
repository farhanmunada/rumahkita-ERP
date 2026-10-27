import { pgTable, serial, varchar, text, integer, numeric, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const businesses = pgTable('businesses', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  tagline: text('tagline'),
  invoicePrefix: varchar('invoice_prefix', { length: 20 }).notNull(),
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
  issueDate: varchar('issue_date', { length: 10 }).notNull(),
  dueDate: varchar('due_date', { length: 10 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('DRAFT'),
  subtotal: integer('subtotal').notNull().default(0),
  discountType: varchar('discount_type', { length: 20 }).default('fixed'),
  discountValue: integer('discount_value').default(0),
  taxPercent: integer('tax_percent').default(0),
  taxAmount: integer('tax_amount').default(0),
  totalAmount: integer('total_amount').notNull().default(0),
  downPayment: integer('down_payment').notNull().default(0),
  notes: text('notes'),
  terms: text('terms'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const invoiceItems = pgTable('invoice_items', {
  id: serial('id').primaryKey(),
  invoiceId: integer('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  itemType: varchar('item_type', { length: 20 }).notNull().default('service'),
  description: text('description').notNull(),
  quantity: numeric('quantity', { precision: 10, scale: 2 }).notNull().default('1'),
  unit: varchar('unit', { length: 50 }),
  unitPrice: integer('unit_price').notNull().default(0),
  totalPrice: integer('total_price').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const vendors = pgTable('vendors', {
  id: serial('id').primaryKey(),
  businessId: integer('business_id').references(() => businesses.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address'),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  rating: integer('rating').notNull().default(5), // 1 - 5 stars
  qualityNotes: text('quality_notes'),
  category: varchar('category', { length: 50 }).notNull().default('general'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const vendorCosts = pgTable('vendor_costs', {
  id: serial('id').primaryKey(),
  businessId: integer('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  vendorId: integer('vendor_id').references(() => vendors.id, { onDelete: 'set null' }),
  vendorName: varchar('vendor_name', { length: 255 }),
  itemName: varchar('item_name', { length: 255 }).notNull(),
  category: varchar('category', { length: 50 }).notNull().default('vendor'),
  unit: varchar('unit', { length: 50 }).notNull().default('pcs'),
  baseCost: integer('base_cost').notNull().default(0),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  businessId: integer('business_id').notNull().references(() => businesses.id),
  clientId: integer('client_id').references(() => clients.id, { onDelete: 'set null' }),
  invoiceId: integer('invoice_id').references(() => invoices.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 30 }).notNull().default('PLANNING'), // PLANNING, IN_PROGRESS, COMPLETED, CANCELLED
  targetRevenue: integer('target_revenue').notNull().default(0),
  totalCost: integer('total_cost').notNull().default(0),
  grossProfit: integer('gross_profit').notNull().default(0),
  profitMargin: numeric('profit_margin', { precision: 5, scale: 2 }).default('0'),
  startDate: varchar('start_date', { length: 10 }),
  endDate: varchar('end_date', { length: 10 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const projectCosts = pgTable('project_costs', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  vendorId: integer('vendor_id').references(() => vendors.id, { onDelete: 'set null' }),
  vendorNameSnapshot: varchar('vendor_name_snapshot', { length: 255 }),
  itemName: varchar('item_name', { length: 255 }).notNull(),
  category: varchar('category', { length: 50 }).notNull().default('vendor'),
  quantity: numeric('quantity', { precision: 10, scale: 2 }).notNull().default('1'),
  unit: varchar('unit', { length: 50 }),
  unitCost: integer('unit_cost').notNull().default(0),
  totalCost: integer('total_cost').notNull().default(0),
  isPaidToVendor: boolean('is_paid_to_vendor').notNull().default(false),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const businessesRelations = relations(businesses, ({ many }) => ({
  invoices: many(invoices),
  vendorCosts: many(vendorCosts),
  vendors: many(vendors),
  projects: many(projects),
}));

export const clientsRelations = relations(clients, ({ many }) => ({
  invoices: many(invoices),
  projects: many(projects),
}));

export const vendorsRelations = relations(vendors, ({ one, many }) => ({
  business: one(businesses, { fields: [vendors.businessId], references: [businesses.id] }),
  costs: many(vendorCosts),
  projectCosts: many(projectCosts),
}));

export const vendorCostsRelations = relations(vendorCosts, ({ one }) => ({
  business: one(businesses, { fields: [vendorCosts.businessId], references: [businesses.id] }),
  vendor: one(vendors, { fields: [vendorCosts.vendorId], references: [vendors.id] }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  business: one(businesses, { fields: [invoices.businessId], references: [businesses.id] }),
  client: one(clients, { fields: [invoices.clientId], references: [clients.id] }),
  items: many(invoiceItems),
  project: one(projects, { fields: [invoices.id], references: [projects.invoiceId] }),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, { fields: [invoiceItems.invoiceId], references: [invoices.id] }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  business: one(businesses, { fields: [projects.businessId], references: [businesses.id] }),
  client: one(clients, { fields: [projects.clientId], references: [clients.id] }),
  invoice: one(invoices, { fields: [projects.invoiceId], references: [invoices.id] }),
  costs: many(projectCosts),
}));

export const projectCostsRelations = relations(projectCosts, ({ one }) => ({
  project: one(projects, { fields: [projectCosts.projectId], references: [projects.id] }),
  vendor: one(vendors, { fields: [projectCosts.vendorId], references: [vendors.id] }),
}));

export type Business = typeof businesses.$inferSelect;
export type NewBusiness = typeof businesses.$inferInsert;

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;

export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type NewInvoiceItem = typeof invoiceItems.$inferInsert;

export type Vendor = typeof vendors.$inferSelect;
export type NewVendor = typeof vendors.$inferInsert;

export type VendorCost = typeof vendorCosts.$inferSelect;
export type NewVendorCost = typeof vendorCosts.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type ProjectCost = typeof projectCosts.$inferSelect;
export type NewProjectCost = typeof projectCosts.$inferInsert;
