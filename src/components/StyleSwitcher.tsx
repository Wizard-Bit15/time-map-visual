
import React from 'react';
import { CheckCircle, Map, Globe, Layers, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MapStyle } from '../types';
import { mapStyles, getMapStyleIcon } from '../utils/mapUtils';

interface StyleSwitcherProps {
  currentStyle: string;
  onStyleChange: (styleId: string) => void;
}

const StyleSwitcher = ({ currentStyle, onStyleChange }: StyleSwitcherProps) => {
  const renderIcon = (styleId: string) => {
    switch (styleId) {
      case 'streets':
        return <Map className="w-5 h-5" />;
      case 'satellite':
        return <Layers className="w-5 h-5" />;
      case 'light':
        return <Sun className="w-5 h-5" />;
      case 'dark':
        return <Moon className="w-5 h-5" />;
      default:
        return <Globe className="w-5 h-5" />;
    }
  };

  return (
    <div className="glass-panel p-3 w-full">
      <div className="grid grid-cols-2 gap-2">
        {mapStyles.map((style) => (
          <button
            key={style.id}
            className={cn(
              "flex items-center p-2 rounded-md transition-all",
              "hover:bg-primary/10",
              currentStyle === style.id ? "bg-primary/15 border-primary/30" : "border-transparent",
              "border relative overflow-hidden"
            )}
            onClick={() => onStyleChange(style.id)}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <div className="mr-2 text-primary/80">
                  {renderIcon(style.id)}
                </div>
                <span className="text-sm font-medium">{style.name}</span>
              </div>
              
              {currentStyle === style.id && (
                <CheckCircle className="w-4 h-4 text-primary animate-scale-in" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StyleSwitcher;
