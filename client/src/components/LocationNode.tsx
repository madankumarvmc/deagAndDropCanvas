import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Plus, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWarehouseStore } from '@/stores/warehouseStore';
import { Button } from '@/components/ui/button';

interface LocationNodeData {
  locationTypeId: string;
  locationName: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  category: string;
  configuration?: any;
  locationTasks?: Array<{
    id: string;
    taskTypeId: string;
    name: string;
    icon: string;
    color: string;
    bgColor: string;
    configuration?: any;
  }>;
}

const LocationNode = memo(({ data, selected, id }: NodeProps<LocationNodeData>) => {
  const { 
    setSelectedElement, 
    setConfigModalOpen, 
    addLocationTask,
    frameworkConfig,
    deleteLocationTask 
  } = useWarehouseStore();

  const handleNodeClick = () => {
    setSelectedElement(id, 'location');
  };

  const handleNodeDoubleClick = () => {
    setSelectedElement(id, 'location');
    setConfigModalOpen(true);
  };

  const handleTaskClick = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedElement(taskId, 'locationTask');
  };

  const handleTaskDoubleClick = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedElement(taskId, 'locationTask');
    setConfigModalOpen(true);
  };

  const handleAddTask = (e: React.MouseEvent) => {
    e.stopPropagation();
    // For now, add the first compatible task type
    const compatibleTasks = frameworkConfig.locationTaskTypes.filter(
      taskType => taskType.compatibleLocationTypes.includes(data.locationTypeId)
    );
    
    if (compatibleTasks.length > 0) {
      addLocationTask(id, compatibleTasks[0].id);
    }
  };

  const handleDeleteTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteLocationTask(id, taskId);
  };

  const getStatusColor = (config?: any) => {
    if (!config) return '#f59e0b'; // Warning yellow for unconfigured
    return '#10b981'; // Success green for configured
  };

  return (
    <div
      className={cn(
        'relative bg-white border-2 rounded-lg shadow-md p-3 w-48 cursor-pointer hover:shadow-lg transition-all duration-200',
        selected && 'ring-2 ring-blue-500 ring-offset-1'
      )}
      style={{ borderColor: data.borderColor }}
      onClick={handleNodeClick}
      onDoubleClick={handleNodeDoubleClick}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !border-2 !border-white shadow-sm"
        style={{ backgroundColor: data.color }}
      />

      {/* Main Location Content */}
      <div className="flex items-center space-x-2 mb-2">
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center text-sm"
          style={{ backgroundColor: data.bgColor }}
        >
          {data.icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-xs">{data.locationName}</h3>
          <p className="text-xs text-gray-500">{data.category}</p>
        </div>
        <div
          className="w-2 h-2 rounded-full border border-white shadow-sm"
          style={{ backgroundColor: getStatusColor(data.configuration) }}
        />
      </div>

      {/* Settings Button */}
      <div className="flex justify-end mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleNodeDoubleClick();
          }}
          className="text-xs h-5 px-1"
        >
          <Settings className="w-2 h-2" />
        </Button>
      </div>

      {/* Add Task Branch Button - positioned at bottom center */}
      <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddTask}
          className="h-6 w-6 p-0 rounded-full bg-white border-2 border-blue-500 text-blue-600 hover:bg-blue-50 shadow-lg"
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>

      {/* Output Handle for Movement Tasks */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !border-2 !border-white shadow-sm"
        style={{ backgroundColor: data.color }}
      />

      {/* Task Handle at bottom center for task connections */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="task-output"
        className="w-3 h-3 !border-2 !border-white shadow-sm"
        style={{ 
          backgroundColor: '#3b82f6',
          left: '50%',
          bottom: '-6px',
          transform: 'translateX(-50%)'
        }}
      />

      {/* Configuration Indicator */}
      {!data.configuration && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">!</span>
        </div>
      )}
    </div>
  );
});

LocationNode.displayName = 'LocationNode';

export default LocationNode;