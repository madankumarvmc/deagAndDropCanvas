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
  // Create a simple straight line from location to task
  const edgePath = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;

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