import { eq, desc } from 'drizzle-orm';
import { db } from '@/shared/db/client';
import {
  projects,
  projectCosts,
  invoices,
  invoiceItems,
  businesses,
  clients,
  type Project,
  type NewProject,
  type ProjectCost,
  type NewProjectCost,
} from '@/shared/db/schema';
import { ProjectFinancialSummary, ProjectWithDetails } from '../types';
import { generateInvoiceNumber } from '@/features/invoices/services/invoice-number.service';
import { getDefaultDueDateString, getTodayDateString } from '@/shared/lib/date';

export function calculateProjectFinancials(
  targetRevenue: number,
  costs: Array<{ totalCost: number }>
): ProjectFinancialSummary {
  const safeRevenue = Math.max(0, Math.round(targetRevenue));
  const totalCost = costs.reduce((acc, c) => acc + Math.max(0, Math.round(c.totalCost || 0)), 0);
  const grossProfit = safeRevenue - totalCost;
  const marginNum = safeRevenue > 0 ? (grossProfit / safeRevenue) * 100 : 0;
  const profitMargin = marginNum.toFixed(2);

  return {
    targetRevenue: safeRevenue,
    totalCost,
    grossProfit,
    profitMargin,
  };
}

export async function getProjects(businessId?: number): Promise<ProjectWithDetails[]> {
  const query = db
    .select()
    .from(projects)
    .orderBy(desc(projects.id));

  if (businessId) {
    query.where(eq(projects.businessId, businessId));
  }

  const projectList = await query;

  // Enrich with client & costs summary
  const enriched: ProjectWithDetails[] = await Promise.all(
    projectList.map(async (p) => {
      let client = null;
      if (p.clientId) {
        const [foundClient] = await db
          .select()
          .from(clients)
          .where(eq(clients.id, p.clientId))
          .limit(1);
        client = foundClient || null;
      }

      let invoice = null;
      if (p.invoiceId) {
        const [foundInvoice] = await db
          .select()
          .from(invoices)
          .where(eq(invoices.id, p.invoiceId))
          .limit(1);
        invoice = foundInvoice || null;
      }

      const costs = await db
        .select()
        .from(projectCosts)
        .where(eq(projectCosts.projectId, p.id))
        .orderBy(desc(projectCosts.id));

      return {
        ...p,
        client,
        invoice,
        costs,
      };
    })
  );

  return enriched;
}

export async function getProjectById(id: number): Promise<ProjectWithDetails | null> {
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);

  if (!project) return null;

  let client = null;
  if (project.clientId) {
    const [foundClient] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, project.clientId))
      .limit(1);
    client = foundClient || null;
  }

  let business = null;
  if (project.businessId) {
    const [foundBusiness] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, project.businessId))
      .limit(1);
    business = foundBusiness || null;
  }

  let invoice = null;
  if (project.invoiceId) {
    const [foundInvoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, project.invoiceId))
      .limit(1);
    invoice = foundInvoice || null;
  }

  const costs = await db
    .select()
    .from(projectCosts)
    .where(eq(projectCosts.projectId, project.id))
    .orderBy(desc(projectCosts.id));

  return {
    ...project,
    client,
    business,
    invoice,
    costs,
  };
}

export async function createProject(data: NewProject): Promise<Project> {
  const [created] = await db.insert(projects).values(data).returning();
  return created;
}

export async function updateProject(
  id: number,
  data: Partial<NewProject>
): Promise<Project | null> {
  const [updated] = await db
    .update(projects)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id))
    .returning();

  return updated || null;
}

export async function deleteProject(id: number): Promise<boolean> {
  const result = await db.delete(projects).where(eq(projects.id, id)).returning();
  return result.length > 0;
}

export async function recalculateProjectTotals(projectId: number): Promise<Project | null> {
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project) return null;

  const costs = await db
    .select()
    .from(projectCosts)
    .where(eq(projectCosts.projectId, projectId));

  const financials = calculateProjectFinancials(project.targetRevenue, costs);

  const [updated] = await db
    .update(projects)
    .set({
      totalCost: financials.totalCost,
      grossProfit: financials.grossProfit,
      profitMargin: financials.profitMargin,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId))
    .returning();

  return updated || null;
}

export async function addProjectCost(data: NewProjectCost): Promise<ProjectCost> {
  const [created] = await db.insert(projectCosts).values(data).returning();
  await recalculateProjectTotals(data.projectId);
  return created;
}

export async function deleteProjectCost(costId: number): Promise<boolean> {
  const [deleted] = await db
    .delete(projectCosts)
    .where(eq(projectCosts.id, costId))
    .returning();

  if (deleted) {
    await recalculateProjectTotals(deleted.projectId);
    return true;
  }
  return false;
}

export async function updateProjectCost(
  costId: number,
  data: Partial<NewProjectCost>
): Promise<ProjectCost | null> {
  const [updated] = await db
    .update(projectCosts)
    .set(data)
    .where(eq(projectCosts.id, costId))
    .returning();

  if (updated) {
    await recalculateProjectTotals(updated.projectId);
    return updated;
  }
  return null;
}

export async function bridgeProjectToInvoice(
  projectId: number,
  dueDateDays: number = 14
): Promise<{ invoiceId: number; invoiceNumber: string }> {
  const project = await getProjectById(projectId);
  if (!project) {
    throw new Error('Proyek tidak ditemukan');
  }

  if (project.invoiceId) {
    const [existing] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, project.invoiceId))
      .limit(1);
    if (existing) {
      return { invoiceId: existing.id, invoiceNumber: existing.invoiceNumber };
    }
  }

  if (!project.clientId) {
    throw new Error('Proyek belum memiliki klien terhubung. Tentukan klien terlebih dahulu.');
  }

  const issueDate = getTodayDateString();
  const invoiceNumber = await generateInvoiceNumber(project.businessId, issueDate);
  const dueDate = getDefaultDueDateString(dueDateDays);

  const [newInvoice] = await db
    .insert(invoices)
    .values({
      businessId: project.businessId,
      clientId: project.clientId,
      invoiceNumber,
      issueDate,
      dueDate,
      status: 'DRAFT',
      subtotal: project.targetRevenue,
      totalAmount: project.targetRevenue,
      downPayment: 0,
      notes: `Invoice diterbitkan dari proyek: ${project.name}`,
    })
    .returning();

  // Insert default item from project name
  await db.insert(invoiceItems).values({
    invoiceId: newInvoice.id,
    itemType: 'service',
    description: project.name,
    quantity: '1',
    unit: 'paket',
    unitPrice: project.targetRevenue,
    totalPrice: project.targetRevenue,
  });

  // Link invoice back to project
  await db
    .update(projects)
    .set({
      invoiceId: newInvoice.id,
      status: 'COMPLETED',
      updatedAt: new Date(),
    })
    .where(eq(projects.id, project.id));

  return { invoiceId: newInvoice.id, invoiceNumber: newInvoice.invoiceNumber };
}
