-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "whatsapp_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"contact_id" uuid,
	"external_id" text,
	"direction" text NOT NULL,
	"type" text NOT NULL,
	"content" text,
	"raw_payload" jsonb,
	"status" text DEFAULT 'received' NOT NULL,
	"correlation_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "whatsapp_messages_external_id_unique" UNIQUE("external_id")
);
--> statement-breakpoint
ALTER TABLE "whatsapp_messages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"type" text NOT NULL,
	"category" text NOT NULL,
	"amount" integer NOT NULL,
	"description" text NOT NULL,
	"occurred_at" timestamp NOT NULL,
	"reference" text,
	"created_by" text NOT NULL,
	"confirmed" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "transactions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "inventory_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"name" text NOT NULL,
	"sku" text,
	"category" text,
	"unit" text DEFAULT 'units' NOT NULL,
	"current_stock" integer DEFAULT 0 NOT NULL,
	"reorder_point" integer DEFAULT 0 NOT NULL,
	"selling_price_kobo" integer DEFAULT 0 NOT NULL,
	"cost_price_kobo" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "inventory_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "inventory_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"batch_number" text,
	"quantity" integer DEFAULT 0 NOT NULL,
	"expiry_date" text,
	"cost_price_kobo" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inventory_batches" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"contact_id" uuid NOT NULL,
	"current_agent" text,
	"pending_confirmation" jsonb,
	"context" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"last_activity_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"wa_id" text NOT NULL,
	"name" text,
	"language" text DEFAULT 'en' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contacts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "stock_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"batch_id" uuid,
	"type" text NOT NULL,
	"quantity" integer NOT NULL,
	"reason" text,
	"reference_id" uuid,
	"notes" text,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "stock_movements" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"salary_kobo" integer NOT NULL,
	"payment_method" text DEFAULT 'bank_transfer' NOT NULL,
	"bank_code" text,
	"account_number" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "employees" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "payroll_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"period_start" text NOT NULL,
	"period_end" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"total_kobo" integer NOT NULL,
	"created_by" text NOT NULL,
	"confirmed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payroll_runs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "payroll_line_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"amount_kobo" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payroll_line_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" text NOT NULL,
	"business_id" uuid NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"role" text DEFAULT 'owner' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id")
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"action" text NOT NULL,
	"actor_type" text NOT NULL,
	"actor_id" text NOT NULL,
	"changes" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_log" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"whatsapp_phone_number" text,
	"phone_number_id" text,
	"tier" text DEFAULT 'starter' NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"clerk_user_id" text,
	"email" text,
	"phone" text,
	"admin_first_name" text,
	"admin_last_name" text,
	CONSTRAINT "businesses_whatsapp_phone_number_unique" UNIQUE("whatsapp_phone_number"),
	CONSTRAINT "businesses_phone_number_id_unique" UNIQUE("phone_number_id"),
	CONSTRAINT "businesses_clerk_user_id_key" UNIQUE("clerk_user_id")
);
--> statement-breakpoint
ALTER TABLE "businesses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_batches" ADD CONSTRAINT "inventory_batches_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_batches" ADD CONSTRAINT "inventory_batches_item_id_inventory_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."inventory_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_item_id_inventory_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."inventory_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_batch_id_inventory_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."inventory_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_runs" ADD CONSTRAINT "payroll_runs_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_line_items" ADD CONSTRAINT "payroll_line_items_run_id_payroll_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."payroll_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_line_items" ADD CONSTRAINT "payroll_line_items_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_line_items" ADD CONSTRAINT "payroll_line_items_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_messages_business_contact" ON "whatsapp_messages" USING btree ("business_id" uuid_ops,"contact_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_messages_created_at" ON "whatsapp_messages" USING btree ("business_id" uuid_ops,"created_at" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_messages_external_id" ON "whatsapp_messages" USING btree ("external_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_transactions_business_occurred" ON "transactions" USING btree ("business_id" timestamp_ops,"occurred_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_transactions_type" ON "transactions" USING btree ("business_id" uuid_ops,"type" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_inventory_items_business" ON "inventory_items" USING btree ("business_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_inventory_items_name" ON "inventory_items" USING btree ("business_id" text_ops,"name" text_ops);--> statement-breakpoint
CREATE INDEX "idx_inventory_items_name_trgm" ON "inventory_items" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "idx_inventory_batches_expiry" ON "inventory_batches" USING btree ("business_id" uuid_ops,"expiry_date" text_ops);--> statement-breakpoint
CREATE INDEX "idx_inventory_batches_item" ON "inventory_batches" USING btree ("item_id" uuid_ops,"expiry_date" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_contacts_business_wa" ON "contacts" USING btree ("business_id" text_ops,"wa_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_employees_business" ON "employees" USING btree ("business_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_audit_created" ON "audit_log" USING btree ("business_id" timestamp_ops,"created_at" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_audit_entity" ON "audit_log" USING btree ("business_id" uuid_ops,"entity_type" text_ops,"entity_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_businesses_phone_number_id" ON "businesses" USING btree ("phone_number_id" text_ops);--> statement-breakpoint
CREATE POLICY "business_isolation" ON "whatsapp_messages" AS PERMISSIVE FOR ALL TO "africaos_app" USING (((business_id)::text = current_setting('africaos.current_business_id'::text, true)));--> statement-breakpoint
CREATE POLICY "business_isolation" ON "transactions" AS PERMISSIVE FOR ALL TO "africaos_app" USING (((business_id)::text = current_setting('africaos.current_business_id'::text, true)));--> statement-breakpoint
CREATE POLICY "business_isolation" ON "inventory_items" AS PERMISSIVE FOR ALL TO "africaos_app" USING (((business_id)::text = current_setting('africaos.current_business_id'::text, true)));--> statement-breakpoint
CREATE POLICY "business_isolation" ON "inventory_batches" AS PERMISSIVE FOR ALL TO "africaos_app" USING (((business_id)::text = current_setting('africaos.current_business_id'::text, true)));--> statement-breakpoint
CREATE POLICY "business_isolation" ON "sessions" AS PERMISSIVE FOR ALL TO "africaos_app" USING (((business_id)::text = current_setting('africaos.current_business_id'::text, true)));--> statement-breakpoint
CREATE POLICY "business_isolation" ON "contacts" AS PERMISSIVE FOR ALL TO "africaos_app" USING (((business_id)::text = current_setting('africaos.current_business_id'::text, true)));--> statement-breakpoint
CREATE POLICY "business_isolation" ON "stock_movements" AS PERMISSIVE FOR ALL TO "africaos_app" USING (((business_id)::text = current_setting('africaos.current_business_id'::text, true)));--> statement-breakpoint
CREATE POLICY "business_isolation" ON "employees" AS PERMISSIVE FOR ALL TO "africaos_app" USING (((business_id)::text = current_setting('africaos.current_business_id'::text, true)));--> statement-breakpoint
CREATE POLICY "business_isolation" ON "payroll_runs" AS PERMISSIVE FOR ALL TO "africaos_app" USING (((business_id)::text = current_setting('africaos.current_business_id'::text, true)));--> statement-breakpoint
CREATE POLICY "business_isolation" ON "payroll_line_items" AS PERMISSIVE FOR ALL TO "africaos_app" USING (((business_id)::text = current_setting('africaos.current_business_id'::text, true)));--> statement-breakpoint
CREATE POLICY "business_isolation" ON "users" AS PERMISSIVE FOR ALL TO "africaos_app" USING (((business_id)::text = current_setting('africaos.current_business_id'::text, true)));--> statement-breakpoint
CREATE POLICY "business_isolation" ON "audit_log" AS PERMISSIVE FOR ALL TO "africaos_app" USING (((business_id)::text = current_setting('africaos.current_business_id'::text, true)));--> statement-breakpoint
CREATE POLICY "business_isolation" ON "businesses" AS PERMISSIVE FOR ALL TO "africaos_app" USING (((id)::text = current_setting('africaos.current_business_id'::text, true)));
*/