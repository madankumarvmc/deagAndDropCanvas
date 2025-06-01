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

  // Simple curved connection with control point
  const defaultControlX = (sourceX + targetX) / 2;
  const defaultControlY = (sourceY + targetY) / 2 - 50; // Slight curve offset
  const controlX = data?.controlPointX ?? defaultControlX;
  const controlY = data?.controlPointY ?? defaultControlY;
  
  // Create smooth quadratic bezier curve
  const edgePath = `M ${sourceX},${sourceY} Q ${controlX},${controlY} ${targetX},${targetY}`;
  
  // Position label at the control point (curve peak)
  const labelX = controlX;
  const labelY = controlY;

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
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    // Calculate movement deltas
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    // Update control point position
    const newControlX = controlX + deltaX;
    const newControlY = controlY + deltaY;
    
    updateMovementEdge(id, {
      ...data,
      controlPointX: newControlX,
      controlPointY: newControlY,
    });
    
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, id, data, updateMovementEdge, dragStart, controlX, controlY]);

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