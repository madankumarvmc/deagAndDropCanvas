import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { cn } from '@/lib/utils';
import { useFlowStore } from '@/stores/flowStore';

interface ProcessNodeData {
  nodeType: string;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  config?: any;
  description?: string;
  status?: 'active' | 'inactive' | 'draft';
}

const ProcessNode = memo(({ data, selected, id }: NodeProps<ProcessNodeData>) => {
  const { setSelectedNodeId, setConfigModalOpen } = useFlowStore();

  const handleDoubleClick = () => {
    setSelectedNodeId(id);
    setConfigModalOpen(true);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'inactive':
        return '#6b7280';
      case 'draft':
        return '#f59e0b';
      default:
        return '#10b981';
    }
  };

  return (
    <div
      className={cn(
        'bg-white border-2 rounded-xl shadow-lg p-4 w-48 cursor-pointer hover:shadow-xl transition-all duration-200',
        selected && 'ring-2 ring-blue-500 ring-offset-2'
      )}
      style={{ borderColor: data.borderColor }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !border-2 !border-white shadow-sm"
        style={{ backgroundColor: data.color }}
      />

      {/* Node Content */}
      <div className="flex items-center space-x-3 mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
          style={{ backgroundColor: data.bgColor }}
        >
          {data.icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm">{data.label}</h3>
          {data.config && (
            <p className="text-xs text-gray-500">
              {data.config.processName || 'Configured'}
            </p>
          )}
        </div>
        <div
          className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
          style={{ backgroundColor: getStatusColor(data.status) }}
        />
      </div>

      {/* Node Details */}
      {data.config && (
        <div className="space-y-1 text-xs text-gray-600">
          {/* Show first 2 config items */}
          {Object.entries(data.config).slice(0, 2).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="truncate">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
              </span>
              <span className="font-medium ml-2 truncate">
                {typeof value === 'boolean' 
                  ? (value ? 'Yes' : 'No') 
                  : String(value).slice(0, 8)
                }
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !border-2 !border-white shadow-sm"
        style={{ backgroundColor: data.color }}
      />

      {/* Configuration Indicator */}
      {!data.config && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">!</span>
        </div>
      )}
    </div>
  );
});

ProcessNode.displayName = 'ProcessNode';

export default ProcessNode;
