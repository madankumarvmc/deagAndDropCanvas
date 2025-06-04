import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Settings, X, Plus, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWarehouseStore } from '@/stores/warehouseStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
    addTaskToSequence,
    frameworkConfig,
    updateLocationTask,
    getLocationNodeType,
    locationNodes
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

  // Get compatible tasks for this Task Sequence based on parent location
  const getCompatibleTasks = () => {
    // Find the parent location node to get its location type
    const parentLocationNode = locationNodes.find(node => node.id === data.parentLocationId);
    if (!parentLocationNode) return [];
    
    const parentLocationTypeId = parentLocationNode.data?.locationTypeId;
    if (!parentLocationTypeId) return [];
    
    // Filter tasks that are compatible with the parent location type and not already in this sequence
    return frameworkConfig.locationTaskTypes.filter(taskType => 
      taskType.compatibleLocationTypes.includes(parentLocationTypeId) &&
      !data.tasks.some(existingTask => existingTask.taskTypeId === taskType.id)
    );
  };

  const handleAddTaskToSequence = (taskTypeId: string) => {
    addTaskToSequence(id, taskTypeId);
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
        
        {/* Add Task to Sequence Dropdown */}
        <div className="flex justify-between items-center pt-1 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 text-blue-500 hover:bg-blue-50"
              >
                <Plus className="w-2 h-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {getCompatibleTasks().map((taskType) => (
                <DropdownMenuItem
                  key={taskType.id}
                  onClick={() => handleAddTaskToSequence(taskType.id)}
                  className="flex items-center space-x-2"
                >
                  <span className="text-sm">{taskType.icon}</span>
                  <span className="text-sm">{taskType.name}</span>
                </DropdownMenuItem>
              ))}
              {getCompatibleTasks().length === 0 && (
                <DropdownMenuItem disabled className="text-xs text-gray-500">
                  No more tasks available
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
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