import { Project, ProjectCost, Client, Invoice, Business } from '@/shared/db/schema';

export type ProjectDTO = Project;
export type ProjectCostDTO = ProjectCost;

export interface ProjectWithDetails extends Project {
  client?: Client | null;
  invoice?: Invoice | null;
  business?: Business | null;
  costs?: ProjectCost[];
}

export interface CreateProjectInput {
  businessId: number;
  clientId?: number | null;
  name: string;
  description?: string | null;
  status?: string;
  targetRevenue: number;
  startDate?: string | null;
  endDate?: string | null;
}

export interface CreateProjectCostInput {
  projectId: number;
  vendorId?: number | null;
  vendorNameSnapshot?: string | null;
  itemName: string;
  category?: string;
  quantity?: number;
  unit?: string | null;
  unitCost: number;
  totalCost?: number;
  notes?: string | null;
}

export interface ProjectFinancialSummary {
  targetRevenue: number;
  totalCost: number;
  grossProfit: number;
  profitMargin: string;
}
