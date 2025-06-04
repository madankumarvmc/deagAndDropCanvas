import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useWarehouseStore } from '@/stores/warehouseStore';
import DynamicFormGenerator from './DynamicFormGenerator';

export default function DynamicConfigModal() {
  const {
    isConfigModalOpen,
    setConfigModalOpen,
    selectedElementId,
    selectedElementType,
    locationNodes,
    movementEdges,
    updateLocationNode,
    updateMovementEdge,
    updateLocationTask,
    getLocationNodeType,
    getMovementTaskType,
    getLocationTaskType,
    frameworkConfig,
  } = useWarehouseStore();

  if (!selectedElementId || !selectedElementType) {
    return null;
  }

  const getSelectedTask = () => {
    if (selectedElementType !== 'locationTask') return null;
    
    for (const node of locationNodes) {
      if (node.data?.tasks) {
        const task = node.data.tasks.find((t: any) => t.id === selectedElementId);
        if (task) return task;
      }
    }
    return null;
  };

  const getConfigurationFields = () => {
    if (selectedElementType === 'location') {
      const node = locationNodes.find(n => n.id === selectedElementId);
      if (!node) return [];
      
      const locationType = getLocationNodeType(node.data.locationTypeId);
      return locationType?.configurationFields || [];
    } else if (selectedElementType === 'movement') {
      const edge = movementEdges.find(e => e.id === selectedElementId);
      if (!edge) return [];
      
      const taskType = getMovementTaskType(edge.data.taskTypeId);
      return taskType?.configurationFields || [];
    } else if (selectedElementType === 'taskSequence') {
      // For task sequences, return configurable fields
      return [
        {
          id: 'sequenceName',
          type: 'text',
          label: 'Sequence Name',
          required: true,
          placeholder: 'Enter sequence name'
        },
        {
          id: 'priority',
          type: 'dropdown',
          label: 'Priority',
          required: true,
          options: [
            { value: 'high', label: 'High' },
            { value: 'medium', label: 'Medium' },
            { value: 'low', label: 'Low' }
          ]
        },
        {
          id: 'parallelExecution',
          type: 'checkbox',
          label: 'Allow Parallel Execution',
          defaultValue: false
        },
        {
          id: 'timeout',
          type: 'number',
          label: 'Timeout (minutes)',
          required: false,
          placeholder: '30'
        }
      ];
    } else if (selectedElementType === 'locationTask') {
      // For individual tasks, get configuration fields from the task type
      const task = getSelectedTask();
      if (task) {
        const taskType = getLocationTaskType(task.taskTypeId);
        return taskType?.configurationFields || [];
      }
      return [];
    }
    return [];
  };

  const getCurrentConfiguration = () => {
    if (selectedElementType === 'location') {
      const node = locationNodes.find(n => n.id === selectedElementId);
      return node?.data?.configuration || {};
    } else if (selectedElementType === 'movement') {
      const edge = movementEdges.find(e => e.id === selectedElementId);
      return edge?.data?.configuration || {};
    } else if (selectedElementType === 'taskSequence') {
      const node = locationNodes.find(n => n.id === selectedElementId);
      return node?.data?.configuration || {};
    } else if (selectedElementType === 'locationTask') {
      const task = getSelectedTask();
      return task?.configuration || {};
    }
    return {};
  };

  const getElementName = () => {
    if (selectedElementType === 'location') {
      const node = locationNodes.find(n => n.id === selectedElementId);
      return node?.data?.locationName || 'Location';
    } else if (selectedElementType === 'movement') {
      const edge = movementEdges.find(e => e.id === selectedElementId);
      return edge?.data?.taskName || 'Movement Task';
    } else if (selectedElementType === 'taskSequence') {
      return 'Task Sequence';
    } else if (selectedElementType === 'locationTask') {
      const task = getSelectedTask();
      return task?.taskName || 'Task';
    }
    return 'Element';
  };

  const handleSubmit = (configuration: Record<string, any>) => {
    if (selectedElementType === 'location') {
      updateLocationNode(selectedElementId, { configuration });
    } else if (selectedElementType === 'movement') {
      updateMovementEdge(selectedElementId, { configuration });
    } else if (selectedElementType === 'taskSequence' || selectedElementType === 'locationTask') {
      updateLocationTask('', selectedElementId, { configuration });
    }
    setConfigModalOpen(false);
  };

  const handleCancel = () => {
    setConfigModalOpen(false);
  };

  const configFields = getConfigurationFields();
  const currentConfig = getCurrentConfiguration();
  const elementName = getElementName();

  return (
    <Dialog open={isConfigModalOpen} onOpenChange={setConfigModalOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Configure {elementName}
          </DialogTitle>
        </DialogHeader>
        
        {configFields.length > 0 ? (
          <DynamicFormGenerator
            fields={configFields}
            initialValues={currentConfig}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="Save Configuration"
          />
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500 mb-4">
              No configuration fields defined for this element.
            </p>
            <Button onClick={handleCancel}>Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}