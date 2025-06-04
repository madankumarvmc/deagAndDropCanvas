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
        'bg-white border-2 rounded-lg shadow-md p-3 w-48 cursor-pointer hover:shadow-lg transition-all duration-200',
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

      {/* Location Tasks */}
      {data.locationTasks && data.locationTasks.length > 0 && (
        <div className="space-y-1 mb-2">
          <div className="text-xs font-medium text-gray-600 border-t pt-1">
            Tasks:
          </div>
          {data.locationTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center space-x-1 p-1 rounded border cursor-pointer hover:bg-gray-50"
              style={{ 
                backgroundColor: task.bgColor,
                borderColor: task.color + '40'
              }}
              onClick={(e) => handleTaskClick(task.id, e)}
              onDoubleClick={(e) => handleTaskDoubleClick(task.id, e)}
            >
              <span className="text-xs">{task.icon}</span>
              <span className="text-xs font-medium flex-1 truncate">{task.name}</span>
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: getStatusColor(task.configuration) }}
              />
              <button
                onClick={(e) => handleDeleteTask(task.id, e)}
                className="text-red-500 hover:text-red-700 text-xs w-3 h-3 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Task Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddTask}
          className="text-xs h-5 px-1"
        >
          <Plus className="w-2 h-2 mr-1" />
          Add Task
        </Button>
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

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !border-2 !border-white shadow-sm"
        style={{ backgroundColor: data.color }}
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