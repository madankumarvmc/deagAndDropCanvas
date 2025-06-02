import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useFlowStore } from '@/stores/flowStore';
import { NODE_TYPES, type NodeType } from '@shared/schema';

interface NodeTypeInfo {
  type: NodeType;
  category: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const nodeTypes: NodeTypeInfo[] = [
  {
    type: NODE_TYPES.RECEIVING,
    category: 'Inbound Operations',
    label: 'Receiving',
    description: 'Goods receipt and inspection',
    icon: '🚛',
    color: '#10b981',
    bgColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  {
    type: NODE_TYPES.PALLETIZATION,
    category: 'Inbound Operations',
    label: 'Palletization',
    description: 'Organize items on pallets',
    icon: '📦',
    color: '#3b82f6',
    bgColor: '#dbeafe',
    borderColor: '#2563eb',
  },
  {
    type: NODE_TYPES.PUTAWAY,
    category: 'Inbound Operations',
    label: 'Putaway',
    description: 'Store items in locations',
    icon: '🏪',
    color: '#8b5cf6',
    bgColor: '#ede9fe',
    borderColor: '#7c3aed',
  },
  {
    type: NODE_TYPES.REPLENISHMENT,
    category: 'Outbound Operations',
    label: 'Replenishment',
    description: 'Restock picking locations',
    icon: '🔄',
    color: '#f59e0b',
    bgColor: '#fef3c7',
    borderColor: '#d97706',
  },
  {
    type: NODE_TYPES.PICKING,
    category: 'Outbound Operations',
    label: 'Picking',
    description: 'Select items for orders',
    icon: '✋',
    color: '#ef4444',
    bgColor: '#fee2e2',
    borderColor: '#dc2626',
  },
  {
    type: NODE_TYPES.LOADING,
    category: 'Outbound Operations',
    label: 'Loading',
    description: 'Load items for shipment',
    icon: '🚚',
    color: '#06b6d4',
    bgColor: '#cffafe',
    borderColor: '#0891b2',
  },
];

export default function NodeLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const { setDraggedNodeType } = useFlowStore();

  const filteredNodes = nodeTypes.filter(
    (node) =>
      node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedNodes = filteredNodes.reduce((acc, node) => {
    if (!acc[node.category]) {
      acc[node.category] = [];
    }
    acc[node.category].push(node);
    return acc;
  }, {} as Record<string, NodeTypeInfo[]>);

  const handleDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    setDraggedNodeType(nodeType);
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedNodeType(null);
  };

  return (
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Process Nodes</h2>
        <div className="relative">
          <Input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {Object.entries(groupedNodes).map(([category, nodes]) => (
            <div key={category} className="group">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                {category}
              </h3>
              
              <div className="space-y-2">
                {nodes.map((node) => (
                  <div
                    key={node.type}
                    draggable
                    onDragStart={(e) => handleDragStart(e, node.type)}
                    onDragEnd={handleDragEnd}
                    className="rounded-lg border-2 p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200"
                    style={{
                      backgroundColor: node.bgColor,
                      borderColor: node.borderColor,
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                        style={{ backgroundColor: `${node.color}20` }}
                      >
                        {node.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {node.label}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {node.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredNodes.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 text-sm">
                No nodes found matching "{searchQuery}"
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
