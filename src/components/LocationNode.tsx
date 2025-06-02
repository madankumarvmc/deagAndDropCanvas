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
        'bg-white border-2 rounded-xl shadow-lg p-4 w-64 cursor-pointer hover:shadow-xl transition-all duration-200',
        selected && 'ring-2 ring-blue-500 ring-offset-2'
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
      <div className="flex items-center space-x-3 mb-3">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
          style={{ backgroundColor: data.bgColor }}
        >
          {data.icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm">{data.locationName}</h3>
          <p className="text-xs text-gray-500">{data.category}</p>
          {data.configuration && (
            <p className="text-xs text-green-600 font-medium">Configured</p>
          )}
        </div>
        <div
          className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
          style={{ backgroundColor: getStatusColor(data.configuration) }}
        />
      </div>

      {/* Location Tasks */}
      {data.locationTasks && data.locationTasks.length > 0 && (
        <div className="space-y-2 mb-3">
          <div className="text-xs font-medium text-gray-600 border-t pt-2">
            Location Tasks:
          </div>
          {data.locationTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center space-x-2 p-2 rounded-lg border cursor-pointer hover:bg-gray-50"
              style={{ 
                backgroundColor: task.bgColor,
                borderColor: task.color + '40'
              }}
              onClick={(e) => handleTaskClick(task.id, e)}
              onDoubleClick={(e) => handleTaskDoubleClick(task.id, e)}
            >
              <span className="text-sm">{task.icon}</span>
              <span className="text-xs font-medium flex-1">{task.name}</span>
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: getStatusColor(task.configuration) }}
              />
              <button
                onClick={(e) => handleDeleteTask(task.id, e)}
                className="text-red-500 hover:text-red-700 text-xs"
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
          className="text-xs h-6 px-2"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Task
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleNodeDoubleClick();
          }}
          className="text-xs h-6 px-2"
        >
          <Settings className="w-3 h-3" />
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