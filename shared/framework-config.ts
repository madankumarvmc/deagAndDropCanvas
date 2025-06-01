import { z } from "zod";

// Base field types for dynamic form generation
export const fieldTypeSchema = z.enum([
  'text',
  'number',
  'dropdown',
  'checkbox',
  'textarea',
  'multiselect'
]);

export const formFieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(['text', 'number', 'dropdown', 'checkbox', 'textarea', 'multiselect']),
  required: z.boolean().default(false),
  defaultValue: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]).optional(),
  placeholder: z.string().optional(),
  description: z.string().optional(),
  options: z.array(z.object({
    value: z.string(),
    label: z.string()
  })).optional(), // For dropdown/multiselect
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional()
  }).optional()
});

// Location Node Type Definition
export const locationNodeTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  color: z.string(),
  bgColor: z.string(),
  borderColor: z.string(),
  category: z.string(),
  configurationFields: z.array(formFieldSchema)
});

// Movement Task Type Definition
export const movementTaskTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  color: z.string(),
  category: z.string(),
  allowMultiple: z.boolean().default(true), // Allow multiple instances between same locations
  configurationFields: z.array(formFieldSchema)
});

// Location-Specific Task Type Definition
export const locationTaskTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  color: z.string(),
  bgColor: z.string(),
  category: z.string(),
  compatibleLocationTypes: z.array(z.string()), // Which location types can have this task
  configurationFields: z.array(formFieldSchema)
});

// Framework Configuration Schema
export const frameworkConfigSchema = z.object({
  locationNodeTypes: z.array(locationNodeTypeSchema),
  movementTaskTypes: z.array(movementTaskTypeSchema),
  locationTaskTypes: z.array(locationTaskTypeSchema),
  version: z.string(),
  name: z.string(),
  description: z.string()
});

// Type exports
export type FormField = z.infer<typeof formFieldSchema>;
export type LocationNodeType = z.infer<typeof locationNodeTypeSchema>;
export type MovementTaskType = z.infer<typeof movementTaskTypeSchema>;
export type LocationTaskType = z.infer<typeof locationTaskTypeSchema>;
export type FrameworkConfig = z.infer<typeof frameworkConfigSchema>;

// Default framework configuration
export const defaultFrameworkConfig: FrameworkConfig = {
  version: "1.0.0",
  name: "WMS Process Framework",
  description: "Configurable warehouse management system process designer",
  
  locationNodeTypes: [
    {
      id: "receiving_dock",
      name: "Receiving Dock",
      description: "Incoming goods receiving area",
      icon: "🚛",
      color: "#10b981",
      bgColor: "#dcfce7",
      borderColor: "#16a34a",
      category: "Inbound",
      configurationFields: [
        {
          id: "dock_number",
          label: "Dock Number",
          type: "text",
          required: true,
          placeholder: "e.g., DOCK-01"
        },
        {
          id: "capacity",
          label: "Capacity (pallets)",
          type: "number",
          required: true,
          defaultValue: 10,
          validation: { min: 1, max: 100 }
        },
        {
          id: "operating_hours",
          label: "Operating Hours",
          type: "dropdown",
          required: true,
          defaultValue: "24x7",
          options: [
            { value: "24x7", label: "24/7" },
            { value: "business", label: "Business Hours" },
            { value: "extended", label: "Extended Hours" }
          ]
        }
      ]
    },
    {
      id: "staging_area",
      name: "Staging Area",
      description: "Temporary holding area for goods",
      icon: "📦",
      color: "#3b82f6",
      bgColor: "#dbeafe",
      borderColor: "#2563eb",
      category: "Inbound",
      configurationFields: [
        {
          id: "area_code",
          label: "Area Code",
          type: "text",
          required: true,
          placeholder: "e.g., STAGE-A1"
        },
        {
          id: "max_dwell_time",
          label: "Max Dwell Time (hours)",
          type: "number",
          required: true,
          defaultValue: 24,
          validation: { min: 1, max: 168 }
        }
      ]
    },
    {
      id: "storage_location",
      name: "Storage Location",
      description: "Main storage area for inventory",
      icon: "🏪",
      color: "#8b5cf6",
      bgColor: "#ede9fe",
      borderColor: "#7c3aed",
      category: "Storage",
      configurationFields: [
        {
          id: "zone",
          label: "Storage Zone",
          type: "text",
          required: true,
          placeholder: "e.g., A1-A5"
        },
        {
          id: "storage_type",
          label: "Storage Type",
          type: "dropdown",
          required: true,
          defaultValue: "rack",
          options: [
            { value: "rack", label: "Rack Storage" },
            { value: "bulk", label: "Bulk Storage" },
            { value: "floor", label: "Floor Storage" }
          ]
        }
      ]
    },
    {
      id: "picking_face",
      name: "Picking Face",
      description: "Active picking location",
      icon: "✋",
      color: "#ef4444",
      bgColor: "#fee2e2",
      borderColor: "#dc2626",
      category: "Outbound",
      configurationFields: [
        {
          id: "pick_face_id",
          label: "Pick Face ID",
          type: "text",
          required: true,
          placeholder: "e.g., PF-01"
        },
        {
          id: "replenishment_trigger",
          label: "Replenishment Trigger (%)",
          type: "number",
          required: true,
          defaultValue: 20,
          validation: { min: 1, max: 100 }
        }
      ]
    },
    {
      id: "shipping_lane",
      name: "Shipping Lane",
      description: "Outbound shipping area",
      icon: "🚚",
      color: "#06b6d4",
      bgColor: "#cffafe",
      borderColor: "#0891b2",
      category: "Outbound",
      configurationFields: [
        {
          id: "lane_number",
          label: "Lane Number",
          type: "text",
          required: true,
          placeholder: "e.g., SHIP-01"
        },
        {
          id: "carrier_type",
          label: "Carrier Type",
          type: "dropdown",
          required: true,
          defaultValue: "ltl",
          options: [
            { value: "ltl", label: "LTL" },
            { value: "ftl", label: "FTL" },
            { value: "parcel", label: "Parcel" }
          ]
        }
      ]
    }
  ],

  movementTaskTypes: [
    {
      id: "putaway",
      name: "Putaway",
      description: "Move items from staging to storage",
      icon: "➡️",
      color: "#8b5cf6",
      category: "Inbound Movement",
      allowMultiple: true,
      configurationFields: [
        {
          id: "putaway_strategy",
          label: "Putaway Strategy",
          type: "dropdown",
          required: true,
          defaultValue: "directed",
          options: [
            { value: "directed", label: "Directed" },
            { value: "random", label: "Random" },
            { value: "fifo", label: "FIFO" }
          ]
        },
        {
          id: "item_type",
          label: "Item Type",
          type: "dropdown",
          required: true,
          defaultValue: "full_case",
          options: [
            { value: "full_case", label: "Full Case" },
            { value: "loose_item", label: "Loose Item" },
            { value: "pallet", label: "Pallet" }
          ]
        },
        {
          id: "priority",
          label: "Priority Level",
          type: "dropdown",
          required: true,
          defaultValue: "medium",
          options: [
            { value: "low", label: "Low" },
            { value: "medium", label: "Medium" },
            { value: "high", label: "High" },
            { value: "urgent", label: "Urgent" }
          ]
        }
      ]
    },
    {
      id: "picking",
      name: "Picking",
      description: "Select items for orders",
      icon: "👆",
      color: "#ef4444",
      category: "Outbound Movement",
      allowMultiple: true,
      configurationFields: [
        {
          id: "picking_method",
          label: "Picking Method",
          type: "dropdown",
          required: true,
          defaultValue: "batch",
          options: [
            { value: "discrete", label: "Discrete" },
            { value: "batch", label: "Batch" },
            { value: "zone", label: "Zone" },
            { value: "wave", label: "Wave" }
          ]
        },
        {
          id: "picking_technology",
          label: "Technology",
          type: "dropdown",
          required: true,
          defaultValue: "rf",
          options: [
            { value: "paper", label: "Paper" },
            { value: "rf", label: "RF Scanner" },
            { value: "voice", label: "Voice" },
            { value: "light", label: "Pick to Light" }
          ]
        }
      ]
    },
    {
      id: "replenishment",
      name: "Replenishment",
      description: "Restock picking locations",
      icon: "🔄",
      color: "#f59e0b",
      category: "Internal Movement",
      allowMultiple: true,
      configurationFields: [
        {
          id: "replenishment_type",
          label: "Replenishment Type",
          type: "dropdown",
          required: true,
          defaultValue: "min_max",
          options: [
            { value: "min_max", label: "Min/Max" },
            { value: "demand_based", label: "Demand Based" },
            { value: "scheduled", label: "Scheduled" }
          ]
        },
        {
          id: "min_quantity",
          label: "Minimum Quantity",
          type: "number",
          required: true,
          defaultValue: 10,
          validation: { min: 1 }
        }
      ]
    },
    {
      id: "transfer",
      name: "Transfer",
      description: "Move items between locations",
      icon: "↔️",
      color: "#06b6d4",
      category: "Internal Movement",
      allowMultiple: true,
      configurationFields: [
        {
          id: "transfer_reason",
          label: "Transfer Reason",
          type: "dropdown",
          required: true,
          defaultValue: "relocation",
          options: [
            { value: "relocation", label: "Relocation" },
            { value: "consolidation", label: "Consolidation" },
            { value: "cycle_count", label: "Cycle Count" }
          ]
        }
      ]
    }
  ],

  locationTaskTypes: [
    {
      id: "receiving",
      name: "Receiving",
      description: "Goods receipt and inspection",
      icon: "📥",
      color: "#10b981",
      bgColor: "#dcfce7",
      category: "Inbound Task",
      compatibleLocationTypes: ["receiving_dock", "staging_area"],
      configurationFields: [
        {
          id: "quality_check_required",
          label: "Quality Check Required",
          type: "checkbox",
          required: false,
          defaultValue: true
        },
        {
          id: "expected_grn_pattern",
          label: "Expected GRN Pattern",
          type: "text",
          required: true,
          defaultValue: "AUTO-{YYYY}-{###}",
          placeholder: "Use {YYYY} for year, {###} for sequence"
        },
        {
          id: "tolerance_percent",
          label: "Tolerance (%)",
          type: "number",
          required: true,
          defaultValue: 5,
          validation: { min: 0, max: 100 }
        }
      ]
    },
    {
      id: "loading",
      name: "Loading",
      description: "Load items for shipment",
      icon: "📤",
      color: "#06b6d4",
      bgColor: "#cffafe",
      category: "Outbound Task",
      compatibleLocationTypes: ["shipping_lane"],
      configurationFields: [
        {
          id: "loading_strategy",
          label: "Loading Strategy",
          type: "dropdown",
          required: true,
          defaultValue: "route_based",
          options: [
            { value: "route_based", label: "Route Based" },
            { value: "time_based", label: "Time Based" },
            { value: "capacity_based", label: "Capacity Based" }
          ]
        },
        {
          id: "seal_required",
          label: "Seal Required",
          type: "checkbox",
          required: false,
          defaultValue: true
        }
      ]
    },
    {
      id: "quality_check",
      name: "Quality Check",
      description: "Quality inspection process",
      icon: "🔍",
      color: "#f59e0b",
      bgColor: "#fef3c7",
      category: "Quality Task",
      compatibleLocationTypes: ["receiving_dock", "staging_area", "storage_location"],
      configurationFields: [
        {
          id: "inspection_type",
          label: "Inspection Type",
          type: "dropdown",
          required: true,
          defaultValue: "visual",
          options: [
            { value: "visual", label: "Visual" },
            { value: "sampling", label: "Sampling" },
            { value: "full", label: "Full Inspection" }
          ]
        },
        {
          id: "hold_on_failure",
          label: "Hold on Failure",
          type: "checkbox",
          required: false,
          defaultValue: true
        }
      ]
    },
    {
      id: "packing",
      name: "Packing",
      description: "Pack items for shipment",
      icon: "📦",
      color: "#8b5cf6",
      bgColor: "#ede9fe",
      category: "Outbound Task",
      compatibleLocationTypes: ["staging_area", "shipping_lane"],
      configurationFields: [
        {
          id: "packing_method",
          label: "Packing Method",
          type: "dropdown",
          required: true,
          defaultValue: "standard",
          options: [
            { value: "standard", label: "Standard" },
            { value: "fragile", label: "Fragile" },
            { value: "hazmat", label: "Hazmat" }
          ]
        },
        {
          id: "label_printing",
          label: "Label Printing",
          type: "checkbox",
          required: false,
          defaultValue: true
        }
      ]
    }
  ]
};