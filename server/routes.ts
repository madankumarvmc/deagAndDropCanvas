import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import {
  insertWarehouseFlowSchema,
  insertLocationConfigurationSchema,
  insertMovementTaskConfigurationSchema,
  insertLocationTaskConfigurationSchema,
} from "@shared/schema";
import { defaultFrameworkConfig } from "@shared/framework-config";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Warehouse Flow routes
  app.get("/api/warehouse-flows", async (req, res) => {
    try {
      const flows = await storage.getAllWarehouseFlows();
      res.json(flows);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch warehouse flows" });
    }
  });

  app.get("/api/warehouse-flows/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid flow ID" });
      }

      const flow = await storage.getWarehouseFlow(id);
      if (!flow) {
        return res.status(404).json({ message: "Warehouse flow not found" });
      }

      res.json(flow);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch warehouse flow" });
    }
  });

  app.post("/api/warehouse-flows", async (req, res) => {
    try {
      const validatedData = insertWarehouseFlowSchema.parse(req.body);
      const flow = await storage.createWarehouseFlow(validatedData);
      res.status(201).json(flow);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create warehouse flow" });
    }
  });

  app.put("/api/warehouse-flows/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid flow ID" });
      }

      const validatedData = insertWarehouseFlowSchema.partial().parse(req.body);
      const flow = await storage.updateWarehouseFlow(id, validatedData);
      
      if (!flow) {
        return res.status(404).json({ message: "Warehouse flow not found" });
      }

      res.json(flow);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update warehouse flow" });
    }
  });

  app.delete("/api/warehouse-flows/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid flow ID" });
      }

      const deleted = await storage.deleteWarehouseFlow(id);
      if (!deleted) {
        return res.status(404).json({ message: "Warehouse flow not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete warehouse flow" });
    }
  });

  // Location Configuration routes
  app.post("/api/locations/config", async (req, res) => {
    try {
      const validatedData = insertLocationConfigurationSchema.parse(req.body);
      const config = await storage.createLocationConfiguration(validatedData);
      res.status(201).json(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid configuration", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create location configuration" });
    }
  });

  app.put("/api/locations/:locationId/config", async (req, res) => {
    try {
      const { locationId } = req.params;
      const validatedData = insertLocationConfigurationSchema.partial().parse(req.body);
      const config = await storage.updateLocationConfiguration(locationId, validatedData);
      
      if (!config) {
        return res.status(404).json({ message: "Location configuration not found" });
      }

      res.json(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid configuration", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update location configuration" });
    }
  });

  // Movement Task Configuration routes
  app.post("/api/movement-tasks/config", async (req, res) => {
    try {
      const validatedData = insertMovementTaskConfigurationSchema.parse(req.body);
      const config = await storage.createMovementTaskConfiguration(validatedData);
      res.status(201).json(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid configuration", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create movement task configuration" });
    }
  });

  app.put("/api/movement-tasks/:edgeId/config", async (req, res) => {
    try {
      const { edgeId } = req.params;
      const validatedData = insertMovementTaskConfigurationSchema.partial().parse(req.body);
      const config = await storage.updateMovementTaskConfiguration(edgeId, validatedData);
      
      if (!config) {
        return res.status(404).json({ message: "Movement task configuration not found" });
      }

      res.json(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid configuration", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update movement task configuration" });
    }
  });

  // Location Task Configuration routes
  app.post("/api/location-tasks/config", async (req, res) => {
    try {
      const validatedData = insertLocationTaskConfigurationSchema.parse(req.body);
      const config = await storage.createLocationTaskConfiguration(validatedData);
      res.status(201).json(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid configuration", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create location task configuration" });
    }
  });

  app.put("/api/location-tasks/:taskId/config", async (req, res) => {
    try {
      const { taskId } = req.params;
      const validatedData = insertLocationTaskConfigurationSchema.partial().parse(req.body);
      const config = await storage.updateLocationTaskConfiguration(taskId, validatedData);
      
      if (!config) {
        return res.status(404).json({ message: "Location task configuration not found" });
      }

      res.json(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid configuration", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update location task configuration" });
    }
  });

  // Framework Configuration route
  app.get("/api/framework-config", async (req, res) => {
    try {
      res.json(defaultFrameworkConfig);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch framework configuration" });
    }
  });

  // Default Warehouse Flow route
  app.get("/api/default-warehouse-flow", async (req, res) => {
    try {
      const defaultFlow = require("../shared/default-warehouse-flow.json");
      res.json(defaultFlow);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch default warehouse flow" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
