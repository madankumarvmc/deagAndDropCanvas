import { create } from 'zustand';
import { type Node, type Edge, type Viewport } from 'reactflow';
import { type NodeType, type FlowData } from '@shared/schema';

interface FlowState {
  // Flow data
  currentFlowId: number | null;
  nodes: Node[];
  edges: Edge[];
  viewport: Viewport;
  
  // UI state
  selectedNodeId: string | null;
  isConfigModalOpen: boolean;
  draggedNodeType: NodeType | null;
  projectName: string;
  
  // Actions
  setCurrentFlowId: (id: number | null) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setViewport: (viewport: Viewport) => void;
  setSelectedNodeId: (id: string | null) => void;
  setConfigModalOpen: (open: boolean) => void;
  setDraggedNodeType: (type: NodeType | null) => void;
  setProjectName: (name: string) => void;
  
  // Flow operations
  addNode: (nodeType: NodeType, position: { x: number; y: number }) => void;
  updateNode: (id: string, data: any) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: Edge) => void;
  deleteEdge: (id: string) => void;
  
  // Utility
  getFlowData: () => FlowData;
  loadFlowData: (data: FlowData) => void;
  clearFlow: () => void;
}

const generateNodeId = () => `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateEdgeId = () => `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const getNodeConfig = (nodeType: NodeType) => {
  const configs = {
    receiving: {
      label: 'Receiving',
      icon: '🚛',
      color: '#10b981',
      bgColor: '#dcfce7',
      borderColor: '#16a34a',
    },
    palletization: {
      label: 'Palletization',
      icon: '📦',
      color: '#3b82f6',
      bgColor: '#dbeafe',
      borderColor: '#2563eb',
    },
    putaway: {
      label: 'Putaway',
      icon: '🏪',
      color: '#8b5cf6',
      bgColor: '#ede9fe',
      borderColor: '#7c3aed',
    },
    replenishment: {
      label: 'Replenishment',
      icon: '🔄',
      color: '#f59e0b',
      bgColor: '#fef3c7',
      borderColor: '#d97706',
    },
    picking: {
      label: 'Picking',
      icon: '✋',
      color: '#ef4444',
      bgColor: '#fee2e2',
      borderColor: '#dc2626',
    },
    loading: {
      label: 'Loading',
      icon: '🚚',
      color: '#06b6d4',
      bgColor: '#cffafe',
      borderColor: '#0891b2',
    },
  };
  
  return configs[nodeType] || configs.receiving;
};

export const useFlowStore = create<FlowState>((set, get) => ({
  // Initial state
  currentFlowId: null,
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  selectedNodeId: null,
  isConfigModalOpen: false,
  draggedNodeType: null,
  projectName: 'Warehouse Alpha',
  
  // Actions
  setCurrentFlowId: (id) => set({ currentFlowId: id }),
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setViewport: (viewport) => set({ viewport }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setConfigModalOpen: (open) => set({ isConfigModalOpen: open }),
  setDraggedNodeType: (type) => set({ draggedNodeType: type }),
  setProjectName: (name) => set({ projectName: name }),
  
  // Flow operations
  addNode: (nodeType, position) => {
    const config = getNodeConfig(nodeType);
    const newNode: Node = {
      id: generateNodeId(),
      type: 'wmsProcess',
      position,
      data: {
        nodeType,
        label: config.label,
        icon: config.icon,
        color: config.color,
        bgColor: config.bgColor,
        borderColor: config.borderColor,
        config: null,
      },
    };
    
    set((state) => ({ 
      nodes: [...state.nodes, newNode],
      selectedNodeId: newNode.id,
    }));
  },
  
  updateNode: (id, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      ),
    }));
  },
  
  deleteNode: (id) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    }));
  },
  
  addEdge: (edge) => {
    const edgeWithId = { ...edge, id: generateEdgeId() };
    set((state) => ({ edges: [...state.edges, edgeWithId] }));
  },
  
  deleteEdge: (id) => {
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== id),
    }));
  },
  
  // Utility
  getFlowData: () => {
    const { nodes, edges, viewport } = get();
    return { nodes, edges, viewport };
  },
  
  loadFlowData: (data) => {
    set({
      nodes: data.nodes || [],
      edges: data.edges || [],
      viewport: data.viewport || { x: 0, y: 0, zoom: 1 },
    });
  },
  
  clearFlow: () => {
    set({
      currentFlowId: null,
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      selectedNodeId: null,
    });
  },
}));
