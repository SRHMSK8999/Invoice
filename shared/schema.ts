import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
  serial,
  boolean,
  doublePrecision,
  date,
  primaryKey,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Business profiles
export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  logo: text("logo"),
  taxNumber: varchar("tax_number", { length: 100 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  defaultCurrency: varchar("default_currency", { length: 10 }).default("USD"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Clients
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  taxNumber: varchar("tax_number", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Product/Service categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Products/Services
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  mrp: doublePrecision("mrp").notNull(), // Manufacturer's recommended price
  price: doublePrecision("price").notNull(), // Actual selling price
  categoryId: integer("category_id").references(() => categories.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Expense categories
export const expenseCategories = pgTable("expense_categories", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Expenses
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  businessId: integer("business_id").references(() => businesses.id),
  categoryId: integer("category_id").references(() => expenseCategories.id),
  amount: doublePrecision("amount").notNull(),
  currency: varchar("currency", { length: 10 }).default("USD"),
  description: text("description"),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invoices
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull(),
  businessId: integer("business_id")
    .references(() => businesses.id)
    .notNull(),
  clientId: integer("client_id")
    .references(() => clients.id)
    .notNull(),
  issueDate: date("issue_date").notNull(),
  dueDate: date("due_date").notNull(),
  currency: varchar("currency", { length: 10 }).default("USD"),
  subtotal: doublePrecision("subtotal").notNull(),
  taxRate: doublePrecision("tax_rate").default(0),
  taxAmount: doublePrecision("tax_amount").default(0),
  discount: doublePrecision("discount").default(0),
  total: doublePrecision("total").notNull(),
  notes: text("notes"),
  status: varchar("status", { length: 20 }).default("draft"), // draft, sent, paid, overdue, cancelled
  templateId: integer("template_id").default(1), // Default template
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invoice items/products
export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id")
    .references(() => invoices.id, { onDelete: "cascade" })
    .notNull(),
  productId: integer("product_id").references(() => products.id),
  description: varchar("description", { length: 255 }).notNull(),
  quantity: doublePrecision("quantity").notNull(),
  unitPrice: doublePrecision("unit_price").notNull(),
  amount: doublePrecision("amount").notNull(),
});

// Invoice templates
export const invoiceTemplates = pgTable("invoice_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  configuration: jsonb("configuration").notNull(),
  isDefault: boolean("is_default").default(false),
  isSystem: boolean("is_system").default(true), // System templates vs custom templates
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define relationships between tables
export const businessRelations = {
  user: (business: any) => users,
  invoices: (business: any) => invoices,
};

export const clientRelations = {
  user: (client: any) => users,
  invoices: (client: any) => invoices,
};

export const productRelations = {
  user: (product: any) => users,
  category: (product: any) => categories,
  invoiceItems: (product: any) => invoiceItems,
};

export const expenseRelations = {
  user: (expense: any) => users,
  business: (expense: any) => businesses,
  category: (expense: any) => expenseCategories,
};

export const invoiceRelations = {
  user: (invoice: any) => users,
  business: (invoice: any) => businesses,
  client: (invoice: any) => clients,
  items: (invoice: any) => invoiceItems,
  template: (invoice: any) => invoiceTemplates,
};

// Zod schemas for insert operations
export const upsertUserSchema = createInsertSchema(users);
export const insertBusinessSchema = createInsertSchema(businesses, {
  name: z.string().min(1, "Business name is required"),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertClientSchema = createInsertSchema(clients, {
  name: z.string().min(1, "Client name is required"),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertCategorySchema = createInsertSchema(categories, {
  name: z.string().min(1, "Category name is required"),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertProductSchema = createInsertSchema(products, {
  name: z.string().min(1, "Product name is required"),
  mrp: z.number().min(0, "MRP must be non-negative"),
  price: z.number().min(0, "Price must be non-negative"),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertExpenseCategorySchema = createInsertSchema(expenseCategories, {
  name: z.string().min(1, "Category name is required"),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertExpenseSchema = createInsertSchema(expenses, {
  amount: z.number().min(0, "Amount must be non-negative"),
  date: z.date(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertInvoiceSchema = createInsertSchema(invoices, {
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  issueDate: z.date(),
  dueDate: z.date(),
  subtotal: z.number().min(0),
  total: z.number().min(0),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertInvoiceItemSchema = createInsertSchema(invoiceItems, {
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  unitPrice: z.number().min(0, "Unit price must be non-negative"),
  amount: z.number().min(0, "Amount must be non-negative"),
}).omit({ id: true });

// Type definitions for insert operations
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertExpenseCategory = z.infer<typeof insertExpenseCategorySchema>;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;

// Type definitions for select operations
export type User = typeof users.$inferSelect;
export type Business = typeof businesses.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ExpenseCategory = typeof expenseCategories.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InvoiceTemplate = typeof invoiceTemplates.$inferSelect;
