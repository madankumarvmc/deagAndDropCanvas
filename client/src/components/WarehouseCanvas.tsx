import React, { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
  EdgeTypes,
  OnConnect,
  OnNodesChange,
  OnEdgesChange,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useWarehouseStore } from '@/stores/warehouseStore';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import LocationNode from './LocationNode';
import TaskNode from './TaskNode';
import MovementTaskEdge from './MovementTaskEdge';
import LocationTaskEdge from './LocationTaskEdge';

// Define nodeTypes and edgeTypes outside component to prevent recreation
const nodeTypes: NodeTypes = {
  warehouseLocation: LocationNode,
  locationTask: TaskNode,
};

const edgeTypes: EdgeTypes = {
  movementTask: MovementTaskEdge,
  locationTask: LocationTaskEdge,
};

export default function WarehouseCanvas() {
  const {
    locationNodes,
    movementEdges,
    viewport,
    setLocationNodes,
    setMovementEdges,
    setViewport,
    addLocationNode,
    draggedLocationTypeId,
    setDraggedLocationTypeId,
    addMovementEdge,
    isCreatingMovementTask,
    pendingMovementTask,
    setPendingMovementTask,
    setCreatingMovementTask,
  } = useWarehouseStore();

  const [nodes, setNodes, onNodesChange] = useNodesState(locationNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(movementEdges);
  const { fitView, setViewport: setReactFlowViewport } = useReactFlow();

  // Auto-fit view when nodes are added or updated
  useEffect(() => {
    if (nodes.length > 0) {
      // Delay to ensure nodes are rendered
      setTimeout(() => {
        fitView({ 
          padding: 0.2,
          minZoom: 0.5,
          maxZoom: 1.2,
          duration: 500
        });
      }, 100);
    }
  }, [nodes.length, fitView]);

  // Sync store with local state
  React.useEffect(() => {
    setNodes(locationNodes);
  }, [locationNodes, setNodes]);

  React.useEffect(() => {
    setEdges(movementEdges);
  }, [movementEdges, setEdges]);

  // Load default warehouse flow
  const loadDefaultFlow = async () => {
    try {
      const response = await fetch('/api/default-warehouse-flow');
      if (!response.ok) {
        throw new Error('Failed to load default flow');
      }
      const responseData = await response.json();
      
      // Handle the default property wrapper from API response
      const defaultFlow = responseData.default || responseData;
      
      // Clear existing nodes and edges
      setLocationNodes([]);
      setMovementEdges([]);
      
      // Load the default flow data
      setLocationNodes(defaultFlow.locationNodes);
      setMovementEdges(defaultFlow.movementEdges);
      
      // Set viewport if provided
      if (defaultFlow.viewport) {
        setViewport(defaultFlow.viewport);
        setTimeout(() => {
          setReactFlowViewport(defaultFlow.viewport);
        }, 100);
      }
      
      // Auto-fit view after loading
      setTimeout(() => {
        fitView({ 
          padding: 0.2,
          minZoom: 0.5,
          maxZoom: 1.2,
          duration: 800
        });
      }, 200);
      
    } catch (error) {
      console.error('Error loading default flow:', error);
    }
  };

  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target && pendingMovementTask) {
        addMovementEdge(params.source, params.target, pendingMovementTask.taskTypeId);
      }
    },
    [addMovementEdge, pendingMovementTask]
  );

  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      // Update store with position changes
      setLocationNodes(nodes);
    },
    [onNodesChange, nodes, setLocationNodes]
  );

  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
      // Update store with changes
      setMovementEdges(edges);
    },
    [onEdgesChange, edges, setMovementEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!draggedLocationTypeId) return;

      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      addLocationNode(draggedLocationTypeId, position);
      setDraggedLocationTypeId(null);
    },
    [draggedLocationTypeId, addLocationNode, setDraggedLocationTypeId]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (isCreatingMovementTask && pendingMovementTask) {
        if (!pendingMovementTask.sourceLocationId) {
          setPendingMovementTask({
            ...pendingMovementTask,
            sourceLocationId: node.id,
          });
        } else if (pendingMovementTask.sourceLocationId !== node.id) {
          addMovementEdge(
            pendingMovementTask.sourceLocationId,
            node.id,
            pendingMovementTask.taskTypeId
          );
          setPendingMovementTask(null);
          setCreatingMovementTask(false);
        }
      }
    },
    [
      isCreatingMovementTask,
      pendingMovementTask,
      setPendingMovementTask,
      addMovementEdge,
      setCreatingMovementTask,
    ]
  );

  return (
    <div className="flex-1 relative h-full w-full" style={{ height: '100%', width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        minZoom={0.3}
        maxZoom={2}
        className="bg-gray-50 w-full h-full"
      >
        <Controls 
          showFitView={true}
          fitViewOptions={{ 
            padding: 0.2,
            minZoom: 0.5,
            maxZoom: 1.2,
            duration: 500
          }}
        />
        <MiniMap 
          nodeColor={(node) => {
            if (node.type === 'warehouseLocation') {
              return node.data?.color || '#64748b';
            }
            return '#64748b';
          }}
          className="bg-white border border-gray-200"
        />
        <Background gap={20} size={1} color="#d1d5db" />
      </ReactFlow>
      
      {/* Load Default Flow Button */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          onClick={loadDefaultFlow}
          variant="outline"
          size="sm"
          className="bg-white/90 hover:bg-white border-gray-300 shadow-sm"
        >
          <FileText className="h-4 w-4 mr-2" />
          Load Default Flow
        </Button>
      </div>
      
      {isCreatingMovementTask && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-100 border border-blue-300 rounded-lg px-4 py-2 z-10">
          <p className="text-sm text-blue-800 font-medium">
            {!pendingMovementTask?.sourceLocationId
              ? "Click on the source location"
              : "Click on the target location"
            }
          </p>
        </div>
      )}
    </div>
  );
}