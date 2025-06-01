import React, { useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Download, Undo, Redo } from 'lucide-react';
import { useWarehouseStore } from '@/stores/warehouseStore';
import LocationLibrary from './LocationLibrary';
import WarehouseCanvas from './WarehouseCanvas';
import WarehousePropertiesPanel from './WarehousePropertiesPanel';
import DynamicConfigModal from './DynamicConfigModal';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { defaultFrameworkConfig } from '@shared/framework-config';

export default function WarehouseFlowDesigner() {
  const { toast } = useToast();
  const {
    currentFlowId,
    warehouseName,
    setWarehouseName,
    getWarehouseFlowData,
    clearWarehouse,
    setFrameworkConfig,
  } = useWarehouseStore();

  const [isSaving, setIsSaving] = useState(false);

  // Load framework configuration
  const { data: frameworkConfig } = useQuery({
    queryKey: ['/api/framework-config'],
  });

  // Update framework config when loaded
  React.useEffect(() => {
    if (frameworkConfig) {
      setFrameworkConfig(frameworkConfig);
    } else {
      setFrameworkConfig(defaultFrameworkConfig);
    }
  }, [frameworkConfig, setFrameworkConfig]);

  // Load current flow if one is selected
  const { data: currentFlow } = useQuery({
    queryKey: ['/api/warehouse-flows', currentFlowId],
    enabled: !!currentFlowId,
  });

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const flowData = getWarehouseFlowData();
      
      const payload = {
        name: `Warehouse Flow - ${new Date().toLocaleString()}`,
        description: 'Warehouse Management System Flow',
        warehouseName,
        flowData,
        frameworkConfig: defaultFrameworkConfig,
        isActive: true,
      };

      if (currentFlowId) {
        await apiRequest('PUT', `/api/warehouse-flows/${currentFlowId}`, payload);
        toast({
          title: 'Success',
          description: 'Warehouse flow updated successfully',
        });
      } else {
        const response = await apiRequest('POST', '/api/warehouse-flows', payload);
        const newFlow = await response.json();
        useWarehouseStore.getState().setCurrentFlowId(newFlow.id);
        toast({
          title: 'Success', 
          description: 'Warehouse flow saved successfully',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save warehouse flow',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    const flowData = getWarehouseFlowData();
    const dataStr = JSON.stringify(flowData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `warehouse-flow-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'Success',
      description: 'Warehouse flow exported successfully',
    });
  };

  const handleUndo = () => {
    toast({
      title: 'Info',
      description: 'Undo functionality coming soon',
    });
  };

  const handleRedo = () => {
    toast({
      title: 'Info',
      description: 'Redo functionality coming soon',
    });
  };

  const handleNewFlow = () => {
    clearWarehouse();
    toast({
      title: 'Success',
      description: 'New warehouse flow created',
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
                {frameworkConfig?.ui?.appTitle || 'Warehouse Flow Designer'}
              </h1>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{frameworkConfig?.ui?.warehouseLabel || 'Warehouse:'}</span>
                <Input
                  value={warehouseName}
                  onChange={(e) => setWarehouseName(e.target.value)}
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
                <span>{frameworkConfig?.ui?.actions?.undo || 'Undo'}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRedo}
                className="flex items-center space-x-2"
              >
                <Redo className="w-4 h-4" />
                <span>{frameworkConfig?.ui?.actions?.redo || 'Redo'}</span>
              </Button>
              
              <div className="h-4 w-px bg-gray-300" />
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewFlow}
                className="flex items-center space-x-2"
              >
                <span>{frameworkConfig?.ui?.actions?.newFlow || 'New Flow'}</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : (frameworkConfig?.ui?.actions?.saveFlow || 'Save Flow')}</span>
              </Button>
              
              <Button
                size="sm"
                onClick={handleExport}
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>{frameworkConfig?.ui?.actions?.export || 'Export'}</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden h-full">
          <LocationLibrary />
          <div className="flex-1 h-full">
            <WarehouseCanvas />
          </div>
          <WarehousePropertiesPanel />
        </div>

        {/* Modals */}
        <DynamicConfigModal />
      </div>
    </ReactFlowProvider>
  );
}