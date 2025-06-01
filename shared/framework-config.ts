import { z } from "zod";

// Field Type Enum
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
  allowMultiple: z.boolean().default(true),
  configurationFields: z.array(formFieldSchema)
});

// Location Task Type Definition
export const locationTaskTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  color: z.string(),
  bgColor: z.string(),
  category: z.string(),
  compatibleLocationTypes: z.array(z.string()),
  configurationFields: z.array(formFieldSchema)
});

// UI Configuration Schema
export const uiConfigSchema = z.object({
  appTitle: z.string(),
  warehouseLabel: z.string(),
  defaultWarehouseName: z.string(),
  libraryTitle: z.string(),
  searchPlaceholder: z.string(),
  tabs: z.object({
    locations: z.object({
      id: z.string(),
      label: z.string(),
      icon: z.string(),
      instruction: z.string()
    }),
    movements: z.object({
      id: z.string(),
      label: z.string(),
      icon: z.string(),
      instruction: z.string()
    }),
    tasks: z.object({
      id: z.string(),
      label: z.string(),
      icon: z.string(),
      instruction: z.string()
    })
  }),
  actions: z.object({
    newFlow: z.string(),
    saveFlow: z.string(),
    export: z.string(),
    undo: z.string(),
    redo: z.string(),
    configure: z.string(),
    addTask: z.string(),
    delete: z.string()
  }),
  messages: z.object({
    movementCreation: z.object({
      selectSource: z.string(),
      selectTarget: z.string()
    }),
    propertiesPanel: z.object({
      noSelection: z.string(),
      configured: z.string(),
      notConfigured: z.string()
    })
  })
});

// Framework Configuration Schema
export const frameworkConfigSchema = z.object({
  name: z.string(),
  version: z.string(),
  description: z.string(),
  ui: uiConfigSchema,
  locationNodeTypes: z.array(locationNodeTypeSchema),
  movementTaskTypes: z.array(movementTaskTypeSchema),
  locationTaskTypes: z.array(locationTaskTypeSchema)
});

// Type exports
export type FormField = z.infer<typeof formFieldSchema>;
export type LocationNodeType = z.infer<typeof locationNodeTypeSchema>;
export type MovementTaskType = z.infer<typeof movementTaskTypeSchema>;
export type LocationTaskType = z.infer<typeof locationTaskTypeSchema>;
export type UIConfig = z.infer<typeof uiConfigSchema>;
export type FrameworkConfig = z.infer<typeof frameworkConfigSchema>;

// Import the JSON configuration
import frameworkConfigJson from './framework-config.json';

export const defaultFrameworkConfig: FrameworkConfig = frameworkConfigJson as FrameworkConfig;