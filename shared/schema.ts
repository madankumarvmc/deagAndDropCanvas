import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Warehouse Flow schema (renamed from processFlows)
export const warehouseFlows = pgTable("warehouse_flows", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  warehouseName: text("warehouse_name").notNull().default("Default Warehouse"),
  flowData: jsonb("flow_data").notNull(), // Contains location nodes, movement edges, location tasks, viewport
  frameworkConfig: jsonb("framework_config").notNull(), // JSON configuration for node/edge types
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Location Node Configurations
export const locationConfigurations = pgTable("location_configurations", {
  id: serial("id").primaryKey(),
  locationId: text("location_id").notNull().unique(),
  locationTypeId: text("location_type_id").notNull(),
  configuration: jsonb("configuration").notNull(),
  flowId: integer("flow_id").references(() => warehouseFlows.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Movement Task Configurations (for edges between locations)
export const movementTaskConfigurations = pgTable("movement_task_configurations", {
  id: serial("id").primaryKey(),
  edgeId: text("edge_id").notNull().unique(),
  taskTypeId: text("task_type_id").notNull(),
  sourceLocationId: text("source_location_id").notNull(),
  targetLocationId: text("target_location_id").notNull(),
  configuration: jsonb("configuration").notNull(),
  flowId: integer("flow_id").references(() => warehouseFlows.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Location-Specific Task Configurations (for tasks attached to locations)
export const locationTaskConfigurations = pgTable("location_task_configurations", {
  id: serial("id").primaryKey(),
  taskId: text("task_id").notNull().unique(),
  taskTypeId: text("task_type_id").notNull(),
  locationId: text("location_id").notNull(),
  configuration: jsonb("configuration").notNull(),
  flowId: integer("flow_id").references(() => warehouseFlows.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Zod schemas for validation
export const insertWarehouseFlowSchema = createInsertSchema(warehouseFlows).pick({
  name: true,
  description: true,
  warehouseName: true,
  flowData: true,
  frameworkConfig: true,
  isActive: true,
});

export const insertLocationConfigurationSchema = createInsertSchema(locationConfigurations).pick({
  locationId: true,
  locationTypeId: true,
  configuration: true,
  flowId: true,
});

export const insertMovementTaskConfigurationSchema = createInsertSchema(movementTaskConfigurations).pick({
  edgeId: true,
  taskTypeId: true,
  sourceLocationId: true,
  targetLocationId: true,
  configuration: true,
  flowId: true,
});

export const insertLocationTaskConfigurationSchema = createInsertSchema(locationTaskConfigurations).pick({
  taskId: true,
  taskTypeId: true,
  locationId: true,
  configuration: true,
  flowId: true,
});

// Types
export type InsertWarehouseFlow = z.infer<typeof insertWarehouseFlowSchema>;
export type WarehouseFlow = typeof warehouseFlows.$inferSelect;

export type InsertLocationConfiguration = z.infer<typeof insertLocationConfigurationSchema>;
export type LocationConfiguration = typeof locationConfigurations.$inferSelect;

export type InsertMovementTaskConfiguration = z.infer<typeof insertMovementTaskConfigurationSchema>;
export type MovementTaskConfiguration = typeof movementTaskConfigurations.$inferSelect;

export type InsertLocationTaskConfiguration = z.infer<typeof insertLocationTaskConfigurationSchema>;
export type LocationTaskConfiguration = typeof locationTaskConfigurations.$inferSelect;

// Flow data structure for React Flow (updated for location-centric model)
export interface WarehouseFlowData {
  locationNodes: Array<{
    id: string;
    type: string; // Always 'warehouseLocation'
    position: { x: number; y: number };
    data: {
      locationTypeId: string;
      locationName: string;
      icon: string;
      color: string;
      bgColor: string;
      borderColor: string;
      category: string;
      configuration?: any;
      locationTasks?: Array<{
        id: string;
        taskTypeId: string;
        name: string;
        icon: string;
        color: string;
        bgColor: string;
        configuration?: any;
      }>;
    };
  }>;
  movementEdges: Array<{
    id: string;
    source: string;
    target: string;
    type: string; // 'movementTask'
    data: {
      taskTypeId: string;
      taskName: string;
      icon: string;
      color: string;
      category: string;
      configuration?: any;
    };
  }>;
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
}

// Edge selection data for creating movement tasks
export interface MovementTaskSelection {
  sourceLocationId: string;
  targetLocationId: string;
  taskTypeId: string;
}
