import { create } from 'zustand';
import { type Node, type Edge, type Viewport } from 'reactflow';
import { type WarehouseFlowData, type MovementTaskSelection } from '@shared/schema';
import { type FrameworkConfig, type LocationNodeType, type MovementTaskType, type LocationTaskType, defaultFrameworkConfig } from '@shared/framework-config';

interface WarehouseState {
  // Current flow data
  currentFlowId: number | null;
  warehouseName: string;
  frameworkConfig: FrameworkConfig;
  
  // React Flow data
  locationNodes: Node[];
  movementEdges: Edge[];
  viewport: Viewport;
  
  // UI state
  selectedElementId: string | null;
  selectedElementType: 'location' | 'movement' | 'locationTask' | null;
  isConfigModalOpen: boolean;
  isPropertiesPanelOpen: boolean;
  isSidebarCollapsed: boolean;
  draggedLocationTypeId: string | null;
  isCreatingMovementTask: boolean;
  pendingMovementTask: MovementTaskSelection | null;
  
  // Actions
  setCurrentFlowId: (id: number | null) => void;
  setWarehouseName: (name: string) => void;
  setFrameworkConfig: (config: FrameworkConfig) => void;
  setLocationNodes: (nodes: Node[]) => void;
  setMovementEdges: (edges: Edge[]) => void;
  setViewport: (viewport: Viewport) => void;
  setSelectedElement: (id: string | null, type: 'location' | 'movement' | 'locationTask' | null) => void;
  setConfigModalOpen: (open: boolean) => void;
  setPropertiesPanelOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setDraggedLocationTypeId: (typeId: string | null) => void;
  setCreatingMovementTask: (creating: boolean) => void;
  setPendingMovementTask: (task: MovementTaskSelection | null) => void;
  
  // Location operations
  addLocationNode: (locationTypeId: string, position: { x: number; y: number }) => void;
  updateLocationNode: (id: string, data: any) => void;
  deleteLocationNode: (id: string) => void;
  
  // Movement task operations
  addMovementEdge: (sourceId: string, targetId: string, taskTypeId: string) => void;
  updateMovementEdge: (id: string, data: any) => void;
  deleteMovementEdge: (id: string) => void;
  
  // Location task operations
  addLocationTask: (locationId: string, taskTypeId: string) => void;
  updateLocationTask: (locationId: string, taskId: string, data: any) => void;
  deleteLocationTask: (locationId: string, taskId: string) => void;
  
  // Framework helpers
  getLocationNodeType: (typeId: string) => LocationNodeType | undefined;
  getMovementTaskType: (typeId: string) => MovementTaskType | undefined;
  getLocationTaskType: (typeId: string) => LocationTaskType | undefined;
  
  // Utility
  getWarehouseFlowData: () => WarehouseFlowData;
  loadWarehouseFlowData: (data: WarehouseFlowData) => void;
  clearWarehouse: () => void;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useWarehouseStore = create<WarehouseState>((set, get) => ({
  // Initial state
  currentFlowId: null,
  warehouseName: 'Default Warehouse',
  frameworkConfig: defaultFrameworkConfig as FrameworkConfig,
  locationNodes: [],
  movementEdges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  selectedElementId: null,
  selectedElementType: null,
  isConfigModalOpen: false,
  isPropertiesPanelOpen: false,
  isSidebarCollapsed: false,
  draggedLocationTypeId: null,
  isCreatingMovementTask: false,
  pendingMovementTask: null,
  
  // Actions
  setCurrentFlowId: (id) => set({ currentFlowId: id }),
  setWarehouseName: (name) => set({ warehouseName: name }),
  setFrameworkConfig: (config) => set({ frameworkConfig: config }),
  setLocationNodes: (nodes) => set({ locationNodes: nodes }),
  setMovementEdges: (edges) => set({ movementEdges: edges }),
  setViewport: (viewport) => set({ viewport }),
  setSelectedElement: (id, type) => set({ 
    selectedElementId: id, 
    selectedElementType: type,
    isPropertiesPanelOpen: id !== null // Auto-open panel when element is selected
  }),
  setConfigModalOpen: (open) => set({ isConfigModalOpen: open }),
  setPropertiesPanelOpen: (open) => set({ isPropertiesPanelOpen: open }),
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setDraggedLocationTypeId: (typeId) => set({ draggedLocationTypeId: typeId }),
  setCreatingMovementTask: (creating) => set({ isCreatingMovementTask: creating }),
  setPendingMovementTask: (task) => set({ pendingMovementTask: task }),
  
  // Location operations
  addLocationNode: (locationTypeId, position) => {
    const { frameworkConfig } = get();
    const locationType = frameworkConfig.locationNodeTypes.find(type => type.id === locationTypeId);
    
    if (!locationType) return;
    
    const newNode: Node = {
      id: generateId(),
      type: 'warehouseLocation',
      position,
      data: {
        locationTypeId,
        locationName: locationType.name,
        icon: locationType.icon,
        color: locationType.color,
        bgColor: locationType.bgColor,
        borderColor: locationType.borderColor,
        category: locationType.category,
        configuration: null,
        locationTasks: [],
      },
    };
    
    set((state) => ({ 
      locationNodes: [...state.locationNodes, newNode],
      selectedElementId: newNode.id,
      selectedElementType: 'location',
    }));
  },
  
  updateLocationNode: (id, data) => {
    set((state) => ({
      locationNodes: state.locationNodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      ),
    }));
  },
  
  deleteLocationNode: (id) => {
    set((state) => ({
      locationNodes: state.locationNodes.filter((node) => node.id !== id),
      movementEdges: state.movementEdges.filter((edge) => edge.source !== id && edge.target !== id),
      selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
    }));
  },
  
  // Movement task operations
  addMovementEdge: (sourceId, targetId, taskTypeId) => {
    const { frameworkConfig } = get();
    const taskType = frameworkConfig.movementTaskTypes.find(type => type.id === taskTypeId);
    
    if (!taskType) return;
    
    const newEdge: Edge = {
      id: generateId(),
      source: sourceId,
      target: targetId,
      type: 'movementTask',
      data: {
        taskTypeId,
        taskName: taskType.name,
        icon: taskType.icon,
        color: taskType.color,
        category: taskType.category,
        configuration: null,
      },
      style: { stroke: taskType.color, strokeWidth: 2 },
      animated: true,
    };
    
    set((state) => ({ 
      movementEdges: [...state.movementEdges, newEdge],
      selectedElementId: newEdge.id,
      selectedElementType: 'movement',
      isCreatingMovementTask: false,
      pendingMovementTask: null,
    }));
  },
  
  updateMovementEdge: (id, data) => {
    set((state) => ({
      movementEdges: state.movementEdges.map((edge) =>
        edge.id === id ? { ...edge, data: { ...edge.data, ...data } } : edge
      ),
    }));
  },
  
  deleteMovementEdge: (id) => {
    set((state) => ({
      movementEdges: state.movementEdges.filter((edge) => edge.id !== id),
      selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
    }));
  },
  
  // Location task operations
  addLocationTask: (locationId, taskTypeId) => {
    const { frameworkConfig, locationNodes, movementEdges } = get();
    const taskType = frameworkConfig.locationTaskTypes.find(type => type.id === taskTypeId);
    const parentLocation = locationNodes.find(node => node.id === locationId);
    
    if (!taskType || !parentLocation) return;
    
    const taskId = generateId();
    const edgeId = generateId();
    
    // Create new task node positioned below the parent location
    const taskNode: Node = {
      id: taskId,
      type: 'locationTask',
      position: {
        x: parentLocation.position.x,
        y: parentLocation.position.y + 120 + (parentLocation.data.taskCount || 0) * 60,
      },
      data: {
        taskTypeId,
        taskName: taskType.name,
        icon: taskType.icon,
        color: taskType.color,
        bgColor: taskType.bgColor,
        borderColor: taskType.color,
        category: taskType.category,
        parentLocationId: locationId,
        configuration: null,
      },
    };
    
    // Create edge connecting location to task
    const taskEdge: Edge = {
      id: edgeId,
      source: locationId,
      target: taskId,
      type: 'locationTask',
      data: {},
    };
    
    set((state) => ({
      locationNodes: [
        ...state.locationNodes.map(node => 
          node.id === locationId 
            ? { ...node, data: { ...node.data, taskCount: (node.data.taskCount || 0) + 1 } }
            : node
        ),
        taskNode,
      ],
      movementEdges: [...state.movementEdges, taskEdge],
      selectedElementId: taskId,
      selectedElementType: 'locationTask',
    }));
  },
  
  updateLocationTask: (locationId, taskId, data) => {
    set((state) => ({
      locationNodes: state.locationNodes.map((node) =>
        node.id === taskId 
          ? { ...node, data: { ...node.data, ...data } }
          : node
      ),
    }));
  },
  
  deleteLocationTask: (locationId, taskId) => {
    set((state) => ({
      locationNodes: state.locationNodes.filter(node => node.id !== taskId),
      movementEdges: state.movementEdges.filter(edge => 
        !(edge.source === locationId && edge.target === taskId && edge.type === 'locationTask')
      ),
      selectedElementId: state.selectedElementId === taskId ? null : state.selectedElementId,
    }));
  },
  
  // Framework helpers
  getLocationNodeType: (typeId) => {
    const { frameworkConfig } = get();
    return frameworkConfig.locationNodeTypes.find(type => type.id === typeId);
  },
  
  getMovementTaskType: (typeId) => {
    const { frameworkConfig } = get();
    return frameworkConfig.movementTaskTypes.find(type => type.id === typeId);
  },
  
  getLocationTaskType: (typeId) => {
    const { frameworkConfig } = get();
    return frameworkConfig.locationTaskTypes.find(type => type.id === typeId);
  },
  
  // Utility
  getWarehouseFlowData: () => {
    const { locationNodes, movementEdges, viewport } = get();
    return { 
      locationNodes: locationNodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data
      })),
      movementEdges: movementEdges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type || 'movementTask',
        data: edge.data
      })),
      viewport 
    };
  },
  
  loadWarehouseFlowData: (data) => {
    const nodes: Node[] = data.locationNodes.map(nodeData => ({
      id: nodeData.id,
      type: nodeData.type,
      position: nodeData.position,
      data: nodeData.data
    }));
    
    const edges: Edge[] = data.movementEdges.map(edgeData => ({
      id: edgeData.id,
      source: edgeData.source,
      target: edgeData.target,
      type: edgeData.type,
      data: edgeData.data,
      style: { stroke: edgeData.data.color, strokeWidth: 2 },
      animated: true,
    }));
    
    set({
      locationNodes: nodes,
      movementEdges: edges,
      viewport: data.viewport || { x: 0, y: 0, zoom: 1 },
    });
  },
  
  clearWarehouse: () => {
    set({
      currentFlowId: null,
      locationNodes: [],
      movementEdges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      selectedElementId: null,
      selectedElementType: null,
    });
  },
}));