import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Settings, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWarehouseStore } from '@/stores/warehouseStore';
import { Button } from '@/components/ui/button';

interface TaskNodeData {
  parentLocationId: string;
  tasks: Array<{
    id: string;
    taskTypeId: string;
    taskName: string;
    icon: string;
    color: string;
    bgColor: string;
    configuration?: any;
  }>;
}

const TaskNode = memo(({ data, selected, id }: NodeProps<TaskNodeData>) => {
  const { 
    setSelectedElement, 
    setConfigModalOpen, 
    deleteLocationTask,
    addLocationTask,
    frameworkConfig
  } = useWarehouseStore();

  const handleNodeClick = () => {
    setSelectedElement(id, 'locationTask');
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

  const handleDeleteTaskGroup = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteLocationTask(data.parentLocationId, id);
  };

  const handleAddTaskToGroup = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Add another task to this group - for now, add first compatible task
    const compatibleTasks = frameworkConfig.locationTaskTypes.filter(
      taskType => !data.tasks.some(existingTask => existingTask.taskTypeId === taskType.id)
    );
    
    if (compatibleTasks.length > 0) {
      addLocationTask(data.parentLocationId, compatibleTasks[0].id);
    }
  };

  const handleRemoveTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Remove individual task from the group
    deleteLocationTask(data.parentLocationId, taskId);
  };

  const getStatusColor = (config?: any) => {
    if (!config) return '#f59e0b'; // Warning yellow for unconfigured
    return '#10b981'; // Success green for configured
  };

  return (
    <div
      className={cn(
        'bg-white border rounded-md shadow-sm p-2 w-64 cursor-pointer hover:shadow-md transition-all duration-200',
        selected && 'ring-2 ring-blue-500 ring-offset-1'
      )}
      onClick={handleNodeClick}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 !border !border-white shadow-sm"
        style={{ backgroundColor: '#64748b' }}
      />

      {/* Task Group Content */}
      <div className="space-y-1">
        {data.tasks.map((task, index) => (
          <div
            key={task.id}
            className="flex items-center space-x-2 p-1 rounded border cursor-pointer hover:bg-gray-50"
            style={{ 
              backgroundColor: task.bgColor,
              borderColor: task.color + '40'
            }}
            onClick={(e) => handleTaskClick(task.id, e)}
            onDoubleClick={(e) => handleTaskDoubleClick(task.id, e)}
          >
            <div
              className="w-4 h-4 rounded flex items-center justify-center text-xs"
              style={{ backgroundColor: task.color + '20' }}
            >
              {task.icon}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium truncate">{task.taskName}</span>
            </div>
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: getStatusColor(task.configuration) }}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleRemoveTask(task.id, e)}
              className="h-4 w-4 p-0 text-red-500 hover:bg-red-50 opacity-70 hover:opacity-100"
            >
              <X className="w-2 h-2" />
            </Button>
          </div>
        ))}
        
        {/* Add Task to Group Button */}
        <div className="flex justify-between items-center pt-1 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddTaskToGroup}
            className="h-4 w-4 p-0 text-blue-500 hover:bg-blue-50"
          >
            <Plus className="w-2 h-2" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteTaskGroup}
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