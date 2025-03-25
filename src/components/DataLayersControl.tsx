
import React from 'react';
import { Layers, Plane, Ship, CloudSun, Globe, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DataLayer {
  id: string;
  name: string;
  enabled: boolean;
  icon: React.ReactNode;
  premium?: boolean;
}

interface DataLayersControlProps {
  layers: DataLayer[];
  onLayerToggle: (layerId: string, enabled: boolean) => void;
  className?: string;
}

const DataLayersControl: React.FC<DataLayersControlProps> = ({
  layers,
  onLayerToggle,
  className
}) => {
  return (
    <div className={cn("glass-panel p-4", className)}>
      <div className="flex items-center mb-3">
        <Layers className="w-4 h-4 mr-2" />
        <h3 className="text-sm font-semibold">Map Layers</h3>
      </div>
      
      <div className="space-y-2">
        {layers.map(layer => (
          <div 
            key={layer.id} 
            className={cn(
              "flex items-center justify-between p-2 rounded-md text-xs",
              "transition-colors",
              layer.enabled 
                ? "bg-primary/10 border border-primary/20" 
                : "hover:bg-primary/5 border border-transparent"
            )}
          >
            <div className="flex items-center">
              <div className="w-5 h-5 mr-2 flex items-center justify-center">
                {layer.icon}
              </div>
              <span className="font-medium">{layer.name}</span>
              {layer.premium && (
                <span className="ml-2 px-1.5 py-0.5 bg-primary/20 text-primary rounded text-[10px]">
                  PRO
                </span>
              )}
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={layer.enabled}
                onChange={(e) => onLayerToggle(layer.id, e.target.checked)}
                disabled={layer.premium}
              />
              <div className={cn(
                "w-9 h-5 bg-gray-200 rounded-full peer",
                "dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2",
                "peer-focus:ring-primary peer-checked:after:translate-x-full",
                "after:content-[''] after:absolute after:top-[2px] after:left-[2px]",
                "after:bg-white after:border-gray-300 after:border after:rounded-full",
                "after:h-4 after:w-4 after:transition-all",
                "peer-checked:bg-primary",
                layer.premium ? "opacity-50" : ""
              )}></div>
            </label>
          </div>
        ))}
      </div>
      
      {layers.some(layer => layer.premium) && (
        <div className="mt-3 text-xs text-muted-foreground border-t border-muted pt-2">
          <p>Upgrade to Pro to unlock premium layers</p>
        </div>
      )}
    </div>
  );
};

export default DataLayersControl;
