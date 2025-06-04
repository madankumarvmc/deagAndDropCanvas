import { memo } from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';

interface LocationTaskEdgeData {
  // Simple edge for connecting location to its tasks
}

const LocationTaskEdge = memo(({ 
  id, 
  sourceX, 
  sourceY, 
  targetX, 
  targetY, 
  selected 
}: EdgeProps<LocationTaskEdgeData>) => {
  // Create 90-degree angled path from location to task
  // First go down from source, then horizontally to target X, then down to target
  const midY = sourceY + 40; // Go down a bit from the source
  const edgePath = `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`;

  return (
    <path
      id={id}
      className="react-flow__edge-path"
      d={edgePath}
      stroke="#94a3b8"
      strokeWidth={selected ? 3 : 2}
      fill="none"
      strokeDasharray="none"
    />
  );
});

LocationTaskEdge.displayName = 'LocationTaskEdge';

export default LocationTaskEdge;