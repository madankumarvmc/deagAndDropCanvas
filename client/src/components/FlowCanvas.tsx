import { useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  ReactFlowInstance,
  Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2, Target } from 'lucide-react';
import { useFlowStore } from '@/stores/flowStore';
import ProcessNode from './ProcessNode';
import { type NodeType } from '@shared/schema';

const nodeTypes = {
  wmsProcess: ProcessNode,
};

export default function FlowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = 
    ReactFlowInstance<null, null>(null);

  const {
    nodes,
    edges,
    viewport,
    draggedNodeType,
    setNodes,
    setEdges,
    setViewport,
    addNode,
    setSelectedNodeId,
    setDraggedNodeType,
  } = useFlowStore();

  const [localNodes, setLocalNodes, onNodesChange] = useNodesState(nodes);
  const [localEdges, setLocalEdges, onEdgesChange] = useEdgesState(edges);

  // Sync local state with store
  React.useEffect(() => {
    setLocalNodes(nodes);
  }, [nodes, setLocalNodes]);

  React.useEffect(() => {
    setLocalEdges(edges);
  }, [edges, setLocalEdges]);

  React.useEffect(() => {
    setNodes(localNodes);
  }, [localNodes, setNodes]);

  React.useEffect(() => {
    setEdges(localEdges);
  }, [localEdges, setEdges]);

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      const newEdge = addEdge(
        {
          ...params,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#64748b', strokeWidth: 2 },
        },
        localEdges
      );
      setLocalEdges(newEdge);
    },
    [localEdges, setLocalEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow') as NodeType;

      if (typeof type === 'undefined' || !type || !reactFlowBounds || !reactFlowInstance) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      addNode(type, position);
      setDraggedNodeType(null);
    },
    [reactFlowInstance, addNode, setDraggedNodeType]
  );

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.stopPropagation();
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  const handleZoomIn = () => {
    reactFlowInstance?.zoomIn();
  };

  const handleZoomOut = () => {
    reactFlowInstance?.zoomOut();
  };

  const handleFitView = () => {
    reactFlowInstance?.fitView({ padding: 0.2 });
  };

  const handleCenter = () => {
    reactFlowInstance?.setCenter(0, 0);
  };

  return (
    <main className="flex-1 flex flex-col bg-gray-50">
      {/* Canvas Controls */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Zoom:</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                className="w-8 h-8 p-0"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium w-12 text-center">
                {Math.round((viewport.zoom || 1) * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                className="w-8 h-8 p-0"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleFitView}
              className="flex items-center space-x-2"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Fit to Screen</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCenter}
              className="flex items-center space-x-2"
            >
              <Target className="w-4 h-4" />
              <span>Center</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* React Flow Canvas */}
      <div className="flex-1" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={localNodes}
          edges={localEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          className="bg-gray-50"
          defaultViewport={viewport}
          onViewportChange={setViewport}
        >
          <Background
            color="#94a3b8"
            gap={20}
            size={1}
            style={{ opacity: 0.1 }}
          />
          <Controls
            position="bottom-right"
            showInteractive={false}
            className="bg-white border border-gray-200 rounded-lg shadow-sm"
          />
          <MiniMap
            position="bottom-left"
            className="bg-white border border-gray-200 rounded-lg shadow-sm"
            pannable
            zoomable
            nodeColor={(node) => {
              return node.data?.borderColor || '#64748b';
            }}
          />
        </ReactFlow>

        {/* Drop Zone Indicator */}
        {draggedNodeType && (
          <div className="absolute inset-4 border-2 border-dashed border-blue-300 rounded-lg pointer-events-none bg-blue-50 bg-opacity-50 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="text-4xl text-blue-400 mb-2">+</div>
              <p className="text-blue-600 font-medium">Drop process node here</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
