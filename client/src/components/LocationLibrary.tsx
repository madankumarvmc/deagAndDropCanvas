import { useState } from 'react';
import { Search, MapPin, ArrowRight, Settings, Menu, ChevronLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWarehouseStore } from '@/stores/warehouseStore';
import type { LocationNodeType, MovementTaskType, LocationTaskType } from '@shared/framework-config';

export default function LocationLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('locations');
  const { 
    setDraggedLocationTypeId, 
    frameworkConfig,
    isCreatingMovementTask,
    pendingMovementTask,
    setCreatingMovementTask,
    setPendingMovementTask,
    isSidebarCollapsed,
    toggleSidebar
  } = useWarehouseStore();

  const filteredLocationTypes = frameworkConfig.locationNodeTypes.filter(
    (type) =>
      type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMovementTypes = frameworkConfig.movementTaskTypes.filter(
    (type) =>
      type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLocationTaskTypes = frameworkConfig.locationTaskTypes.filter(
    (type) =>
      type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupLocationsByCategory = (types: LocationNodeType[]) => {
    const allowedCategories = frameworkConfig.ui?.tabs?.locations?.categories || [];
    return types.reduce((acc, type) => {
      // Only include types that belong to categories defined in the JSON config
      if (allowedCategories.includes(type.category)) {
        if (!acc[type.category]) {
          acc[type.category] = [];
        }
        acc[type.category].push(type);
      }
      return acc;
    }, {} as Record<string, LocationNodeType[]>);
  };

  const groupMovementsByCategory = (types: MovementTaskType[]) => {
    const allowedCategories = frameworkConfig.ui?.tabs?.movements?.categories || [];
    return types.reduce((acc, type) => {
      // Only include types that belong to categories defined in the JSON config
      if (allowedCategories.includes(type.category)) {
        if (!acc[type.category]) {
          acc[type.category] = [];
        }
        acc[type.category].push(type);
      }
      return acc;
    }, {} as Record<string, MovementTaskType[]>);
  };

  const groupLocationTasksByCategory = (types: LocationTaskType[]) => {
    const allowedCategories = frameworkConfig.ui?.tabs?.tasks?.categories || [];
    return types.reduce((acc, type) => {
      // Only include types that belong to categories defined in the JSON config
      if (allowedCategories.includes(type.category)) {
        if (!acc[type.category]) {
          acc[type.category] = [];
        }
        acc[type.category].push(type);
      }
      return acc;
    }, {} as Record<string, LocationTaskType[]>);
  };

  const handleLocationDragStart = (event: React.DragEvent, typeId: string) => {
    setDraggedLocationTypeId(typeId);
    event.dataTransfer.setData('application/reactflow', typeId);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleLocationDragEnd = () => {
    setDraggedLocationTypeId(null);
  };

  const handleMovementTaskClick = (taskTypeId: string) => {
    // Store the selected movement task type for creating edges
    setCreatingMovementTask(true);
    setPendingMovementTask({
      sourceLocationId: '',
      targetLocationId: '',
      taskTypeId: taskTypeId
    });
  };

  const groupedLocations = groupLocationsByCategory(filteredLocationTypes);
  const groupedMovements = groupMovementsByCategory(filteredMovementTypes);
  const groupedLocationTasks = groupLocationTasksByCategory(filteredLocationTaskTypes);

  return (
    <aside className={`${isSidebarCollapsed ? 'w-16' : 'w-80'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out`}>
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 hover:bg-gray-100"
          title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
        
        {!isSidebarCollapsed && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 flex-1 ml-3">
              {frameworkConfig.ui?.libraryTitle || 'Warehouse Elements'}
            </h2>
          </>
        )}
      </div>
      
      {!isSidebarCollapsed && (
        <div className="px-4 pb-4">
          <div className="relative">
            <Input
              type="text"
              placeholder={frameworkConfig.ui?.searchPlaceholder || 'Search elements...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto">
        {isSidebarCollapsed ? (
          // Collapsed view - vertical icon stack
          <div className="flex flex-col items-center py-4 space-y-4">
            <Button
              variant={selectedTab === 'locations' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setSelectedTab('locations')}
              className="h-10 w-10"
              title={frameworkConfig.ui?.tabs?.locations?.label || 'Locations'}
            >
              <MapPin className="w-4 h-4" />
            </Button>
            <Button
              variant={selectedTab === 'movements' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setSelectedTab('movements')}
              className="h-10 w-10"
              title={frameworkConfig.ui?.tabs?.movements?.label || 'Movements'}
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant={selectedTab === 'tasks' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setSelectedTab('tasks')}
              className="h-10 w-10"
              title={frameworkConfig.ui?.tabs?.tasks?.label || 'Tasks'}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          // Expanded view - normal tabs
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="locations" className="text-xs">
                <MapPin className="w-3 h-3 mr-1" />
                {frameworkConfig.ui?.tabs?.locations?.label || 'Locations'}
              </TabsTrigger>
              <TabsTrigger value="movements" className="text-xs">
                <ArrowRight className="w-3 h-3 mr-1" />
                {frameworkConfig.ui?.tabs?.movements?.label || 'Movements'}
              </TabsTrigger>
              <TabsTrigger value="tasks" className="text-xs">
                <Settings className="w-3 h-3 mr-1" />
                {frameworkConfig.ui?.tabs?.tasks?.label || 'Tasks'}
              </TabsTrigger>
            </TabsList>
          
          <TabsContent value="locations" className="mt-0">
            <div className="p-4 space-y-6">
              <div className="text-xs text-blue-600 font-medium bg-blue-50 p-2 rounded">
                {frameworkConfig.ui?.tabs?.locations?.instruction || 'Drag locations onto the canvas to create warehouse areas'}
              </div>
              
              {Object.entries(groupedLocations).map(([category, types]) => (
                <div key={category} className="group">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                    {category}
                  </h3>
                  
                  <div className="space-y-2">
                    {types.map((type) => (
                      <div
                        key={type.id}
                        draggable
                        onDragStart={(e) => handleLocationDragStart(e, type.id)}
                        onDragEnd={handleLocationDragEnd}
                        className="rounded-lg border-2 p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200"
                        style={{
                          backgroundColor: type.bgColor,
                          borderColor: type.borderColor,
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                            style={{ backgroundColor: `${type.color}20` }}
                          >
                            {type.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">
                              {type.name}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {type.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="movements" className="mt-0">
            <div className="p-4 space-y-6">
              <div className="text-xs text-green-600 font-medium bg-green-50 p-2 rounded">
                {isCreatingMovementTask 
                  ? (pendingMovementTask?.sourceLocationId 
                      ? "Now click the target location to complete the connection"
                      : "Click the source location to start the connection")
                  : (frameworkConfig.ui?.tabs?.movements?.instruction || 'Select a movement type, then connect two locations')
                }
              </div>
              
              {Object.entries(groupedMovements).map(([category, types]) => (
                <div key={category} className="group">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                    {category}
                  </h3>
                  
                  <div className="space-y-2">
                    {types.map((type) => (
                      <div
                        key={type.id}
                        onClick={() => handleMovementTaskClick(type.id)}
                        className={`
                          rounded-lg border-2 p-3 cursor-pointer hover:shadow-md transition-all duration-200
                          ${isCreatingMovementTask && pendingMovementTask?.taskTypeId === type.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                        `}
                        style={{
                          backgroundColor: `${type.color}10`,
                          borderColor: type.color,
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                            style={{ backgroundColor: `${type.color}20` }}
                          >
                            {type.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">
                              {type.name}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {type.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="tasks" className="mt-0">
            <div className="p-4 space-y-6">
              <div className="text-xs text-purple-600 font-medium bg-purple-50 p-2 rounded">
                {frameworkConfig.ui?.tabs?.tasks?.instruction || 'These tasks can be attached to compatible location types'}
              </div>
              
              {Object.entries(groupedLocationTasks).map(([category, types]) => (
                <div key={category} className="group">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                    {category}
                  </h3>
                  
                  <div className="space-y-2">
                    {types.map((type) => (
                      <div
                        key={type.id}
                        className="rounded-lg border-2 p-3"
                        style={{
                          backgroundColor: type.bgColor,
                          borderColor: type.color,
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                            style={{ backgroundColor: `${type.color}20` }}
                          >
                            {type.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">
                              {type.name}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {type.description}
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              Compatible: {type.compatibleLocationTypes.join(', ')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </aside>
  );
}