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
  labelOffsetX?: number;
  labelOffsetY?: number;
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

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

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
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    updateMovementEdge(id, {
      ...data,
      labelOffsetX: (data?.labelOffsetX || 0) + deltaX,
      labelOffsetY: (data?.labelOffsetY || 0) + deltaY,
    });
    
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragStart, id, data, updateMovementEdge]);

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
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX + (data?.labelOffsetX || 0)}px,${labelY + (data?.labelOffsetY || 0)}px)`,
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