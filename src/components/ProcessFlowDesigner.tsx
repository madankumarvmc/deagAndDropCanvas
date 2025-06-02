import { useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Download, Undo, Redo } from 'lucide-react';
import { useFlowStore } from '@/stores/flowStore';
import NodeLibrary from './NodeLibrary';
import FlowCanvas from './FlowCanvas';
import PropertiesPanel from './PropertiesPanel';
import NodeConfigModal from './NodeConfigModal';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function ProcessFlowDesigner() {
  const { toast } = useToast();
  const {
    currentFlowId,
    projectName,
    setProjectName,
    getFlowData,
    clearFlow,
  } = useFlowStore();

  const [isSaving, setIsSaving] = useState(false);

  // Load current flow if one is selected
  const { data: currentFlow } = useQuery({
    queryKey: ['/api/flows', currentFlowId],
    enabled: !!currentFlowId,
  });

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const flowData = getFlowData();
      
      const payload = {
        name: `Process Flow - ${new Date().toLocaleString()}`,
        description: 'WMS Process Flow',
        projectName,
        flowData,
        isActive: true,
      };

      if (currentFlowId) {
        await apiRequest('PUT', `/api/flows/${currentFlowId}`, payload);
        toast({
          title: 'Success',
          description: 'Process flow updated successfully',
        });
      } else {
        const response = await apiRequest('POST', '/api/flows', payload);
        const newFlow = await response.json();
        useFlowStore.getState().setCurrentFlowId(newFlow.id);
        toast({
          title: 'Success', 
          description: 'Process flow saved successfully',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save process flow',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    const flowData = getFlowData();
    const dataStr = JSON.stringify(flowData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wms-process-flow-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'Success',
      description: 'Process flow exported successfully',
    });
  };

  const handleUndo = () => {
    // TODO: Implement undo functionality
    toast({
      title: 'Info',
      description: 'Undo functionality coming soon',
    });
  };

  const handleRedo = () => {
    // TODO: Implement redo functionality  
    toast({
      title: 'Info',
      description: 'Redo functionality coming soon',
    });
  };

  const handleNewFlow = () => {
    clearFlow();
    toast({
      title: 'Success',
      description: 'New process flow created',
    });
  };

  return (
    <ReactFlowProvider>
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                WMS Process Flow Designer
              </h1>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>Project:</span>
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-48 h-8 text-sm font-medium text-gray-700 border-none bg-transparent p-0"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUndo}
                className="flex items-center space-x-2"
              >
                <Undo className="w-4 h-4" />
                <span>Undo</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRedo}
                className="flex items-center space-x-2"
              >
                <Redo className="w-4 h-4" />
                <span>Redo</span>
              </Button>
              
              <div className="h-4 w-px bg-gray-300" />
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewFlow}
                className="flex items-center space-x-2"
              >
                <span>New Flow</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Flow'}</span>
              </Button>
              
              <Button
                size="sm"
                onClick={handleExport}
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          <NodeLibrary />
          <FlowCanvas />
          <PropertiesPanel />
        </div>

        {/* Modals */}
        <NodeConfigModal />
      </div>
    </ReactFlowProvider>
  );
}
