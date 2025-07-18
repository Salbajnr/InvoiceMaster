import { 
  clients, 
  invoices, 
  lineItems,
  users,
  type Client, 
  type InsertClient,
  type Invoice,
  type InsertInvoice,
  type LineItem,
  type InsertLineItem,
  type InvoiceWithDetails,
  type User,
  type UpsertUser
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Clients
  getClient(id: number): Promise<Client | undefined>;
  getClients(): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;

  // Invoices
  getInvoice(id: number): Promise<InvoiceWithDetails | undefined>;
  getInvoices(): Promise<InvoiceWithDetails[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: number): Promise<boolean>;
  generateInvoiceNumber(): Promise<string>;

  // Line Items
  getLineItems(invoiceId: number): Promise<LineItem[]>;
  createLineItem(lineItem: InsertLineItem): Promise<LineItem>;
  updateLineItem(id: number, lineItem: Partial<InsertLineItem>): Promise<LineItem | undefined>;
  deleteLineItem(id: number): Promise<boolean>;
  deleteLineItemsByInvoice(invoiceId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
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

  // Clients and other methods will remain as database operations
  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async getClients(): Promise<Client[]> {
    return await db.select().from(clients);
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db.insert(clients).values(insertClient).returning();
    return client;
  }

  async updateClient(id: number, clientData: Partial<InsertClient>): Promise<Client | undefined> {
    const [client] = await db
      .update(clients)
      .set(clientData)
      .where(eq(clients.id, id))
      .returning();
    return client;
  }

  async getInvoice(id: number): Promise<InvoiceWithDetails | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    if (!invoice) return undefined;

    const client = invoice.clientId ? 
      await this.getClient(invoice.clientId) : undefined;
    const lineItemsList = await this.getLineItems(id);

    return {
      ...invoice,
      client,
      lineItems: lineItemsList
    };
  }

  async getInvoices(): Promise<InvoiceWithDetails[]> {
    const allInvoices = await db.select().from(invoices);
    const result: InvoiceWithDetails[] = [];

    for (const invoice of allInvoices) {
      const client = invoice.clientId ? 
        await this.getClient(invoice.clientId) : undefined;
      const lineItemsList = await this.getLineItems(invoice.id);

      result.push({
        ...invoice,
        client,
        lineItems: lineItemsList
      });
    }

    return result;
  }

  async createInvoice(invoiceData: InsertInvoice): Promise<Invoice> {
    const invoiceNumber = await this.generateInvoiceNumber();
    const [invoice] = await db
      .insert(invoices)
      .values({
        ...invoiceData,
        invoiceNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();
    return invoice;
  }

  async updateInvoice(id: number, invoiceData: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const [invoice] = await db
      .update(invoices)
      .set({
        ...invoiceData,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(invoices.id, id))
      .returning();
    return invoice;
  }

  async deleteInvoice(id: number): Promise<boolean> {
    await this.deleteLineItemsByInvoice(id);
    const result = await db.delete(invoices).where(eq(invoices.id, id));
    return (result.rowCount || 0) > 0;
  }

  async generateInvoiceNumber(): Promise<string> {
    const allInvoices = await db.select().from(invoices);
    const nextNumber = allInvoices.length + 1;
    return `INV-${nextNumber.toString().padStart(4, '0')}`;
  }

  async getLineItems(invoiceId: number): Promise<LineItem[]> {
    return await db.select().from(lineItems).where(eq(lineItems.invoiceId, invoiceId));
  }

  async createLineItem(lineItemData: InsertLineItem): Promise<LineItem> {
    const [lineItem] = await db.insert(lineItems).values(lineItemData).returning();
    return lineItem;
  }

  async updateLineItem(id: number, lineItemData: Partial<InsertLineItem>): Promise<LineItem | undefined> {
    const [lineItem] = await db
      .update(lineItems)
      .set(lineItemData)
      .where(eq(lineItems.id, id))
      .returning();
    return lineItem;
  }

  async deleteLineItem(id: number): Promise<boolean> {
    const result = await db.delete(lineItems).where(eq(lineItems.id, id));
    return (result.rowCount || 0) > 0;
  }

  async deleteLineItemsByInvoice(invoiceId: number): Promise<boolean> {
    const result = await db.delete(lineItems).where(eq(lineItems.invoiceId, invoiceId));
    return (result.rowCount || 0) > 0;
  }
}

export class MemStorage implements IStorage {
  private clients: Map<number, Client> = new Map();
  private invoices: Map<number, Invoice> = new Map();
  private lineItems: Map<number, LineItem> = new Map();
  private users: Map<string, User> = new Map();
  private currentClientId = 1;
  private currentInvoiceId = 1;
  private currentLineItemId = 1;
  private currentInvoiceNumber = 1;

  // User operations for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user: User = {
      id: userData.id!,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: userData.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  // Clients
  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = this.currentClientId++;
    const client: Client = { 
      ...insertClient, 
      id,
      address: insertClient.address || null,
      phone: insertClient.phone || null,
      taxId: insertClient.taxId || null
    };
    this.clients.set(id, client);
    return client;
  }

  async updateClient(id: number, clientUpdate: Partial<InsertClient>): Promise<Client | undefined> {
    const client = this.clients.get(id);
    if (!client) return undefined;
    
    const updated = { ...client, ...clientUpdate };
    this.clients.set(id, updated);
    return updated;
  }

  // Invoices
  async getInvoice(id: number): Promise<InvoiceWithDetails | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;

    const client = invoice.clientId ? this.clients.get(invoice.clientId) : undefined;
    const invoiceLineItems = Array.from(this.lineItems.values())
      .filter(item => item.invoiceId === id);

    return {
      ...invoice,
      client,
      lineItems: invoiceLineItems
    };
  }

  async getInvoices(): Promise<InvoiceWithDetails[]> {
    const invoicesList = Array.from(this.invoices.values());
    return Promise.all(
      invoicesList.map(async (invoice) => {
        const client = invoice.clientId ? this.clients.get(invoice.clientId) : undefined;
        const invoiceLineItems = Array.from(this.lineItems.values())
          .filter(item => item.invoiceId === invoice.id);
        
        return {
          ...invoice,
          client,
          lineItems: invoiceLineItems
        };
      })
    );
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const id = this.currentInvoiceId++;
    const now = new Date().toISOString();
    const invoice: Invoice = { 
      ...insertInvoice,
      id,
      status: insertInvoice.status || "draft",
      currency: insertInvoice.currency || "USD",
      clientId: insertInvoice.clientId || null,
      dueDate: insertInvoice.dueDate || null,
      paymentTerms: insertInvoice.paymentTerms || null,
      notes: insertInvoice.notes || null,
      subtotal: insertInvoice.subtotal || "0",
      taxRate: insertInvoice.taxRate || "0",
      taxAmount: insertInvoice.taxAmount || "0",
      discount: insertInvoice.discount || "0",
      total: insertInvoice.total || "0",
      logoUrl: insertInvoice.logoUrl || null,
      letterheadTemplate: insertInvoice.letterheadTemplate || "modern",
      primaryColor: insertInvoice.primaryColor || "#3b82f6",
      secondaryColor: insertInvoice.secondaryColor || "#1e40af",
      stampUrl: insertInvoice.stampUrl || null,
      backgroundStyle: insertInvoice.backgroundStyle || "clean",
      typeSpecificData: insertInvoice.typeSpecificData || null,
      createdAt: now,
      updatedAt: now
    };
    this.invoices.set(id, invoice);
    return invoice;
  }

  async updateInvoice(id: number, invoiceUpdate: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;
    
    const updated = { 
      ...invoice, 
      ...invoiceUpdate, 
      updatedAt: new Date().toISOString() 
    };
    this.invoices.set(id, updated);
    return updated;
  }

  async deleteInvoice(id: number): Promise<boolean> {
    const deleted = this.invoices.delete(id);
    if (deleted) {
      // Also delete associated line items
      await this.deleteLineItemsByInvoice(id);
    }
    return deleted;
  }

  async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const number = this.currentInvoiceNumber++;
    return `INV-${year}-${number.toString().padStart(3, '0')}`;
  }

  // Line Items
  async getLineItems(invoiceId: number): Promise<LineItem[]> {
    return Array.from(this.lineItems.values())
      .filter(item => item.invoiceId === invoiceId);
  }

  async createLineItem(insertLineItem: InsertLineItem): Promise<LineItem> {
    const id = this.currentLineItemId++;
    const lineItem: LineItem = { 
      ...insertLineItem, 
      id,
      date: insertLineItem.date || null,
      invoiceId: insertLineItem.invoiceId || null,
      hours: insertLineItem.hours || null
    };
    this.lineItems.set(id, lineItem);
    return lineItem;
  }

  async updateLineItem(id: number, lineItemUpdate: Partial<InsertLineItem>): Promise<LineItem | undefined> {
    const lineItem = this.lineItems.get(id);
    if (!lineItem) return undefined;
    
    const updated = { ...lineItem, ...lineItemUpdate };
    this.lineItems.set(id, updated);
    return updated;
  }

  async deleteLineItem(id: number): Promise<boolean> {
    return this.lineItems.delete(id);
  }

  async deleteLineItemsByInvoice(invoiceId: number): Promise<boolean> {
    const toDelete = Array.from(this.lineItems.entries())
      .filter(([_, item]) => item.invoiceId === invoiceId)
      .map(([id]) => id);
    
    toDelete.forEach(id => this.lineItems.delete(id));
    return true;
  }
}

export const storage = new DatabaseStorage();
