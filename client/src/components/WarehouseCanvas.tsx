import React, { useCallback } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useWarehouseStore } from '@/stores/warehouseStore';
import LocationNode from './LocationNode';
import MovementTaskEdge from './MovementTaskEdge';

const nodeTypes: NodeTypes = {
  warehouseLocation: LocationNode,
};

const edgeTypes: EdgeTypes = {
  movementTask: MovementTaskEdge,
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

  // Sync store with local state
  React.useEffect(() => {
    setNodes(locationNodes);
  }, [locationNodes, setNodes]);

  React.useEffect(() => {
    setEdges(movementEdges);
  }, [movementEdges, setEdges]);

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
      // Update store with changes
      const updatedNodes = nodes.map((node) => {
        const change = changes.find((c) => c.id === node.id);
        if (change && change.type === 'position' && change.position) {
          return { ...node, position: change.position };
        }
        return node;
      });
      setLocationNodes(updatedNodes);
    },
    [onNodesChange, nodes, setLocationNodes]
  );

  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
      // Update store with changes
      const updatedEdges = edges.filter((edge) => 
        !changes.find((c) => c.id === edge.id && c.type === 'remove')
      );
      setMovementEdges(updatedEdges);
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

  const onViewportChange = useCallback(
    (newViewport: any) => {
      setViewport(newViewport);
    },
    [setViewport]
  );

  return (
    <div className="flex-1 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onViewportChange={onViewportChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        defaultViewport={viewport}
        className="bg-gray-50"
      >
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            if (node.type === 'warehouseLocation') {
              return node.data?.color || '#64748b';
            }
            return '#64748b';
          }}
          className="bg-white border border-gray-200"
        />
        <Background variant="dots" gap={20} size={1} color="#d1d5db" />
      </ReactFlow>
      
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