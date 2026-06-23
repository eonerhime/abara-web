import { relations } from "drizzle-orm/relations";
import { businesses, whatsappMessages, contacts, transactions, inventoryItems, inventoryBatches, sessions, stockMovements, employees, payrollRuns, payrollLineItems, users, auditLog } from "./schema";

export const whatsappMessagesRelations = relations(whatsappMessages, ({one}) => ({
	business: one(businesses, {
		fields: [whatsappMessages.businessId],
		references: [businesses.id]
	}),
	contact: one(contacts, {
		fields: [whatsappMessages.contactId],
		references: [contacts.id]
	}),
}));

export const businessesRelations = relations(businesses, ({many}) => ({
	whatsappMessages: many(whatsappMessages),
	transactions: many(transactions),
	inventoryItems: many(inventoryItems),
	inventoryBatches: many(inventoryBatches),
	sessions: many(sessions),
	contacts: many(contacts),
	stockMovements: many(stockMovements),
	employees: many(employees),
	payrollRuns: many(payrollRuns),
	payrollLineItems: many(payrollLineItems),
	users: many(users),
	auditLogs: many(auditLog),
}));

export const contactsRelations = relations(contacts, ({one, many}) => ({
	whatsappMessages: many(whatsappMessages),
	sessions: many(sessions),
	business: one(businesses, {
		fields: [contacts.businessId],
		references: [businesses.id]
	}),
}));

export const transactionsRelations = relations(transactions, ({one}) => ({
	business: one(businesses, {
		fields: [transactions.businessId],
		references: [businesses.id]
	}),
}));

export const inventoryItemsRelations = relations(inventoryItems, ({one, many}) => ({
	business: one(businesses, {
		fields: [inventoryItems.businessId],
		references: [businesses.id]
	}),
	inventoryBatches: many(inventoryBatches),
	stockMovements: many(stockMovements),
}));

export const inventoryBatchesRelations = relations(inventoryBatches, ({one, many}) => ({
	business: one(businesses, {
		fields: [inventoryBatches.businessId],
		references: [businesses.id]
	}),
	inventoryItem: one(inventoryItems, {
		fields: [inventoryBatches.itemId],
		references: [inventoryItems.id]
	}),
	stockMovements: many(stockMovements),
}));

export const sessionsRelations = relations(sessions, ({one}) => ({
	business: one(businesses, {
		fields: [sessions.businessId],
		references: [businesses.id]
	}),
	contact: one(contacts, {
		fields: [sessions.contactId],
		references: [contacts.id]
	}),
}));

export const stockMovementsRelations = relations(stockMovements, ({one}) => ({
	business: one(businesses, {
		fields: [stockMovements.businessId],
		references: [businesses.id]
	}),
	inventoryItem: one(inventoryItems, {
		fields: [stockMovements.itemId],
		references: [inventoryItems.id]
	}),
	inventoryBatch: one(inventoryBatches, {
		fields: [stockMovements.batchId],
		references: [inventoryBatches.id]
	}),
}));

export const employeesRelations = relations(employees, ({one, many}) => ({
	business: one(businesses, {
		fields: [employees.businessId],
		references: [businesses.id]
	}),
	payrollLineItems: many(payrollLineItems),
}));

export const payrollRunsRelations = relations(payrollRuns, ({one, many}) => ({
	business: one(businesses, {
		fields: [payrollRuns.businessId],
		references: [businesses.id]
	}),
	payrollLineItems: many(payrollLineItems),
}));

export const payrollLineItemsRelations = relations(payrollLineItems, ({one}) => ({
	payrollRun: one(payrollRuns, {
		fields: [payrollLineItems.runId],
		references: [payrollRuns.id]
	}),
	business: one(businesses, {
		fields: [payrollLineItems.businessId],
		references: [businesses.id]
	}),
	employee: one(employees, {
		fields: [payrollLineItems.employeeId],
		references: [employees.id]
	}),
}));

export const usersRelations = relations(users, ({one}) => ({
	business: one(businesses, {
		fields: [users.businessId],
		references: [businesses.id]
	}),
}));

export const auditLogRelations = relations(auditLog, ({one}) => ({
	business: one(businesses, {
		fields: [auditLog.businessId],
		references: [businesses.id]
	}),
}));