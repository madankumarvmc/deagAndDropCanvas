import {
  processFlows,
  nodeConfigurations,
  type ProcessFlow,
  type InsertProcessFlow,
  type NodeConfiguration,
  type InsertNodeConfiguration,
} from "@shared/schema";

export interface IStorage {
  // Process Flow methods
  getProcessFlow(id: number): Promise<ProcessFlow | undefined>;
  getAllProcessFlows(): Promise<ProcessFlow[]>;
  createProcessFlow(flow: InsertProcessFlow): Promise<ProcessFlow>;
  updateProcessFlow(id: number, flow: Partial<InsertProcessFlow>): Promise<ProcessFlow | undefined>;
  deleteProcessFlow(id: number): Promise<boolean>;

  // Node Configuration methods
  getNodeConfiguration(nodeId: string): Promise<NodeConfiguration | undefined>;
  getNodeConfigurationsByFlow(flowId: number): Promise<NodeConfiguration[]>;
  createNodeConfiguration(config: InsertNodeConfiguration): Promise<NodeConfiguration>;
  updateNodeConfiguration(nodeId: string, config: Partial<InsertNodeConfiguration>): Promise<NodeConfiguration | undefined>;
  deleteNodeConfiguration(nodeId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private processFlows: Map<number, ProcessFlow>;
  private nodeConfigurations: Map<string, NodeConfiguration>;
  private currentFlowId: number;
  private currentConfigId: number;

  constructor() {
    this.processFlows = new Map();
    this.nodeConfigurations = new Map();
    this.currentFlowId = 1;
    this.currentConfigId = 1;
  }

  // Process Flow methods
  async getProcessFlow(id: number): Promise<ProcessFlow | undefined> {
    return this.processFlows.get(id);
  }

  async getAllProcessFlows(): Promise<ProcessFlow[]> {
    return Array.from(this.processFlows.values()).sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async createProcessFlow(insertFlow: InsertProcessFlow): Promise<ProcessFlow> {
    const id = this.currentFlowId++;
    const now = new Date();
    
    const flow: ProcessFlow = {
      ...insertFlow,
      id,
      createdAt: now,
      updatedAt: now,
    };
    
    this.processFlows.set(id, flow);
    return flow;
  }

  async updateProcessFlow(id: number, updateData: Partial<InsertProcessFlow>): Promise<ProcessFlow | undefined> {
    const existing = this.processFlows.get(id);
    if (!existing) return undefined;

    const updated: ProcessFlow = {
      ...existing,
      ...updateData,
      updatedAt: new Date(),
    };

    this.processFlows.set(id, updated);
    return updated;
  }

  async deleteProcessFlow(id: number): Promise<boolean> {
    const deleted = this.processFlows.delete(id);
    
    // Also delete associated node configurations
    if (deleted) {
      for (const [nodeId, config] of this.nodeConfigurations.entries()) {
        if (config.flowId === id) {
          this.nodeConfigurations.delete(nodeId);
        }
      }
    }
    
    return deleted;
  }

  // Node Configuration methods
  async getNodeConfiguration(nodeId: string): Promise<NodeConfiguration | undefined> {
    return this.nodeConfigurations.get(nodeId);
  }

  async getNodeConfigurationsByFlow(flowId: number): Promise<NodeConfiguration[]> {
    return Array.from(this.nodeConfigurations.values()).filter(config => config.flowId === flowId);
  }

  async createNodeConfiguration(insertConfig: InsertNodeConfiguration): Promise<NodeConfiguration> {
    const id = this.currentConfigId++;
    const now = new Date();
    
    const config: NodeConfiguration = {
      ...insertConfig,
      id,
      createdAt: now,
      updatedAt: now,
    };
    
    this.nodeConfigurations.set(insertConfig.nodeId, config);
    return config;
  }

  async updateNodeConfiguration(nodeId: string, updateData: Partial<InsertNodeConfiguration>): Promise<NodeConfiguration | undefined> {
    const existing = this.nodeConfigurations.get(nodeId);
    if (!existing) return undefined;

    const updated: NodeConfiguration = {
      ...existing,
      ...updateData,
      updatedAt: new Date(),
    };

    this.nodeConfigurations.set(nodeId, updated);
    return updated;
  }

  async deleteNodeConfiguration(nodeId: string): Promise<boolean> {
    return this.nodeConfigurations.delete(nodeId);
  }
}

export const storage = new MemStorage();
