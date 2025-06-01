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

  // Calculate orthogonal routing with 90-degree turns
  const defaultTurnX = sourceX + (targetX - sourceX) * 0.6;
  const defaultTurnY = sourceY + (targetY - sourceY) * 0.3;
  const turnX = data?.controlPointX ?? defaultTurnX;
  const turnY = data?.controlPointY ?? defaultTurnY;
  
  const cornerRadius = 8;
  
  // Create orthogonal path with rounded corners
  const createOrthogonalPath = () => {
    const horizontal = Math.abs(turnX - sourceX);
    const vertical = Math.abs(turnY - sourceY);
    const vertical2 = Math.abs(targetY - turnY);
    
    if (horizontal < cornerRadius || vertical < cornerRadius || vertical2 < cornerRadius) {
      // If distances are too small for rounded corners, use straight lines
      return `M ${sourceX},${sourceY} L ${turnX},${turnY} L ${targetX},${targetY}`;
    }
    
    // Direction vectors
    const hDir = turnX > sourceX ? 1 : -1;
    const vDir1 = turnY > sourceY ? 1 : -1;
    const vDir2 = targetY > turnY ? 1 : -1;
    
    // Calculate path with rounded corners
    const path = [
      `M ${sourceX},${sourceY}`, // Start at source
      `L ${turnX - cornerRadius * hDir},${sourceY}`, // Horizontal line to first corner
      `Q ${turnX},${sourceY} ${turnX},${sourceY + cornerRadius * vDir1}`, // First rounded corner
      `L ${turnX},${turnY - cornerRadius * vDir2}`, // Vertical line to second corner
      `Q ${turnX},${turnY} ${turnX + cornerRadius * hDir},${turnY}`, // Second rounded corner
      `L ${targetX},${targetY}` // Final line to target
    ].join(' ');
    
    return path;
  };
  
  const edgePath = createOrthogonalPath();
  
  // Position label at the turn point
  const labelX = turnX;
  const labelY = turnY;

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
    
    // Update both X and Y positions with reasonable bounds
    const newTurnX = Math.max(
      Math.min(sourceX, targetX) + 30, // Minimum distance from left edge
      Math.min(
        Math.max(sourceX, targetX) - 30, // Maximum distance from right edge
        turnX + deltaX
      )
    );
    
    const newTurnY = Math.max(
      Math.min(sourceY, targetY) + 30, // Minimum distance from top edge
      Math.min(
        Math.max(sourceY, targetY) - 30, // Maximum distance from bottom edge
        turnY + deltaY
      )
    );
    
    updateMovementEdge(id, {
      ...data,
      controlPointX: newTurnX,
      controlPointY: newTurnY,
    });
    
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, id, data, updateMovementEdge, dragStart, turnX, turnY, sourceX, targetX, sourceY, targetY]);

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
              transform: `translate(-50%, -50%) translate(${turnX}px,${turnY}px)`,
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