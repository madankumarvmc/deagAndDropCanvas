import { Settings, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWarehouseStore } from '@/stores/warehouseStore';

export default function WarehousePropertiesPanel() {
  const {
    selectedElementId,
    selectedElementType,
    isPropertiesPanelOpen,
    locationNodes,
    movementEdges,
    deleteLocationNode,
    deleteMovementEdge,
    setConfigModalOpen,
    setPropertiesPanelOpen,
    setSelectedElement,
    getLocationNodeType,
    getMovementTaskType,
    getLocationTaskType,
    frameworkConfig,
  } = useWarehouseStore();

  const propertiesConfig = frameworkConfig.ui?.messages?.propertiesPanel;
  const buttonsConfig = frameworkConfig.ui?.buttons;

  const handleClose = () => {
    setPropertiesPanelOpen(false);
    setSelectedElement(null, null);
  };

  // Show collapsed state or hidden when no element selected
  if (!isPropertiesPanelOpen || !selectedElementId || !selectedElementType) {
    return null; // Hide panel completely when closed
  }

  const handleDelete = () => {
    if (selectedElementType === 'location') {
      deleteLocationNode(selectedElementId);
    } else if (selectedElementType === 'movement') {
      deleteMovementEdge(selectedElementId);
    }
  };

  const handleConfigure = () => {
    setConfigModalOpen(true);
  };

  const getSelectedElement = () => {
    if (selectedElementType === 'location') {
      return locationNodes.find(node => node.id === selectedElementId);
    } else if (selectedElementType === 'movement') {
      return movementEdges.find(edge => edge.id === selectedElementId);
    } else if (selectedElementType === 'taskSequence') {
      return locationNodes.find(node => node.id === selectedElementId);
    } else if (selectedElementType === 'locationTask') {
      // For individual tasks, find the task group containing this task
      for (const node of locationNodes) {
        if (node.data?.tasks) {
          const task = node.data.tasks.find((t: any) => t.id === selectedElementId);
          if (task) {
            return { ...node, data: { ...node.data, selectedTask: task } };
          }
        }
      }
    }
    return null;
  };

  const element = getSelectedElement();
  if (!element) return null;

  return (
    <aside className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>
                {propertiesConfig?.icons?.[selectedElementType as keyof typeof propertiesConfig.icons] || '📄'}
              </span>
              <span className="capitalize">
                {propertiesConfig?.elementTypes?.[selectedElementType as keyof typeof propertiesConfig.elementTypes] || selectedElementType} {propertiesConfig?.title || 'Properties'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedElementType === 'location' && element.data && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-600">Location Name</label>
                <p className="text-sm text-gray-900">{element.data.locationName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Category</label>
                <p className="text-sm text-gray-900">{element.data.category}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Type ID</label>
                <p className="text-sm text-gray-900">{element.data.locationTypeId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Configuration Status</label>
                <p className={`text-sm ${element.data.configuration ? 'text-green-600' : 'text-yellow-600'}`}>
                  {element.data.configuration ? 'Configured' : 'Not Configured'}
                </p>
              </div>
              {element.data.locationTasks && element.data.locationTasks.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Location Tasks</label>
                  <div className="space-y-1">
                    {element.data.locationTasks.map((task: any) => (
                      <p key={task.id} className="text-sm text-gray-900">
                        {task.icon} {task.name}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {selectedElementType === 'taskSequence' && element.data && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-600">Task Sequence</label>
                <p className="text-sm text-gray-900">Contains {element.data.tasks?.length || 0} tasks</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Parent Location</label>
                <p className="text-sm text-gray-900">{element.data.parentLocationId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Configuration Status</label>
                <p className={`text-sm ${element.data.configuration ? 'text-green-600' : 'text-yellow-600'}`}>
                  {element.data.configuration ? 'Configured' : 'Not Configured'}
                </p>
              </div>
              {element.data.tasks && element.data.tasks.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Tasks in Sequence</label>
                  <div className="space-y-1">
                    {element.data.tasks.map((task: any) => (
                      <p key={task.id} className="text-sm text-gray-900">
                        {task.icon} {task.taskName}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {selectedElementType === 'locationTask' && element.data?.selectedTask && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-600">Task Name</label>
                <p className="text-sm text-gray-900">{element.data.selectedTask.taskName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Task Type</label>
                <p className="text-sm text-gray-900">{element.data.selectedTask.taskTypeId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Category</label>
                <p className="text-sm text-gray-900">{getLocationTaskType(element.data.selectedTask.taskTypeId)?.category || 'Unknown'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Configuration Status</label>
                <p className={`text-sm ${element.data.selectedTask.configuration ? 'text-green-600' : 'text-yellow-600'}`}>
                  {element.data.selectedTask.configuration ? 'Configured' : 'Not Configured'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Parent Task Sequence</label>
                <p className="text-sm text-gray-900">{element.data.parentLocationId}</p>
              </div>
            </>
          )}

          {selectedElementType === 'movement' && element.data && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-600">Task Name</label>
                <p className="text-sm text-gray-900">{element.data.taskName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Category</label>
                <p className="text-sm text-gray-900">{element.data.category}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Task Type ID</label>
                <p className="text-sm text-gray-900">{element.data.taskTypeId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Configuration Status</label>
                <p className={`text-sm ${element.data.configuration ? 'text-green-600' : 'text-yellow-600'}`}>
                  {element.data.configuration ? 'Configured' : 'Not Configured'}
                </p>
              </div>
            </>
          )}

          <div className="flex space-x-2 pt-4">
            <Button
              onClick={handleConfigure}
              className="flex-1 flex items-center justify-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Configure</span>
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="flex items-center justify-center px-3"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}