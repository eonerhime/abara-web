import {
  pgTable,
  index,
  foreignKey,
  char,
  unique,
  pgPolicy,
  uuid,
  text,
  jsonb,
  timestamp,
  integer,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const whatsappMessages = pgTable(
  "whatsapp_messages",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    businessId: uuid("business_id").notNull(),
    contactId: uuid("contact_id"),
    externalId: text("external_id"),
    direction: text().notNull(),
    type: text().notNull(),
    content: text(),
    rawPayload: jsonb("raw_payload"),
    status: text().default("received").notNull(),
    correlationId: uuid("correlation_id"),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_messages_business_contact").using(
      "btree",
      table.businessId.asc().nullsLast().op("uuid_ops"),
      table.contactId.asc().nullsLast().op("uuid_ops"),
    ),
    index("idx_messages_created_at").using(
      "btree",
      table.businessId.asc().nullsLast().op("uuid_ops"),
      table.createdAt.desc().nullsFirst().op("uuid_ops"),
    ),
    index("idx_messages_external_id").using(
      "btree",
      table.externalId.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.businessId],
      foreignColumns: [businesses.id],
      name: "whatsapp_messages_business_id_businesses_id_fk",
    }),
    foreignKey({
      columns: [table.contactId],
      foreignColumns: [contacts.id],
      name: "whatsapp_messages_contact_id_contacts_id_fk",
    }),
    unique("whatsapp_messages_external_id_unique").on(table.externalId),
    pgPolicy("business_isolation", {
      as: "permissive",
      for: "all",
      to: ["africaos_app"],
      using: sql`((business_id)::text = current_setting('africaos.current_business_id'::text, true))`,
    }),
  ],
);

export const transactions = pgTable(
  "transactions",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    businessId: uuid("business_id").notNull(),
    type: text().notNull(),
    category: text().notNull(),
    amount: integer().notNull(),
    description: text().notNull(),
    occurredAt: timestamp("occurred_at", { mode: "string" }).notNull(),
    reference: text(),
    createdBy: text("created_by").notNull(),
    confirmed: boolean().default(true).notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { mode: "string" }),
  },
  (table) => [
    index("idx_transactions_business_occurred").using(
      "btree",
      table.businessId.asc().nullsLast().op("timestamp_ops"),
      table.occurredAt.desc().nullsFirst().op("timestamp_ops"),
    ),
    index("idx_transactions_type").using(
      "btree",
      table.businessId.asc().nullsLast().op("uuid_ops"),
      table.type.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.businessId],
      foreignColumns: [businesses.id],
      name: "transactions_business_id_businesses_id_fk",
    }),
    pgPolicy("business_isolation", {
      as: "permissive",
      for: "all",
      to: ["africaos_app"],
      using: sql`((business_id)::text = current_setting('africaos.current_business_id'::text, true))`,
    }),
  ],
);

export const inventoryItems = pgTable(
  "inventory_items",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    businessId: uuid("business_id").notNull(),
    name: text().notNull(),
    sku: text(),
    category: text(),
    unit: text().default("units").notNull(),
    currentStock: integer("current_stock").default(0).notNull(),
    reorderPoint: integer("reorder_point").default(0).notNull(),
    sellingPriceKobo: integer("selling_price_kobo").default(0).notNull(),
    costPriceKobo: integer("cost_price_kobo").default(0).notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { mode: "string" }),
  },
  (table) => [
    index("idx_inventory_items_business").using(
      "btree",
      table.businessId.asc().nullsLast().op("uuid_ops"),
    ),
    index("idx_inventory_items_name").using(
      "btree",
      table.businessId.asc().nullsLast().op("text_ops"),
      table.name.asc().nullsLast().op("text_ops"),
    ),
    index("idx_inventory_items_name_trgm").using(
      "gin",
      table.name.asc().nullsLast().op("gin_trgm_ops"),
    ),
    foreignKey({
      columns: [table.businessId],
      foreignColumns: [businesses.id],
      name: "inventory_items_business_id_businesses_id_fk",
    }),
    pgPolicy("business_isolation", {
      as: "permissive",
      for: "all",
      to: ["africaos_app"],
      using: sql`((business_id)::text = current_setting('africaos.current_business_id'::text, true))`,
    }),
  ],
);

export const inventoryBatches = pgTable(
  "inventory_batches",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    businessId: uuid("business_id").notNull(),
    itemId: uuid("item_id").notNull(),
    batchNumber: text("batch_number"),
    quantity: integer().default(0).notNull(),
    expiryDate: text("expiry_date"),
    costPriceKobo: integer("cost_price_kobo").default(0).notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_inventory_batches_expiry").using(
      "btree",
      table.businessId.asc().nullsLast().op("uuid_ops"),
      table.expiryDate.asc().nullsLast().op("text_ops"),
    ),
    index("idx_inventory_batches_item").using(
      "btree",
      table.itemId.asc().nullsLast().op("uuid_ops"),
      table.expiryDate.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.businessId],
      foreignColumns: [businesses.id],
      name: "inventory_batches_business_id_businesses_id_fk",
    }),
    foreignKey({
      columns: [table.itemId],
      foreignColumns: [inventoryItems.id],
      name: "inventory_batches_item_id_inventory_items_id_fk",
    }),
    pgPolicy("business_isolation", {
      as: "permissive",
      for: "all",
      to: ["africaos_app"],
      using: sql`((business_id)::text = current_setting('africaos.current_business_id'::text, true))`,
    }),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    businessId: uuid("business_id").notNull(),
    contactId: uuid("contact_id").notNull(),
    currentAgent: text("current_agent"),
    pendingConfirmation: jsonb("pending_confirmation"),
    context: jsonb().default({}).notNull(),
    lastActivityAt: timestamp("last_activity_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp("expires_at", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.businessId],
      foreignColumns: [businesses.id],
      name: "sessions_business_id_businesses_id_fk",
    }),
    foreignKey({
      columns: [table.contactId],
      foreignColumns: [contacts.id],
      name: "sessions_contact_id_contacts_id_fk",
    }),
    pgPolicy("business_isolation", {
      as: "permissive",
      for: "all",
      to: ["africaos_app"],
      using: sql`((business_id)::text = current_setting('africaos.current_business_id'::text, true))`,
    }),
  ],
);

export const contacts = pgTable(
  "contacts",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    businessId: uuid("business_id").notNull(),
    waId: text("wa_id").notNull(),
    name: text(),
    language: text().default("en").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("idx_contacts_business_wa").using(
      "btree",
      table.businessId.asc().nullsLast().op("text_ops"),
      table.waId.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.businessId],
      foreignColumns: [businesses.id],
      name: "contacts_business_id_businesses_id_fk",
    }),
    pgPolicy("business_isolation", {
      as: "permissive",
      for: "all",
      to: ["africaos_app"],
      using: sql`((business_id)::text = current_setting('africaos.current_business_id'::text, true))`,
    }),
  ],
);

export const stockMovements = pgTable(
  "stock_movements",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    businessId: uuid("business_id").notNull(),
    itemId: uuid("item_id").notNull(),
    batchId: uuid("batch_id"),
    type: text().notNull(),
    quantity: integer().notNull(),
    reason: text(),
    referenceId: uuid("reference_id"),
    notes: text(),
    createdBy: text("created_by").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.businessId],
      foreignColumns: [businesses.id],
      name: "stock_movements_business_id_businesses_id_fk",
    }),
    foreignKey({
      columns: [table.itemId],
      foreignColumns: [inventoryItems.id],
      name: "stock_movements_item_id_inventory_items_id_fk",
    }),
    foreignKey({
      columns: [table.batchId],
      foreignColumns: [inventoryBatches.id],
      name: "stock_movements_batch_id_inventory_batches_id_fk",
    }),
    pgPolicy("business_isolation", {
      as: "permissive",
      for: "all",
      to: ["africaos_app"],
      using: sql`((business_id)::text = current_setting('africaos.current_business_id'::text, true))`,
    }),
  ],
);

export const employees = pgTable(
  "employees",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    businessId: uuid("business_id").notNull(),
    name: text().notNull(),
    role: text().notNull(),
    salaryKobo: integer("salary_kobo").notNull(),
    paymentMethod: text("payment_method").default("bank_transfer").notNull(),
    bankCode: text("bank_code"),
    accountNumber: text("account_number"),
    status: text().default("active").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { mode: "string" }),
  },
  (table) => [
    index("idx_employees_business").using(
      "btree",
      table.businessId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.businessId],
      foreignColumns: [businesses.id],
      name: "employees_business_id_businesses_id_fk",
    }),
    pgPolicy("business_isolation", {
      as: "permissive",
      for: "all",
      to: ["africaos_app"],
      using: sql`((business_id)::text = current_setting('africaos.current_business_id'::text, true))`,
    }),
  ],
);

export const payrollRuns = pgTable(
  "payroll_runs",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    businessId: uuid("business_id").notNull(),
    periodStart: text("period_start").notNull(),
    periodEnd: text("period_end").notNull(),
    status: text().default("pending").notNull(),
    totalKobo: integer("total_kobo").notNull(),
    createdBy: text("created_by").notNull(),
    confirmedAt: timestamp("confirmed_at", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.businessId],
      foreignColumns: [businesses.id],
      name: "payroll_runs_business_id_businesses_id_fk",
    }),
    pgPolicy("business_isolation", {
      as: "permissive",
      for: "all",
      to: ["africaos_app"],
      using: sql`((business_id)::text = current_setting('africaos.current_business_id'::text, true))`,
    }),
  ],
);

export const payrollLineItems = pgTable(
  "payroll_line_items",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    runId: uuid("run_id").notNull(),
    businessId: uuid("business_id").notNull(),
    employeeId: uuid("employee_id").notNull(),
    amountKobo: integer("amount_kobo").notNull(),
    status: text().default("pending").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.runId],
      foreignColumns: [payrollRuns.id],
      name: "payroll_line_items_run_id_payroll_runs_id_fk",
    }),
    foreignKey({
      columns: [table.businessId],
      foreignColumns: [businesses.id],
      name: "payroll_line_items_business_id_businesses_id_fk",
    }),
    foreignKey({
      columns: [table.employeeId],
      foreignColumns: [employees.id],
      name: "payroll_line_items_employee_id_employees_id_fk",
    }),
    pgPolicy("business_isolation", {
      as: "permissive",
      for: "all",
      to: ["africaos_app"],
      using: sql`((business_id)::text = current_setting('africaos.current_business_id'::text, true))`,
    }),
  ],
);

export const users = pgTable(
  "users",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    clerkId: text("clerk_id").notNull(),
    businessId: uuid("business_id").notNull(),
    email: text().notNull(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    role: text().default("owner").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { mode: "string" }),
  },
  (table) => [
    foreignKey({
      columns: [table.businessId],
      foreignColumns: [businesses.id],
      name: "users_business_id_businesses_id_fk",
    }),
    unique("users_clerk_id_unique").on(table.clerkId),
    pgPolicy("business_isolation", {
      as: "permissive",
      for: "all",
      to: ["africaos_app"],
      using: sql`((business_id)::text = current_setting('africaos.current_business_id'::text, true))`,
    }),
  ],
);

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    businessId: uuid("business_id").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id").notNull(),
    action: text().notNull(),
    actorType: text("actor_type").notNull(),
    actorId: text("actor_id").notNull(),
    changes: jsonb(),
    metadata: jsonb(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_audit_created").using(
      "btree",
      table.businessId.asc().nullsLast().op("timestamp_ops"),
      table.createdAt.desc().nullsFirst().op("uuid_ops"),
    ),
    index("idx_audit_entity").using(
      "btree",
      table.businessId.asc().nullsLast().op("uuid_ops"),
      table.entityType.asc().nullsLast().op("text_ops"),
      table.entityId.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.businessId],
      foreignColumns: [businesses.id],
      name: "audit_log_business_id_businesses_id_fk",
    }),
    pgPolicy("business_isolation", {
      as: "permissive",
      for: "all",
      to: ["africaos_app"],
      using: sql`((business_id)::text = current_setting('africaos.current_business_id'::text, true))`,
    }),
  ],
);

export const businesses = pgTable(
  "businesses",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    whatsappPhoneNumber: text("whatsapp_phone_number"),
    phoneNumberId: text("phone_number_id"),
    tier: text().default("starter").notNull(),
    currency: char("currency", { length: 3 }).default("NGN").notNull(),
    settings: jsonb().default({}).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { mode: "string" }),
    clerkUserId: text("clerk_user_id"),
    email: text(),
    phone: text(),
    adminFirstName: text("admin_first_name"),
    adminLastName: text("admin_last_name"),
  },
  (table) => [
    index("idx_businesses_phone_number_id").using(
      "btree",
      table.phoneNumberId.asc().nullsLast().op("text_ops"),
    ),
    unique("businesses_whatsapp_phone_number_unique").on(
      table.whatsappPhoneNumber,
    ),
    unique("businesses_phone_number_id_unique").on(table.phoneNumberId),
    unique("businesses_clerk_user_id_key").on(table.clerkUserId),
    pgPolicy("business_isolation", {
      as: "permissive",
      for: "all",
      to: ["africaos_app"],
      using: sql`((id)::text = current_setting('africaos.current_business_id'::text, true))`,
    }),
  ],
);
