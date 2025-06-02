import {
  warehouseFlows,
  locationConfigurations,
  movementTaskConfigurations,
  locationTaskConfigurations,
  type WarehouseFlow,
  type InsertWarehouseFlow,
  type LocationConfiguration,
  type InsertLocationConfiguration,
  type MovementTaskConfiguration,
  type InsertMovementTaskConfiguration,
  type LocationTaskConfiguration,
  type InsertLocationTaskConfiguration,
} from "@shared/schema";

export interface IStorage {
  // Warehouse Flow methods
  getWarehouseFlow(id: number): Promise<WarehouseFlow | undefined>;
  getAllWarehouseFlows(): Promise<WarehouseFlow[]>;
  createWarehouseFlow(flow: InsertWarehouseFlow): Promise<WarehouseFlow>;
  updateWarehouseFlow(id: number, flow: Partial<InsertWarehouseFlow>): Promise<WarehouseFlow | undefined>;
  deleteWarehouseFlow(id: number): Promise<boolean>;

  // Location Configuration methods
  getLocationConfiguration(locationId: string): Promise<LocationConfiguration | undefined>;
  getLocationConfigurationsByFlow(flowId: number): Promise<LocationConfiguration[]>;
  createLocationConfiguration(config: InsertLocationConfiguration): Promise<LocationConfiguration>;
  updateLocationConfiguration(locationId: string, config: Partial<InsertLocationConfiguration>): Promise<LocationConfiguration | undefined>;
  deleteLocationConfiguration(locationId: string): Promise<boolean>;

  // Movement Task Configuration methods
  getMovementTaskConfiguration(edgeId: string): Promise<MovementTaskConfiguration | undefined>;
  getMovementTaskConfigurationsByFlow(flowId: number): Promise<MovementTaskConfiguration[]>;
  createMovementTaskConfiguration(config: InsertMovementTaskConfiguration): Promise<MovementTaskConfiguration>;
  updateMovementTaskConfiguration(edgeId: string, config: Partial<InsertMovementTaskConfiguration>): Promise<MovementTaskConfiguration | undefined>;
  deleteMovementTaskConfiguration(edgeId: string): Promise<boolean>;

  // Location Task Configuration methods
  getLocationTaskConfiguration(taskId: string): Promise<LocationTaskConfiguration | undefined>;
  getLocationTaskConfigurationsByFlow(flowId: number): Promise<LocationTaskConfiguration[]>;
  createLocationTaskConfiguration(config: InsertLocationTaskConfiguration): Promise<LocationTaskConfiguration>;
  updateLocationTaskConfiguration(taskId: string, config: Partial<InsertLocationTaskConfiguration>): Promise<LocationTaskConfiguration | undefined>;
  deleteLocationTaskConfiguration(taskId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private warehouseFlows: Map<number, WarehouseFlow>;
  private locationConfigurations: Map<string, LocationConfiguration>;
  private movementTaskConfigurations: Map<string, MovementTaskConfiguration>;
  private locationTaskConfigurations: Map<string, LocationTaskConfiguration>;
  private currentFlowId: number;
  private currentConfigId: number;

  constructor() {
    this.warehouseFlows = new Map();
    this.locationConfigurations = new Map();
    this.movementTaskConfigurations = new Map();
    this.locationTaskConfigurations = new Map();
    this.currentFlowId = 1;
    this.currentConfigId = 1;
  }

  // Warehouse Flow methods
  async getWarehouseFlow(id: number): Promise<WarehouseFlow | undefined> {
    return this.warehouseFlows.get(id);
  }

  async getAllWarehouseFlows(): Promise<WarehouseFlow[]> {
    return Array.from(this.warehouseFlows.values()).sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async createWarehouseFlow(insertFlow: InsertWarehouseFlow): Promise<WarehouseFlow> {
    const id = this.currentFlowId++;
    const now = new Date();
    
    const flow: WarehouseFlow = {
      ...insertFlow,
      id,
      createdAt: now,
      updatedAt: now,
    };
    
    this.warehouseFlows.set(id, flow);
    return flow;
  }

  async updateWarehouseFlow(id: number, updateData: Partial<InsertWarehouseFlow>): Promise<WarehouseFlow | undefined> {
    const existing = this.warehouseFlows.get(id);
    if (!existing) return undefined;

    const updated: WarehouseFlow = {
      ...existing,
      ...updateData,
      updatedAt: new Date(),
    };

    this.warehouseFlows.set(id, updated);
    return updated;
  }

  async deleteWarehouseFlow(id: number): Promise<boolean> {
    const deleted = this.warehouseFlows.delete(id);
    
    // Also delete associated configurations
    if (deleted) {
      for (const [locationId, config] of this.locationConfigurations.entries()) {
        if (config.flowId === id) {
          this.locationConfigurations.delete(locationId);
        }
      }
      for (const [edgeId, config] of this.movementTaskConfigurations.entries()) {
        if (config.flowId === id) {
          this.movementTaskConfigurations.delete(edgeId);
        }
      }
      for (const [taskId, config] of this.locationTaskConfigurations.entries()) {
        if (config.flowId === id) {
          this.locationTaskConfigurations.delete(taskId);
        }
      }
    }
    
    return deleted;
  }

  // Location Configuration methods
  async getLocationConfiguration(locationId: string): Promise<LocationConfiguration | undefined> {
    return this.locationConfigurations.get(locationId);
  }

  async getLocationConfigurationsByFlow(flowId: number): Promise<LocationConfiguration[]> {
    return Array.from(this.locationConfigurations.values()).filter(config => config.flowId === flowId);
  }

  async createLocationConfiguration(insertConfig: InsertLocationConfiguration): Promise<LocationConfiguration> {
    const id = this.currentConfigId++;
    const now = new Date();
    
    const config: LocationConfiguration = {
      ...insertConfig,
      id,
      createdAt: now,
      updatedAt: now,
    };
    
    this.locationConfigurations.set(insertConfig.locationId, config);
    return config;
  }

  async updateLocationConfiguration(locationId: string, updateData: Partial<InsertLocationConfiguration>): Promise<LocationConfiguration | undefined> {
    const existing = this.locationConfigurations.get(locationId);
    if (!existing) return undefined;

    const updated: LocationConfiguration = {
      ...existing,
      ...updateData,
      updatedAt: new Date(),
    };

    this.locationConfigurations.set(locationId, updated);
    return updated;
  }

  async deleteLocationConfiguration(locationId: string): Promise<boolean> {
    return this.locationConfigurations.delete(locationId);
  }

  // Movement Task Configuration methods
  async getMovementTaskConfiguration(edgeId: string): Promise<MovementTaskConfiguration | undefined> {
    return this.movementTaskConfigurations.get(edgeId);
  }

  async getMovementTaskConfigurationsByFlow(flowId: number): Promise<MovementTaskConfiguration[]> {
    return Array.from(this.movementTaskConfigurations.values()).filter(config => config.flowId === flowId);
  }

  async createMovementTaskConfiguration(insertConfig: InsertMovementTaskConfiguration): Promise<MovementTaskConfiguration> {
    const id = this.currentConfigId++;
    const now = new Date();
    
    const config: MovementTaskConfiguration = {
      ...insertConfig,
      id,
      createdAt: now,
      updatedAt: now,
    };
    
    this.movementTaskConfigurations.set(insertConfig.edgeId, config);
    return config;
  }

  async updateMovementTaskConfiguration(edgeId: string, updateData: Partial<InsertMovementTaskConfiguration>): Promise<MovementTaskConfiguration | undefined> {
    const existing = this.movementTaskConfigurations.get(edgeId);
    if (!existing) return undefined;

    const updated: MovementTaskConfiguration = {
      ...existing,
      ...updateData,
      updatedAt: new Date(),
    };

    this.movementTaskConfigurations.set(edgeId, updated);
    return updated;
  }

  async deleteMovementTaskConfiguration(edgeId: string): Promise<boolean> {
    return this.movementTaskConfigurations.delete(edgeId);
  }

  // Location Task Configuration methods
  async getLocationTaskConfiguration(taskId: string): Promise<LocationTaskConfiguration | undefined> {
    return this.locationTaskConfigurations.get(taskId);
  }

  async getLocationTaskConfigurationsByFlow(flowId: number): Promise<LocationTaskConfiguration[]> {
    return Array.from(this.locationTaskConfigurations.values()).filter(config => config.flowId === flowId);
  }

  async createLocationTaskConfiguration(insertConfig: InsertLocationTaskConfiguration): Promise<LocationTaskConfiguration> {
    const id = this.currentConfigId++;
    const now = new Date();
    
    const config: LocationTaskConfiguration = {
      ...insertConfig,
      id,
      createdAt: now,
      updatedAt: now,
    };
    
    this.locationTaskConfigurations.set(insertConfig.taskId, config);
    return config;
  }

  async updateLocationTaskConfiguration(taskId: string, updateData: Partial<InsertLocationTaskConfiguration>): Promise<LocationTaskConfiguration | undefined> {
    const existing = this.locationTaskConfigurations.get(taskId);
    if (!existing) return undefined;

    const updated: LocationTaskConfiguration = {
      ...existing,
      ...updateData,
      updatedAt: new Date(),
    };

    this.locationTaskConfigurations.set(taskId, updated);
    return updated;
  }

  async deleteLocationTaskConfiguration(taskId: string): Promise<boolean> {
    return this.locationTaskConfigurations.delete(taskId);
  }
}

export const storage = new MemStorage();
