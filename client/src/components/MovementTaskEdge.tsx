import { memo, useState, useCallback, useEffect } from "react";
import { EdgeProps, getBezierPath, EdgeLabelRenderer } from "reactflow";
import { useWarehouseStore } from "@/stores/warehouseStore";

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

const MovementTaskEdge = memo(
  ({
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
    const { setSelectedElement, setConfigModalOpen, updateMovementEdge } =
      useWarehouseStore();
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Simple curved connection with control point
    const defaultControlX = (sourceX + targetX) / 2;
    const defaultControlY = (sourceY + targetY) / 2 - 50; // Slight curve offset
    const controlX = data?.controlPointX ?? defaultControlX;
    const controlY = data?.controlPointY ?? defaultControlY;

    // Create orthogonal path with 90-degree angles using draggable control point
    const midX = controlX; // Use control point for horizontal position
    const midY = controlY; // Use control point for vertical position
    const edgePath = `M ${sourceX},${sourceY} L ${midX},${sourceY} L ${midX},${midY} L ${targetX},${midY} L ${targetX},${targetY}`;
    
    // Position label at the control point
    const labelX = midX;
    const labelY = midY;

    const handleEdgeClick = () => {
      if (!isDragging) {
        setSelectedElement(id, "movement");
      }
    };

    const handleEdgeDoubleClick = () => {
      setSelectedElement(id, "movement");
      setConfigModalOpen(true);
    };

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }, []);

    const handleMouseMove = useCallback(
      (e: MouseEvent) => {
        if (!isDragging) return;

        // Calculate smooth movement deltas
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        // Apply deltas to current control point
        const newControlX = controlX + deltaX;
        const newControlY = controlY + deltaY;

        updateMovementEdge(id, {
          ...data,
          controlPointX: newControlX,
          controlPointY: newControlY,
        });

        setDragStart({ x: e.clientX, y: e.clientY });
      },
      [isDragging, id, data, updateMovementEdge, dragStart, controlX, controlY],
    );

    const handleMouseUp = useCallback(() => {
      setIsDragging(false);
    }, []);

    // Add global mouse event listeners for dragging
    useEffect(() => {
      if (isDragging) {
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        return () => {
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", handleMouseUp);
        };
      }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const getStatusColor = () => {
      if (!data?.configuration) return "#f59e0b"; // Warning yellow for unconfigured
      return "#10b981"; // Success green for configured
    };

    return (
      <>
        <defs>
          {/* Arrow marker for direction */}
          <marker
            id={`arrow-${id}`}
            viewBox="0 0 10 10"
            refX="8"
            refY="3"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill={data?.color || "#64748b"} />
          </marker>
        </defs>

        <path
          id={id}
          className="react-flow__edge-path"
          d={edgePath}
          stroke={data?.color || "#64748b"}
          strokeWidth={selected ? 4 : 2}
          fill="none"
          markerEnd={`url(#arrow-${id})`}
          style={{
            strokeDasharray: "8,4",
            strokeDashoffset: "0",
            animation: "dash-flow 0.5s linear infinite",
          }}
        />

        <EdgeLabelRenderer>
          {/* Visual control point indicator when dragging or selected */}
          {(isDragging || selected) && (
            <div
              style={{
                position: "absolute",
                transform: `translate(-50%, -50%) translate(${controlX}px,${controlY}px)`,
                pointerEvents: "none",
              }}
              className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg"
            />
          )}

          {/* Draggable movement label */}
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
              cursor: isDragging ? "grabbing" : "grab",
            }}
            className="nodrag nopan"
            onMouseDown={handleMouseDown}
          >
            <div
              className={`
              bg-white border-2 rounded-lg px-3 py-2 shadow-lg cursor-pointer
              hover:shadow-xl transition-all duration-200 flex items-center space-x-2
              ${selected ? "ring-2 ring-blue-500 ring-offset-1" : ""}
            `}
              style={{ borderColor: data?.color || "#64748b" }}
              onClick={handleEdgeClick}
              onDoubleClick={handleEdgeDoubleClick}
            >
              <span className="text-sm">{data?.icon}</span>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-700">
                  {data?.taskName}
                </span>
                {data?.configuration?.labelName && (
                  <span className="text-xs text-gray-500">
                    {data.configuration.labelName}
                  </span>
                )}
              </div>
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
  },
);

MovementTaskEdge.displayName = "MovementTaskEdge";

export default MovementTaskEdge;
