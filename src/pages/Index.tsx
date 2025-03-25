import React, { useState, useEffect } from 'react';
import WorldMap from '../components/WorldMap';
import TimeDisplay from '../components/TimeDisplay';
import StyleSwitcher from '../components/StyleSwitcher';
import MapControls from '../components/MapControls';
import TimeZoneManager from '../components/TimeZoneManager';
import CustomPins from '../components/CustomPins';
import DataLayersControl from '../components/DataLayersControl';
import { DataLayer } from '../components/DataLayersControl';
import { CustomPin } from '../components/CustomPins';
import { mapStyles, getMapStyleById, getMapboxToken, setMapboxToken } from '../utils/mapUtils';
import { MapStyle, TimeZone } from '../types';
import { cn } from '@/lib/utils';
import { PanelRightClose, PanelRight, Layers, CloudSun, Plane, Ship, Globe, MapPin } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Index = () => {
  const [mapboxToken, setMapboxTokenState] = useState<string | null>(getMapboxToken());
  const [currentMapStyle, setCurrentMapStyle] = useState<MapStyle>(mapStyles[0]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [timeZones, setTimeZones] = useState<TimeZone[]>([]);
  const [customPins, setCustomPins] = useState<CustomPin[]>([]);
  const [dataLayers, setDataLayers] = useState<DataLayer[]>([
    { id: 'day-night', name: 'Day/Night Overlay', enabled: true, icon: <CloudSun className="w-4 h-4" /> },
    { id: 'sun-position', name: 'Sun Position', enabled: true, icon: <Globe className="w-4 h-4" /> },
    { id: 'air-traffic', name: 'Air Traffic', enabled: false, icon: <Plane className="w-4 h-4" />, premium: true },
    { id: 'maritime-routes', name: 'Maritime Routes', enabled: false, icon: <Ship className="w-4 h-4" />, premium: true },
    { id: 'custom-pins', name: 'Custom Locations', enabled: true, icon: <MapPin className="w-4 h-4" /> }
  ]);
  
  const handleStyleChange = (styleId: string) => {
    const newStyle = getMapStyleById(styleId);
    setCurrentMapStyle(newStyle);
  };
  
  const handleMapboxTokenSubmit = (token: string) => {
    setMapboxToken(token);
    setMapboxTokenState(token);
  };
  
  const handleZoomIn = () => console.log('Zoom in');
  const handleZoomOut = () => console.log('Zoom out');
  const handleReset = () => console.log('Reset view');
  
  const handleFullScreen = () => {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  const handleLayerToggle = (layerId: string, enabled: boolean) => {
    setDataLayers(prevLayers => 
      prevLayers.map(layer => 
        layer.id === layerId ? { ...layer, enabled } : layer
      )
    );
  };
  
  const enabledLayerIds = dataLayers
    .filter(layer => layer.enabled && !layer.premium)
    .map(layer => layer.id);
  
  return (
    <div className="w-screen h-screen overflow-hidden bg-background flex">
      <main className="w-full h-full flex relative">
        <div className="flex-1 relative h-full overflow-hidden rounded-lg">
          <WorldMap 
            mapboxToken={mapboxToken}
            mapStyle={currentMapStyle}
            showDayNight={true}
            showSun={true}
            enabledLayers={enabledLayerIds}
            customPins={dataLayers.find(l => l.id === 'custom-pins')?.enabled ? customPins : []}
          />
          
          <div className="absolute top-4 right-4 z-10">
            <MapControls
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onReset={handleReset}
              onFullScreen={handleFullScreen}
            />
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <button className="absolute top-20 right-4 z-10 glass-panel p-2 rounded-full hover:bg-primary/10 transition-colors">
                <Layers className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent>
              <div className="space-y-4 pt-6">
                <h2 className="text-lg font-semibold mb-4">Map Configuration</h2>
                
                <DataLayersControl 
                  layers={dataLayers} 
                  onLayerToggle={handleLayerToggle} 
                />
                
                {dataLayers.find(l => l.id === 'custom-pins')?.enabled && (
                  <CustomPins 
                    pins={customPins} 
                    onPinsChange={setCustomPins} 
                  />
                )}
                
                <StyleSwitcher
                  currentStyle={currentMapStyle.id}
                  onStyleChange={handleStyleChange}
                />
              </div>
            </SheetContent>
          </Sheet>
          
          <button
            className="absolute bottom-4 right-4 z-10 glass-panel p-2 rounded-full hover:bg-primary/10 transition-colors"
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <PanelRight className="w-5 h-5" />
            ) : (
              <PanelRightClose className="w-5 h-5" />
            )}
          </button>
        </div>
        
        <div 
          className={cn(
            "h-full transition-all duration-300 ease-in-out transform glass-panel ml-4",
            sidebarCollapsed ? "w-0 opacity-0 translate-x-full" : "w-80 opacity-100 translate-x-0"
          )}
        >
          <div className="h-full flex flex-col space-y-4 p-4 overflow-hidden overflow-y-auto">
            <TimeDisplay />
            <TimeZoneManager onTimeZonesChange={setTimeZones} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
