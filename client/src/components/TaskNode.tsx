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
    frameworkConfig,
    updateLocationTask
  } = useWarehouseStore();

  const handleNodeClick = () => {
    setSelectedElement(id, 'taskSequence');
  };

  const handleNodeDoubleClick = () => {
    setSelectedElement(id, 'taskSequence');
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
    // Remove individual task from the task sequence
    const updatedTasks = data.tasks.filter(task => task.id !== taskId);
    
    // If no tasks left, remove the entire task group
    if (updatedTasks.length === 0) {
      deleteLocationTask(data.parentLocationId, id);
    } else {
      // Update the task group with remaining tasks
      updateLocationTask(data.parentLocationId, id, { tasks: updatedTasks });
    }
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
      onDoubleClick={handleNodeDoubleClick}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 !border !border-white shadow-sm"
        style={{ backgroundColor: '#64748b' }}
      />

      {/* Task Sequence Header */}
      <div className="text-center border-b pb-2 mb-3">
        <span className="text-sm font-medium text-gray-700">Task Sequence</span>
      </div>

      {/* Individual Task Cards */}
      <div className="space-y-2">
        {data.tasks.map((task, index) => (
          <div
            key={task.id}
            className="bg-white border rounded-lg p-3 cursor-pointer hover:shadow-sm transition-all duration-200"
            style={{ 
              borderColor: task.color + '60'
            }}
            onClick={(e) => handleTaskClick(task.id, e)}
            onDoubleClick={(e) => handleTaskDoubleClick(task.id, e)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div
                  className="w-5 h-5 rounded flex items-center justify-center text-sm"
                  style={{ backgroundColor: task.bgColor }}
                >
                  {task.icon}
                </div>
                <span className="text-sm font-medium text-gray-800">{task.taskName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getStatusColor(task.configuration) }}
                />
                <button
                  onClick={(e) => handleRemoveTask(task.id, e)}
                  className="text-red-500 hover:bg-red-50 p-1 rounded opacity-70 hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
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