import {
  users,
  businesses,
  clients,
  categories,
  products,
  expenseCategories,
  expenses,
  invoices,
  invoiceItems,
  invoiceTemplates,
  type User,
  type Business,
  type Client,
  type Category,
  type Product,
  type ExpenseCategory,
  type Expense,
  type Invoice,
  type InvoiceItem,
  type InvoiceTemplate,
  type UpsertUser,
  type InsertBusiness,
  type InsertClient,
  type InsertCategory,
  type InsertProduct,
  type InsertExpenseCategory,
  type InsertExpense,
  type InsertInvoice,
  type InsertInvoiceItem,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, like, ilike, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserPreferences(id: string, preferences: { defaultCurrency: string, dateFormat: string }): Promise<User>;

  // Business operations
  getBusinesses(userId: string): Promise<Business[]>;
  getBusiness(id: number): Promise<Business | undefined>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  updateBusiness(id: number, business: Partial<InsertBusiness>): Promise<Business | undefined>;
  deleteBusiness(id: number): Promise<boolean>;

  // Client operations
  getClients(userId: string, search?: string): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;

  // Category operations
  getCategories(userId: string): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;

  // Product operations
  getProducts(userId: string, params?: { isActive?: boolean, categoryId?: number, search?: string }): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Expense category operations
  getExpenseCategories(userId: string): Promise<ExpenseCategory[]>;
  getExpenseCategory(id: number): Promise<ExpenseCategory | undefined>;
  createExpenseCategory(category: InsertExpenseCategory): Promise<ExpenseCategory>;
  updateExpenseCategory(id: number, category: Partial<InsertExpenseCategory>): Promise<ExpenseCategory | undefined>;
  deleteExpenseCategory(id: number): Promise<boolean>;

  // Expense operations
  getExpenses(userId: string, params?: { startDate?: Date; endDate?: Date; categoryId?: number; businessId?: number }): Promise<Expense[]>;
  getExpense(id: number): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: number): Promise<boolean>;

  // Invoice operations
  getInvoices(userId: string, params?: { status?: string; clientId?: number; businessId?: number; startDate?: Date; endDate?: Date }): Promise<Invoice[]>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  getInvoiceWithItems(id: number): Promise<{ invoice: Invoice; items: InvoiceItem[] } | undefined>;
  createInvoice(invoice: InsertInvoice, items: InsertInvoiceItem[]): Promise<{ invoice: Invoice; items: InvoiceItem[] }>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  updateInvoiceStatus(id: number, status: string): Promise<Invoice | undefined>;
  deleteInvoice(id: number): Promise<boolean>;

  // Invoice item operations
  getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]>;
  createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem>;
  updateInvoiceItem(id: number, item: Partial<InsertInvoiceItem>): Promise<InvoiceItem | undefined>;
  deleteInvoiceItem(id: number): Promise<boolean>;

  // Invoice template operations
  getInvoiceTemplates(): Promise<InvoiceTemplate[]>;
  getInvoiceTemplate(id: number): Promise<InvoiceTemplate | undefined>;

  // Dashboard operations
  getDashboardStats(userId: string): Promise<{
    totalInvoices: number;
    totalRevenue: number;
    unpaidAmount: number;
    activeClients: number;
    recentInvoices: any[];
    monthlyRevenue: any[];
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, username));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserPreferences(id: string, preferences: { defaultCurrency: string, dateFormat: string }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        preferences: preferences,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Business operations
  async getBusinesses(userId: string): Promise<Business[]> {
    return await db.select().from(businesses).where(eq(businesses.userId, userId)).orderBy(businesses.name);
  }

  async getBusiness(id: number): Promise<Business | undefined> {
    const [business] = await db.select().from(businesses).where(eq(businesses.id, id));
    return business;
  }

  async createBusiness(business: InsertBusiness): Promise<Business> {
    const [newBusiness] = await db.insert(businesses).values(business).returning();
    return newBusiness;
  }

  async updateBusiness(id: number, business: Partial<InsertBusiness>): Promise<Business | undefined> {
    const [updatedBusiness] = await db
      .update(businesses)
      .set({ ...business, updatedAt: new Date() })
      .where(eq(businesses.id, id))
      .returning();
    return updatedBusiness;
  }

  async deleteBusiness(id: number): Promise<boolean> {
    const result = await db.delete(businesses).where(eq(businesses.id, id));
    return result.rowCount > 0;
  }

  // Client operations
  async getClients(userId: string, search?: string): Promise<Client[]> {
    let query = db.select().from(clients).where(eq(clients.userId, userId));
    
    if (search) {
      query = query.where(
        sql`(${clients.name} ILIKE ${`%${search}%`} OR ${clients.email} ILIKE ${`%${search}%`})`
      );
    }
    
    return await query.orderBy(clients.name);
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db.insert(clients).values(client).returning();
    return newClient;
  }

  async updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined> {
    const [updatedClient] = await db
      .update(clients)
      .set({ ...client, updatedAt: new Date() })
      .where(eq(clients.id, id))
      .returning();
    return updatedClient;
  }

  async deleteClient(id: number): Promise<boolean> {
    const result = await db.delete(clients).where(eq(clients.id, id));
    return result.rowCount > 0;
  }

  // Category operations
  async getCategories(userId: string): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.userId, userId)).orderBy(categories.name);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updatedCategory] = await db
      .update(categories)
      .set({ ...category, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return result.rowCount > 0;
  }

  // Product operations
  async getProducts(userId: string, params?: { isActive?: boolean, categoryId?: number, search?: string }): Promise<Product[]> {
    let query = db.select().from(products).where(eq(products.userId, userId));
    
    if (params) {
      if (params.isActive !== undefined) {
        query = query.where(eq(products.isActive, params.isActive));
      }
      
      if (params.categoryId) {
        query = query.where(eq(products.categoryId, params.categoryId));
      }
      
      if (params.search) {
        query = query.where(
          sql`(${products.name} ILIKE ${`%${params.search}%`} OR ${products.description} ILIKE ${`%${params.search}%`})`
        );
      }
    }
    
    return await query.orderBy(products.name);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount > 0;
  }

  // Expense category operations
  async getExpenseCategories(userId: string): Promise<ExpenseCategory[]> {
    return await db.select().from(expenseCategories).where(eq(expenseCategories.userId, userId)).orderBy(expenseCategories.name);
  }

  async getExpenseCategory(id: number): Promise<ExpenseCategory | undefined> {
    const [category] = await db.select().from(expenseCategories).where(eq(expenseCategories.id, id));
    return category;
  }

  async createExpenseCategory(category: InsertExpenseCategory): Promise<ExpenseCategory> {
    const [newCategory] = await db.insert(expenseCategories).values(category).returning();
    return newCategory;
  }

  async updateExpenseCategory(id: number, category: Partial<InsertExpenseCategory>): Promise<ExpenseCategory | undefined> {
    const [updatedCategory] = await db
      .update(expenseCategories)
      .set({ ...category, updatedAt: new Date() })
      .where(eq(expenseCategories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteExpenseCategory(id: number): Promise<boolean> {
    const result = await db.delete(expenseCategories).where(eq(expenseCategories.id, id));
    return result.rowCount > 0;
  }

  // Expense operations
  async getExpenses(userId: string, params?: { startDate?: Date; endDate?: Date; categoryId?: number; businessId?: number }): Promise<Expense[]> {
    let query = db.select().from(expenses).where(eq(expenses.userId, userId));
    
    if (params) {
      if (params.startDate) {
        query = query.where(gte(expenses.date, params.startDate));
      }
      
      if (params.endDate) {
        query = query.where(lte(expenses.date, params.endDate));
      }
      
      if (params.categoryId) {
        query = query.where(eq(expenses.categoryId, params.categoryId));
      }
      
      if (params.businessId) {
        query = query.where(eq(expenses.businessId, params.businessId));
      }
    }
    
    return await query.orderBy(desc(expenses.date));
  }

  async getExpense(id: number): Promise<Expense | undefined> {
    const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
    return expense;
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const [newExpense] = await db.insert(expenses).values(expense).returning();
    return newExpense;
  }

  async updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined> {
    const [updatedExpense] = await db
      .update(expenses)
      .set({ ...expense, updatedAt: new Date() })
      .where(eq(expenses.id, id))
      .returning();
    return updatedExpense;
  }

  async deleteExpense(id: number): Promise<boolean> {
    const result = await db.delete(expenses).where(eq(expenses.id, id));
    return result.rowCount > 0;
  }

  // Invoice operations
  async getInvoices(userId: string, params?: { status?: string; clientId?: number; businessId?: number; startDate?: Date; endDate?: Date }): Promise<Invoice[]> {
    let query = db.select().from(invoices).where(eq(invoices.userId, userId));
    
    if (params) {
      if (params.status) {
        query = query.where(eq(invoices.status, params.status));
      }
      
      if (params.clientId) {
        query = query.where(eq(invoices.clientId, params.clientId));
      }
      
      if (params.businessId) {
        query = query.where(eq(invoices.businessId, params.businessId));
      }
      
      if (params.startDate) {
        query = query.where(gte(invoices.issueDate, params.startDate));
      }
      
      if (params.endDate) {
        query = query.where(lte(invoices.issueDate, params.endDate));
      }
    }
    
    return await query.orderBy(desc(invoices.issueDate));
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }

  async getInvoiceWithItems(id: number): Promise<{ invoice: Invoice; items: InvoiceItem[] } | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    
    if (!invoice) {
      return undefined;
    }
    
    const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, id));
    
    return {
      invoice,
      items,
    };
  }

  async createInvoice(invoice: InsertInvoice, items: InsertInvoiceItem[]): Promise<{ invoice: Invoice; items: InvoiceItem[] }> {
    // Create the invoice first
    const [newInvoice] = await db.insert(invoices).values(invoice).returning();
    
    // Then create all invoice items with the invoice ID
    const invoiceItems = await Promise.all(
      items.map(item => 
        db.insert(invoiceItems)
          .values({ ...item, invoiceId: newInvoice.id })
          .returning()
          .then(result => result[0])
      )
    );
    
    return {
      invoice: newInvoice,
      items: invoiceItems,
    };
  }

  async updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const [updatedInvoice] = await db
      .update(invoices)
      .set({ ...invoice, updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning();
    return updatedInvoice;
  }

  async updateInvoiceStatus(id: number, status: string): Promise<Invoice | undefined> {
    const [updatedInvoice] = await db
      .update(invoices)
      .set({ status, updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning();
    return updatedInvoice;
  }

  async deleteInvoice(id: number): Promise<boolean> {
    // Delete invoice items first
    await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));
    
    // Then delete the invoice
    const result = await db.delete(invoices).where(eq(invoices.id, id));
    return result.rowCount > 0;
  }

  // Invoice item operations
  async getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]> {
    return await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
  }

  async createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem> {
    const [newItem] = await db.insert(invoiceItems).values(item).returning();
    return newItem;
  }

  async updateInvoiceItem(id: number, item: Partial<InsertInvoiceItem>): Promise<InvoiceItem | undefined> {
    const [updatedItem] = await db
      .update(invoiceItems)
      .set(item)
      .where(eq(invoiceItems.id, id))
      .returning();
    return updatedItem;
  }

  async deleteInvoiceItem(id: number): Promise<boolean> {
    const result = await db.delete(invoiceItems).where(eq(invoiceItems.id, id));
    return result.rowCount > 0;
  }

  // Invoice template operations
  async getInvoiceTemplates(): Promise<InvoiceTemplate[]> {
    return await db.select().from(invoiceTemplates);
  }

  async getInvoiceTemplate(id: number): Promise<InvoiceTemplate | undefined> {
    const [template] = await db.select().from(invoiceTemplates).where(eq(invoiceTemplates.id, id));
    return template;
  }

  // Dashboard operations
  async getDashboardStats(userId: string): Promise<{
    totalInvoices: number;
    totalRevenue: number;
    unpaidAmount: number;
    activeClients: number;
    recentInvoices: any[];
    monthlyRevenue: any[];
  }> {
    // Get total invoices
    const [invoiceCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(invoices)
      .where(eq(invoices.userId, userId));
    
    // Get total revenue
    const [revenue] = await db
      .select({ sum: sql<number>`sum(total)` })
      .from(invoices)
      .where(and(eq(invoices.userId, userId), eq(invoices.status, 'paid')));
    
    // Get unpaid amount
    const [unpaid] = await db
      .select({ sum: sql<number>`sum(total)` })
      .from(invoices)
      .where(and(
        eq(invoices.userId, userId),
        sql`status in ('draft', 'sent', 'overdue')`
      ));
    
    // Get active clients
    const [clientCount] = await db
      .select({ count: sql<number>`count(distinct client_id)` })
      .from(invoices)
      .where(and(
        eq(invoices.userId, userId),
        sql`issue_date > now() - interval '3 months'`
      ));
    
    // Get recent invoices with client names
    const recentInvoices = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        clientId: invoices.clientId,
        clientName: clients.name,
        total: invoices.total,
        status: invoices.status,
        issueDate: invoices.issueDate,
        currency: invoices.currency,
      })
      .from(invoices)
      .innerJoin(clients, eq(invoices.clientId, clients.id))
      .where(eq(invoices.userId, userId))
      .orderBy(desc(invoices.issueDate))
      .limit(5);
    
    // Get monthly revenue for the past 6 months
    const monthlyRevenue = await db
      .execute(sql`
        SELECT 
          date_trunc('month', issue_date) as month,
          SUM(CASE WHEN status = 'paid' THEN total ELSE 0 END) as revenue,
          SUM(CASE WHEN e.id IS NOT NULL THEN e.amount ELSE 0 END) as expenses
        FROM invoices i
        LEFT JOIN expenses e ON date_trunc('month', i.issue_date) = date_trunc('month', e.date) AND i.user_id = e.user_id
        WHERE i.user_id = ${userId}
        AND i.issue_date >= now() - interval '6 months'
        GROUP BY date_trunc('month', issue_date)
        ORDER BY month ASC
      `);
    
    return {
      totalInvoices: invoiceCount?.count || 0,
      totalRevenue: revenue?.sum || 0,
      unpaidAmount: unpaid?.sum || 0,
      activeClients: clientCount?.count || 0,
      recentInvoices,
      monthlyRevenue,
    };
  }
}

export const storage = new DatabaseStorage();
