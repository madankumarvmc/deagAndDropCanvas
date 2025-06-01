import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useFlowStore } from '@/stores/flowStore';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  receivingConfigSchema,
  palletizationConfigSchema,
  putawayConfigSchema,
  replenishmentConfigSchema,
  pickingConfigSchema,
  loadingConfigSchema,
  NODE_TYPES,
  type NodeType,
} from '@shared/schema';

const getConfigSchema = (nodeType: NodeType) => {
  switch (nodeType) {
    case NODE_TYPES.RECEIVING:
      return receivingConfigSchema;
    case NODE_TYPES.PALLETIZATION:
      return palletizationConfigSchema;
    case NODE_TYPES.PUTAWAY:
      return putawayConfigSchema;
    case NODE_TYPES.REPLENISHMENT:
      return replenishmentConfigSchema;
    case NODE_TYPES.PICKING:
      return pickingConfigSchema;
    case NODE_TYPES.LOADING:
      return loadingConfigSchema;
    default:
      return receivingConfigSchema;
  }
};

const getDefaultConfig = (nodeType: NodeType) => {
  const baseConfig = {
    processName: '',
    priority: 'medium' as const,
  };

  switch (nodeType) {
    case NODE_TYPES.RECEIVING:
      return {
        ...baseConfig,
        processName: 'Receiving',
        grnPattern: 'AUTO-{YYYY}-{###}',
        qualityCheckRequired: true,
        crossDockEnabled: false,
        expectedItems: 125,
        tolerance: 5,
        qualityFailAction: 'quarantine' as const,
        excessAction: 'partial' as const,
      };
    case NODE_TYPES.PALLETIZATION:
      return {
        ...baseConfig,
        processName: 'Palletization',
        strategy: 'mixed' as const,
        maxHeight: 2.1,
        maxWeight: 800,
        stackingRules: true,
        labelPrint: true,
      };
    case NODE_TYPES.PUTAWAY:
      return {
        ...baseConfig,
        processName: 'Putaway',
        strategy: 'FIFO' as const,
        zone: 'A1-A5',
        locationAssignment: 'automatic' as const,
        capacityCheck: true,
      };
    case NODE_TYPES.REPLENISHMENT:
      return {
        ...baseConfig,
        processName: 'Replenishment',
        triggerType: 'min-max' as const,
        replenishmentType: 'both' as const,
        sourceLocation: 'RESERVE-01',
        minQuantity: 10,
        maxQuantity: 100,
      };
    case NODE_TYPES.PICKING:
      return {
        ...baseConfig,
        processName: 'Picking',
        pickingStrategy: 'batch' as const,
        batchAllocation: 'automatic' as const,
        pickingMethod: 'rf' as const,
        qualityCheck: false,
      };
    case NODE_TYPES.LOADING:
      return {
        ...baseConfig,
        processName: 'Loading',
        loadingStrategy: 'route-based' as const,
        truckType: 'Standard',
        maxWeight: 1000,
        maxVolume: 50,
        sealRequired: true,
      };
    default:
      return baseConfig;
  }
};

export default function NodeConfigModal() {
  const { toast } = useToast();
  const {
    nodes,
    selectedNodeId,
    isConfigModalOpen,
    setConfigModalOpen,
    updateNode,
    currentFlowId,
  } = useFlowStore();

  const [isSaving, setIsSaving] = useState(false);

  const selectedNode = selectedNodeId 
    ? nodes.find(node => node.id === selectedNodeId)
    : null;

  const nodeType = selectedNode?.data?.nodeType as NodeType;
  const configSchema = nodeType ? getConfigSchema(nodeType) : receivingConfigSchema;

  const form = useForm({
    resolver: zodResolver(configSchema),
    defaultValues: getDefaultConfig(nodeType || NODE_TYPES.RECEIVING),
  });

  // Reset form when node changes
  useEffect(() => {
    if (selectedNode && isConfigModalOpen) {
      const currentConfig = selectedNode.data?.config;
      const defaultConfig = getDefaultConfig(nodeType);
      
      // Merge current config with defaults
      const formValues = { ...defaultConfig, ...currentConfig };
      
      form.reset(formValues);
    }
  }, [selectedNode, isConfigModalOpen, nodeType, form]);

  const onSubmit = async (data: any) => {
    if (!selectedNode || !selectedNodeId || !nodeType) return;

    try {
      setIsSaving(true);

      // Save configuration to backend if we have a flow ID
      if (currentFlowId) {
        const configPayload = {
          nodeId: selectedNodeId,
          nodeType,
          configuration: data,
          flowId: currentFlowId,
        };

        await apiRequest('POST', '/api/nodes/config', configPayload);
      }

      // Update node in store
      updateNode(selectedNodeId, { config: data });

      toast({
        title: 'Success',
        description: 'Node configuration saved successfully',
      });

      setConfigModalOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save node configuration',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setConfigModalOpen(false);
    form.reset();
  };

  if (!selectedNode || !nodeType) {
    return null;
  }

  return (
    <Dialog open={isConfigModalOpen} onOpenChange={setConfigModalOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
              style={{ backgroundColor: selectedNode.data.bgColor }}
            >
              {selectedNode.data.icon}
            </div>
            <div>
              <DialogTitle className="text-xl">
                {selectedNode.data.label} Configuration
              </DialogTitle>
              <p className="text-sm text-gray-500">
                Configure {nodeType} process parameters
              </p>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* General Settings */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">General Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="processName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Process Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Node-Specific Configuration */}
            {nodeType === NODE_TYPES.RECEIVING && (
              <ReceivingConfig form={form} />
            )}
            {nodeType === NODE_TYPES.PALLETIZATION && (
              <PalletizationConfig form={form} />
            )}
            {nodeType === NODE_TYPES.PUTAWAY && (
              <PutawayConfig form={form} />
            )}
            {nodeType === NODE_TYPES.REPLENISHMENT && (
              <ReplenishmentConfig form={form} />
            )}
            {nodeType === NODE_TYPES.PICKING && (
              <PickingConfig form={form} />
            )}
            {nodeType === NODE_TYPES.LOADING && (
              <LoadingConfig form={form} />
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Configuration'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Node-specific configuration components
function ReceivingConfig({ form }: { form: any }) {
  return (
    <div>
      <h4 className="text-lg font-medium text-gray-900 mb-4">Receiving Parameters</h4>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="grnPattern"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expected GRN Pattern</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Use {'{YYYY}'} for year, {'{###}'} for sequence number
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="expectedItems"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expected Items</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tolerance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tolerance (%)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-3">
          <FormField
            control={form.control}
            name="qualityCheckRequired"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Quality Check Required</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="crossDockEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Enable Cross-Docking</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}

function PalletizationConfig({ form }: { form: any }) {
  return (
    <div>
      <h4 className="text-lg font-medium text-gray-900 mb-4">Palletization Parameters</h4>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="strategy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Palletization Strategy</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="mixed">Mixed</SelectItem>
                  <SelectItem value="single-sku">Single SKU</SelectItem>
                  <SelectItem value="weight-based">Weight-based</SelectItem>
                  <SelectItem value="size-based">Size-based</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="maxHeight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Height (m)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxWeight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Weight (kg)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}

function PutawayConfig({ form }: { form: any }) {
  return (
    <div>
      <h4 className="text-lg font-medium text-gray-900 mb-4">Putaway Parameters</h4>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="strategy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Putaway Strategy</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="FIFO">FIFO</SelectItem>
                  <SelectItem value="LIFO">LIFO</SelectItem>
                  <SelectItem value="random">Random</SelectItem>
                  <SelectItem value="directed">Directed</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="zone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Zone</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

function ReplenishmentConfig({ form }: { form: any }) {
  return (
    <div>
      <h4 className="text-lg font-medium text-gray-900 mb-4">Replenishment Parameters</h4>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="triggerType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trigger Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="min-max">Min-Max</SelectItem>
                  <SelectItem value="demand-based">Demand-based</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="minQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Quantity</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Quantity</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}

function PickingConfig({ form }: { form: any }) {
  return (
    <div>
      <h4 className="text-lg font-medium text-gray-900 mb-4">Picking Parameters</h4>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="pickingStrategy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Picking Strategy</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="batch">Batch</SelectItem>
                  <SelectItem value="wave">Wave</SelectItem>
                  <SelectItem value="zone">Zone</SelectItem>
                  <SelectItem value="discrete">Discrete</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pickingMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Picking Method</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="paper">Paper</SelectItem>
                  <SelectItem value="rf">RF</SelectItem>
                  <SelectItem value="voice">Voice</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

function LoadingConfig({ form }: { form: any }) {
  return (
    <div>
      <h4 className="text-lg font-medium text-gray-900 mb-4">Loading Parameters</h4>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="loadingStrategy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loading Strategy</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="route-based">Route-based</SelectItem>
                  <SelectItem value="time-based">Time-based</SelectItem>
                  <SelectItem value="capacity-based">Capacity-based</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="truckType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Truck Type</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="maxWeight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Weight (kg)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxVolume"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Volume (m³)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
