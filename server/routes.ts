import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertBusinessSchema, 
  insertClientSchema, 
  insertCategorySchema, 
  insertProductSchema,
  insertExpenseCategorySchema,
  insertExpenseSchema,
  insertInvoiceSchema,
  insertInvoiceItemSchema
} from "@shared/schema";
import multer from "multer";
import { z } from "zod";

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });

  // Business routes
  app.get('/api/businesses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const businesses = await storage.getBusinesses(userId);
      res.json(businesses);
    } catch (error) {
      console.error("Error fetching businesses:", error);
      res.status(500).json({ message: "Failed to fetch businesses" });
    }
  });

  app.get('/api/businesses/:id', isAuthenticated, async (req: any, res) => {
    try {
      const business = await storage.getBusiness(parseInt(req.params.id));
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      if (business.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      res.json(business);
    } catch (error) {
      console.error("Error fetching business:", error);
      res.status(500).json({ message: "Failed to fetch business" });
    }
  });

  app.post('/api/businesses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertBusinessSchema.parse({
        ...req.body,
        userId
      });
      const business = await storage.createBusiness(validatedData);
      res.status(201).json(business);
    } catch (error) {
      console.error("Error creating business:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create business" });
    }
  });

  app.put('/api/businesses/:id', isAuthenticated, async (req: any, res) => {
    try {
      const businessId = parseInt(req.params.id);
      const business = await storage.getBusiness(businessId);
      
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      
      if (business.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const data = { ...req.body };
      delete data.id;
      delete data.userId;
      
      const updatedBusiness = await storage.updateBusiness(businessId, data);
      res.json(updatedBusiness);
    } catch (error) {
      console.error("Error updating business:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update business" });
    }
  });

  app.delete('/api/businesses/:id', isAuthenticated, async (req: any, res) => {
    try {
      const businessId = parseInt(req.params.id);
      const business = await storage.getBusiness(businessId);
      
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      
      if (business.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await storage.deleteBusiness(businessId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting business:", error);
      res.status(500).json({ message: "Failed to delete business" });
    }
  });

  // Business logo upload
  app.post('/api/businesses/:id/logo', isAuthenticated, upload.single('logo'), async (req: any, res) => {
    try {
      const businessId = parseInt(req.params.id);
      const business = await storage.getBusiness(businessId);
      
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      
      if (business.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Convert file to base64 for storage
      const logo = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      
      const updatedBusiness = await storage.updateBusiness(businessId, { logo });
      res.json(updatedBusiness);
    } catch (error) {
      console.error("Error uploading logo:", error);
      res.status(500).json({ message: "Failed to upload logo" });
    }
  });

  // Client routes
  app.get('/api/clients', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const search = req.query.search as string | undefined;
      const clients = await storage.getClients(userId, search);
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get('/api/clients/:id', isAuthenticated, async (req: any, res) => {
    try {
      const client = await storage.getClient(parseInt(req.params.id));
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      if (client.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post('/api/clients', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertClientSchema.parse({
        ...req.body,
        userId
      });
      const client = await storage.createClient(validatedData);
      res.status(201).json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  app.put('/api/clients/:id', isAuthenticated, async (req: any, res) => {
    try {
      const clientId = parseInt(req.params.id);
      const client = await storage.getClient(clientId);
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      if (client.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const data = { ...req.body };
      delete data.id;
      delete data.userId;
      
      const updatedClient = await storage.updateClient(clientId, data);
      res.json(updatedClient);
    } catch (error) {
      console.error("Error updating client:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  app.delete('/api/clients/:id', isAuthenticated, async (req: any, res) => {
    try {
      const clientId = parseInt(req.params.id);
      const client = await storage.getClient(clientId);
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      if (client.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await storage.deleteClient(clientId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Category routes
  app.get('/api/categories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const categories = await storage.getCategories(userId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post('/api/categories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertCategorySchema.parse({
        ...req.body,
        userId
      });
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Product routes
  app.get('/api/products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const params = {
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
        categoryId: req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined,
        search: req.query.search as string | undefined
      };
      
      const products = await storage.getProducts(userId, params);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const product = await storage.getProduct(parseInt(req.params.id));
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      if (product.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post('/api/products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertProductSchema.parse({
        ...req.body,
        userId
      });
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      if (product.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const data = { ...req.body };
      delete data.id;
      delete data.userId;
      
      const updatedProduct = await storage.updateProduct(productId, data);
      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      if (product.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await storage.deleteProduct(productId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Expense Category routes
  app.get('/api/expense-categories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const categories = await storage.getExpenseCategories(userId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching expense categories:", error);
      res.status(500).json({ message: "Failed to fetch expense categories" });
    }
  });

  app.post('/api/expense-categories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertExpenseCategorySchema.parse({
        ...req.body,
        userId
      });
      const category = await storage.createExpenseCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating expense category:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create expense category" });
    }
  });

  // Expense routes
  app.get('/api/expenses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const params = {
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        categoryId: req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined,
        businessId: req.query.businessId ? parseInt(req.query.businessId as string) : undefined
      };
      
      const expenses = await storage.getExpenses(userId, params);
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.post('/api/expenses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertExpenseSchema.parse({
        ...req.body,
        userId,
        date: new Date(req.body.date)
      });
      const expense = await storage.createExpense(validatedData);
      res.status(201).json(expense);
    } catch (error) {
      console.error("Error creating expense:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create expense" });
    }
  });

  app.put('/api/expenses/:id', isAuthenticated, async (req: any, res) => {
    try {
      const expenseId = parseInt(req.params.id);
      const expense = await storage.getExpense(expenseId);
      
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      if (expense.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const data = { ...req.body };
      if (data.date) {
        data.date = new Date(data.date);
      }
      delete data.id;
      delete data.userId;
      
      const updatedExpense = await storage.updateExpense(expenseId, data);
      res.json(updatedExpense);
    } catch (error) {
      console.error("Error updating expense:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update expense" });
    }
  });

  // Invoice routes
  app.get('/api/invoices', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const params = {
        status: req.query.status as string | undefined,
        clientId: req.query.clientId ? parseInt(req.query.clientId as string) : undefined,
        businessId: req.query.businessId ? parseInt(req.query.businessId as string) : undefined,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined
      };
      
      const invoices = await storage.getInvoices(userId, params);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get('/api/invoices/:id', isAuthenticated, async (req: any, res) => {
    try {
      const invoiceData = await storage.getInvoiceWithItems(parseInt(req.params.id));
      
      if (!invoiceData) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      if (invoiceData.invoice.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      res.json(invoiceData);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  app.post('/api/invoices', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate invoice data
      const { items, ...invoiceData } = req.body;
      
      const validatedInvoice = insertInvoiceSchema.parse({
        ...invoiceData,
        userId,
        issueDate: new Date(invoiceData.issueDate),
        dueDate: new Date(invoiceData.dueDate)
      });
      
      // Validate invoice items
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Invoice must have at least one item" });
      }
      
      const validatedItems = items.map(item => 
        insertInvoiceItemSchema.parse(item)
      );
      
      const invoice = await storage.createInvoice(validatedInvoice, validatedItems);
      res.status(201).json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  app.put('/api/invoices/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const invoice = await storage.getInvoice(invoiceId);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      if (invoice.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const { status } = req.body;
      
      if (!['draft', 'sent', 'paid', 'overdue', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedInvoice = await storage.updateInvoiceStatus(invoiceId, status);
      res.json(updatedInvoice);
    } catch (error) {
      console.error("Error updating invoice status:", error);
      res.status(500).json({ message: "Failed to update invoice status" });
    }
  });

  // Get invoice templates
  app.get('/api/invoice-templates', isAuthenticated, async (req, res) => {
    try {
      const templates = await storage.getInvoiceTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching invoice templates:", error);
      res.status(500).json({ message: "Failed to fetch invoice templates" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
