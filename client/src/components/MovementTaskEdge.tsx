import { memo, useState, useCallback, useEffect } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer } from 'reactflow';
import { useWarehouseStore } from '@/stores/warehouseStore';

interface MovementTaskEdgeData {
  taskTypeId: string;
  taskName: string;
  icon: string;
  color: string;
  category: string;
  configuration?: any;
  controlPointX?: number;
  controlPointY?: number;
}

const MovementTaskEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<MovementTaskEdgeData>) => {
  const { setSelectedElement, setConfigModalOpen, updateMovementEdge } = useWarehouseStore();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Calculate control point for custom curve
  const defaultControlX = (sourceX + targetX) / 2;
  const defaultControlY = (sourceY + targetY) / 2 - 50; // Offset upward for natural curve
  const controlX = data?.controlPointX ?? defaultControlX;
  const controlY = data?.controlPointY ?? defaultControlY;

  // Create smooth quadratic bezier path
  const edgePath = `M ${sourceX},${sourceY} Q ${controlX},${controlY} ${targetX},${targetY}`;
  
  // Calculate the midpoint of the curve for label positioning (t = 0.5)
  const labelX = 0.25 * sourceX + 0.5 * controlX + 0.25 * targetX;
  const labelY = 0.25 * sourceY + 0.5 * controlY + 0.25 * targetY;

  const handleEdgeClick = () => {
    if (!isDragging) {
      setSelectedElement(id, 'movement');
    }
  };

  const handleEdgeDoubleClick = () => {
    setSelectedElement(id, 'movement');
    setConfigModalOpen(true);
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    
    // Get the React Flow viewport element to calculate relative coordinates
    const reactFlowBounds = (e.target as Element).closest('.react-flow')?.getBoundingClientRect();
    if (reactFlowBounds) {
      const x = e.clientX - reactFlowBounds.left;
      const y = e.clientY - reactFlowBounds.top;
      setDragStart({ x, y });
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    // Get the React Flow viewport element to calculate relative coordinates
    const reactFlowElement = document.querySelector('.react-flow__viewport');
    if (!reactFlowElement) return;
    
    const reactFlowBounds = reactFlowElement.getBoundingClientRect();
    const x = e.clientX - reactFlowBounds.left;
    const y = e.clientY - reactFlowBounds.top;
    
    updateMovementEdge(id, {
      ...data,
      controlPointX: x,
      controlPointY: y,
    });
  }, [isDragging, id, data, updateMovementEdge]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const getStatusColor = () => {
    if (!data?.configuration) return '#f59e0b'; // Warning yellow for unconfigured
    return '#10b981'; // Success green for configured
  };

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        stroke={data?.color || '#64748b'}
        strokeWidth={selected ? 4 : 2}
        fill="none"
        style={{
          strokeDasharray: data?.configuration ? 'none' : '5,5',
        }}
      />
      
      <EdgeLabelRenderer>
        {/* Visual control point indicator when dragging or selected */}
        {(isDragging || selected) && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${controlX}px,${controlY}px)`,
              pointerEvents: 'none',
            }}
            className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg"
          />
        )}
        
        {/* Draggable movement label */}
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          className="nodrag nopan"
          onMouseDown={handleMouseDown}
        >
          <div
            className={`
              bg-white border-2 rounded-lg px-3 py-2 shadow-lg cursor-pointer
              hover:shadow-xl transition-all duration-200 flex items-center space-x-2
              ${selected ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
            `}
            style={{ borderColor: data?.color || '#64748b' }}
            onClick={handleEdgeClick}
            onDoubleClick={handleEdgeDoubleClick}
          >
            <span className="text-sm">{data?.icon}</span>
            <span className="text-xs font-medium text-gray-700">{data?.taskName}</span>
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getStatusColor() }}
            />
            {!data?.configuration && (
              <span className="text-yellow-500 text-xs font-bold">!</span>
            )}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
});

MovementTaskEdge.displayName = 'MovementTaskEdge';

export default MovementTaskEdge;