import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import {
  insertProcessFlowSchema,
  insertNodeConfigurationSchema,
  receivingConfigSchema,
  palletizationConfigSchema,
  putawayConfigSchema,
  replenishmentConfigSchema,
  pickingConfigSchema,
  loadingConfigSchema,
  NODE_TYPES,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Process Flow routes
  app.get("/api/flows", async (req, res) => {
    try {
      const flows = await storage.getAllProcessFlows();
      res.json(flows);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch process flows" });
    }
  });

  app.get("/api/flows/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid flow ID" });
      }

      const flow = await storage.getProcessFlow(id);
      if (!flow) {
        return res.status(404).json({ message: "Process flow not found" });
      }

      res.json(flow);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch process flow" });
    }
  });

  app.post("/api/flows", async (req, res) => {
    try {
      const validatedData = insertProcessFlowSchema.parse(req.body);
      const flow = await storage.createProcessFlow(validatedData);
      res.status(201).json(flow);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create process flow" });
    }
  });

  app.put("/api/flows/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid flow ID" });
      }

      const validatedData = insertProcessFlowSchema.partial().parse(req.body);
      const flow = await storage.updateProcessFlow(id, validatedData);
      
      if (!flow) {
        return res.status(404).json({ message: "Process flow not found" });
      }

      res.json(flow);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update process flow" });
    }
  });

  app.delete("/api/flows/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid flow ID" });
      }

      const deleted = await storage.deleteProcessFlow(id);
      if (!deleted) {
        return res.status(404).json({ message: "Process flow not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete process flow" });
    }
  });

  // Node Configuration routes
  app.get("/api/nodes/:nodeId/config", async (req, res) => {
    try {
      const { nodeId } = req.params;
      const config = await storage.getNodeConfiguration(nodeId);
      
      if (!config) {
        return res.status(404).json({ message: "Node configuration not found" });
      }

      res.json(config);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch node configuration" });
    }
  });

  app.get("/api/flows/:flowId/nodes", async (req, res) => {
    try {
      const flowId = parseInt(req.params.flowId);
      if (isNaN(flowId)) {
        return res.status(400).json({ message: "Invalid flow ID" });
      }

      const configs = await storage.getNodeConfigurationsByFlow(flowId);
      res.json(configs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch node configurations" });
    }
  });

  app.post("/api/nodes/config", async (req, res) => {
    try {
      // Validate basic structure
      const validatedData = insertNodeConfigurationSchema.parse(req.body);
      
      // Validate configuration based on node type
      const { nodeType, configuration } = validatedData;
      let validatedConfig;

      switch (nodeType) {
        case NODE_TYPES.RECEIVING:
          validatedConfig = receivingConfigSchema.parse(configuration);
          break;
        case NODE_TYPES.PALLETIZATION:
          validatedConfig = palletizationConfigSchema.parse(configuration);
          break;
        case NODE_TYPES.PUTAWAY:
          validatedConfig = putawayConfigSchema.parse(configuration);
          break;
        case NODE_TYPES.REPLENISHMENT:
          validatedConfig = replenishmentConfigSchema.parse(configuration);
          break;
        case NODE_TYPES.PICKING:
          validatedConfig = pickingConfigSchema.parse(configuration);
          break;
        case NODE_TYPES.LOADING:
          validatedConfig = loadingConfigSchema.parse(configuration);
          break;
        default:
          return res.status(400).json({ message: "Invalid node type" });
      }

      const configData = {
        ...validatedData,
        configuration: validatedConfig,
      };

      const config = await storage.createNodeConfiguration(configData);
      res.status(201).json(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid configuration", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create node configuration" });
    }
  });

  app.put("/api/nodes/:nodeId/config", async (req, res) => {
    try {
      const { nodeId } = req.params;
      
      // Get existing config to determine node type
      const existing = await storage.getNodeConfiguration(nodeId);
      if (!existing) {
        return res.status(404).json({ message: "Node configuration not found" });
      }

      const validatedData = insertNodeConfigurationSchema.partial().parse(req.body);
      
      // If configuration is being updated, validate it
      if (validatedData.configuration) {
        const nodeType = validatedData.nodeType || existing.nodeType;
        let validatedConfig;

        switch (nodeType) {
          case NODE_TYPES.RECEIVING:
            validatedConfig = receivingConfigSchema.parse(validatedData.configuration);
            break;
          case NODE_TYPES.PALLETIZATION:
            validatedConfig = palletizationConfigSchema.parse(validatedData.configuration);
            break;
          case NODE_TYPES.PUTAWAY:
            validatedConfig = putawayConfigSchema.parse(validatedData.configuration);
            break;
          case NODE_TYPES.REPLENISHMENT:
            validatedConfig = replenishmentConfigSchema.parse(validatedData.configuration);
            break;
          case NODE_TYPES.PICKING:
            validatedConfig = pickingConfigSchema.parse(validatedData.configuration);
            break;
          case NODE_TYPES.LOADING:
            validatedConfig = loadingConfigSchema.parse(validatedData.configuration);
            break;
          default:
            return res.status(400).json({ message: "Invalid node type" });
        }

        validatedData.configuration = validatedConfig;
      }

      const config = await storage.updateNodeConfiguration(nodeId, validatedData);
      if (!config) {
        return res.status(404).json({ message: "Node configuration not found" });
      }

      res.json(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid configuration", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update node configuration" });
    }
  });

  app.delete("/api/nodes/:nodeId/config", async (req, res) => {
    try {
      const { nodeId } = req.params;
      const deleted = await storage.deleteNodeConfiguration(nodeId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Node configuration not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete node configuration" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
