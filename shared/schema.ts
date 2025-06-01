import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Process Flow schema
export const processFlows = pgTable("process_flows", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  projectName: text("project_name").notNull().default("Default Project"),
  flowData: jsonb("flow_data").notNull(), // Contains nodes, edges, viewport
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Node Configurations schema
export const nodeConfigurations = pgTable("node_configurations", {
  id: serial("id").primaryKey(),
  nodeId: text("node_id").notNull().unique(),
  nodeType: text("node_type").notNull(),
  configuration: jsonb("configuration").notNull(),
  flowId: integer("flow_id").references(() => processFlows.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Zod schemas for validation
export const insertProcessFlowSchema = createInsertSchema(processFlows).pick({
  name: true,
  description: true,
  projectName: true,
  flowData: true,
  isActive: true,
});

export const insertNodeConfigurationSchema = createInsertSchema(nodeConfigurations).pick({
  nodeId: true,
  nodeType: true,
  configuration: true,
  flowId: true,
});

// Node configuration schemas for different WMS process types
export const receivingConfigSchema = z.object({
  processName: z.string().min(1, "Process name is required"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  grnPattern: z.string().default("AUTO-{YYYY}-{###}"),
  qualityCheckRequired: z.boolean().default(true),
  crossDockEnabled: z.boolean().default(false),
  expectedItems: z.number().min(1, "Expected items must be at least 1"),
  tolerance: z.number().min(0).max(100, "Tolerance must be between 0-100%"),
  qualityFailAction: z.enum(["reject", "quarantine", "rework"]).default("quarantine"),
  excessAction: z.enum(["accept", "partial", "reject"]).default("partial"),
});

export const palletizationConfigSchema = z.object({
  processName: z.string().min(1, "Process name is required"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  strategy: z.enum(["mixed", "single-sku", "weight-based", "size-based"]).default("mixed"),
  maxHeight: z.number().positive("Max height must be positive"),
  maxWeight: z.number().positive("Max weight must be positive"),
  stackingRules: z.boolean().default(true),
  labelPrint: z.boolean().default(true),
});

export const putawayConfigSchema = z.object({
  processName: z.string().min(1, "Process name is required"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  strategy: z.enum(["FIFO", "LIFO", "random", "directed"]).default("FIFO"),
  zone: z.string().min(1, "Zone is required"),
  locationAssignment: z.enum(["automatic", "manual", "hybrid"]).default("automatic"),
  capacityCheck: z.boolean().default(true),
});

export const replenishmentConfigSchema = z.object({
  processName: z.string().min(1, "Process name is required"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  triggerType: z.enum(["min-max", "demand-based", "scheduled"]).default("min-max"),
  replenishmentType: z.enum(["full-case", "loose-items", "both"]).default("both"),
  sourceLocation: z.string().min(1, "Source location is required"),
  minQuantity: z.number().min(0, "Min quantity cannot be negative"),
  maxQuantity: z.number().positive("Max quantity must be positive"),
});

export const pickingConfigSchema = z.object({
  processName: z.string().min(1, "Process name is required"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  pickingStrategy: z.enum(["batch", "wave", "zone", "discrete"]).default("batch"),
  batchAllocation: z.enum(["automatic", "manual"]).default("automatic"),
  pickingMethod: z.enum(["paper", "rf", "voice", "light"]).default("rf"),
  qualityCheck: z.boolean().default(false),
});

export const loadingConfigSchema = z.object({
  processName: z.string().min(1, "Process name is required"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  loadingStrategy: z.enum(["route-based", "time-based", "capacity-based"]).default("route-based"),
  truckType: z.string().min(1, "Truck type is required"),
  maxWeight: z.number().positive("Max weight must be positive"),
  maxVolume: z.number().positive("Max volume must be positive"),
  sealRequired: z.boolean().default(true),
});

// Types
export type InsertProcessFlow = z.infer<typeof insertProcessFlowSchema>;
export type ProcessFlow = typeof processFlows.$inferSelect;

export type InsertNodeConfiguration = z.infer<typeof insertNodeConfigurationSchema>;
export type NodeConfiguration = typeof nodeConfigurations.$inferSelect;

export type ReceivingConfig = z.infer<typeof receivingConfigSchema>;
export type PalletizationConfig = z.infer<typeof palletizationConfigSchema>;
export type PutawayConfig = z.infer<typeof putawayConfigSchema>;
export type ReplenishmentConfig = z.infer<typeof replenishmentConfigSchema>;
export type PickingConfig = z.infer<typeof pickingConfigSchema>;
export type LoadingConfig = z.infer<typeof loadingConfigSchema>;

// Node types definition
export const NODE_TYPES = {
  RECEIVING: 'receiving',
  PALLETIZATION: 'palletization',
  PUTAWAY: 'putaway',
  REPLENISHMENT: 'replenishment',
  PICKING: 'picking',
  LOADING: 'loading',
} as const;

export type NodeType = typeof NODE_TYPES[keyof typeof NODE_TYPES];

// Flow data structure for React Flow
export interface FlowData {
  nodes: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data: {
      nodeType: NodeType;
      label: string;
      config?: any;
    };
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    type?: string;
  }>;
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
}
