import { MousePointer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFlowStore } from '@/stores/flowStore';

export default function PropertiesPanel() {
  const {
    nodes,
    selectedNodeId,
    updateNode,
    setConfigModalOpen,
    deleteNode,
  } = useFlowStore();

  const selectedNode = selectedNodeId 
    ? nodes.find(node => node.id === selectedNodeId)
    : null;

  const handlePropertyChange = (property: string, value: any) => {
    if (selectedNodeId) {
      updateNode(selectedNodeId, { [property]: value });
    }
  };

  const handleConfigureNode = () => {
    if (selectedNodeId) {
      setConfigModalOpen(true);
    }
  };

  const handleDeleteNode = () => {
    if (selectedNodeId) {
      deleteNode(selectedNodeId);
    }
  };

  if (!selectedNode) {
    return (
      <aside className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Properties</h2>
          <p className="text-sm text-gray-500 mt-1">Configure selected node</p>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center py-12">
            <MousePointer className="w-12 h-12 text-gray-300 mb-4 mx-auto" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">No Node Selected</h3>
            <p className="text-sm text-gray-400">
              Click on a process node to view and edit its configuration
            </p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-80 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Properties</h2>
        <p className="text-sm text-gray-500 mt-1">Configure selected node</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* Node Info */}
          <div>
            <div 
              className="border rounded-lg p-3 mb-4"
              style={{ 
                backgroundColor: selectedNode.data.bgColor,
                borderColor: selectedNode.data.borderColor 
              }}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{selectedNode.data.icon}</span>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {selectedNode.data.label}
                  </div>
                  <div className="text-xs text-gray-600">
                    ID: {selectedNode.id}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Properties */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="node-label" className="text-sm font-medium text-gray-700">
                Display Name
              </Label>
              <Input
                id="node-label"
                value={selectedNode.data.label || ''}
                onChange={(e) => handlePropertyChange('label', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="node-description" className="text-sm font-medium text-gray-700">
                Description
              </Label>
              <Textarea
                id="node-description"
                value={selectedNode.data.description || ''}
                onChange={(e) => handlePropertyChange('description', e.target.value)}
                rows={3}
                className="mt-1"
                placeholder="Process description..."
              />
            </div>

            <div>
              <Label htmlFor="node-status" className="text-sm font-medium text-gray-700">
                Status
              </Label>
              <Select
                value={selectedNode.data.status || 'active'}
                onValueChange={(value) => handlePropertyChange('status', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Configuration Section */}
          <div className="pt-4 border-t border-gray-200">
            <div className="space-y-3">
              <Button
                onClick={handleConfigureNode}
                className="w-full"
                size="sm"
              >
                Configure Process
              </Button>

              {selectedNode.data.config && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs font-medium text-gray-700 mb-2">
                    Current Configuration
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    {Object.entries(selectedNode.data.config).slice(0, 3).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="font-medium">
                          {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                        </span>
                      </div>
                    ))}
                    {Object.keys(selectedNode.data.config).length > 3 && (
                      <div className="text-xs text-gray-500 pt-1">
                        ... and {Object.keys(selectedNode.data.config).length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-200">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteNode}
              className="w-full"
            >
              Delete Node
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
