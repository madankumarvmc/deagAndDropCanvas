import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Settings, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWarehouseStore } from '@/stores/warehouseStore';
import { Button } from '@/components/ui/button';

interface TaskNodeData {
  taskTypeId: string;
  taskName: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  category: string;
  parentLocationId: string;
  configuration?: any;
}

const TaskNode = memo(({ data, selected, id }: NodeProps<TaskNodeData>) => {
  const { 
    setSelectedElement, 
    setConfigModalOpen, 
    deleteLocationTask 
  } = useWarehouseStore();

  const handleNodeClick = () => {
    setSelectedElement(id, 'locationTask');
  };

  const handleNodeDoubleClick = () => {
    setSelectedElement(id, 'locationTask');
    setConfigModalOpen(true);
  };

  const handleDeleteTask = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteLocationTask(data.parentLocationId, id);
  };

  const getStatusColor = (config?: any) => {
    if (!config) return '#f59e0b'; // Warning yellow for unconfigured
    return '#10b981'; // Success green for configured
  };

  return (
    <div
      className={cn(
        'bg-white border rounded-md shadow-sm p-2 w-32 cursor-pointer hover:shadow-md transition-all duration-200',
        selected && 'ring-2 ring-blue-500 ring-offset-1'
      )}
      style={{ borderColor: data.borderColor || data.color }}
      onClick={handleNodeClick}
      onDoubleClick={handleNodeDoubleClick}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 !border !border-white shadow-sm"
        style={{ backgroundColor: data.color }}
      />

      {/* Task Content */}
      <div className="flex items-center space-x-2">
        <div
          className="w-6 h-6 rounded flex items-center justify-center text-xs"
          style={{ backgroundColor: data.bgColor }}
        >
          {data.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-xs truncate">{data.taskName}</h4>
        </div>
        <div className="flex items-center space-x-1">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: getStatusColor(data.configuration) }}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleNodeDoubleClick();
            }}
            className="h-4 w-4 p-0 hover:bg-gray-100"
          >
            <Settings className="w-2 h-2" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteTask}
            className="h-4 w-4 p-0 hover:bg-red-100 text-red-500"
          >
            <X className="w-2 h-2" />
          </Button>
        </div>
      </div>
    </div>
  );
});

TaskNode.displayName = 'TaskNode';

export default TaskNode;