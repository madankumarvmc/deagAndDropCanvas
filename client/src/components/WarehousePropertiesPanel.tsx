import { Settings, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWarehouseStore } from '@/stores/warehouseStore';

export default function WarehousePropertiesPanel() {
  const {
    selectedElementId,
    selectedElementType,
    locationNodes,
    movementEdges,
    deleteLocationNode,
    deleteMovementEdge,
    setConfigModalOpen,
    getLocationNodeType,
    getMovementTaskType,
    getLocationTaskType,
  } = useWarehouseStore();

  if (!selectedElementId || !selectedElementType) {
    return (
      <aside className="w-80 bg-white border-l border-gray-200 p-4">
        <div className="text-center text-gray-500 mt-8">
          <Settings className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">Select an element to view its properties</p>
        </div>
      </aside>
    );
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
    }
    return null;
  };

  const element = getSelectedElement();
  if (!element) return null;

  return (
    <aside className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <span>{selectedElementType === 'location' ? '📍' : '→'}</span>
            <span className="capitalize">{selectedElementType} Properties</span>
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