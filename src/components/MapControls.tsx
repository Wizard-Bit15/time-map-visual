
import React from 'react';
import { Plus, Minus, RotateCw, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFullScreen: () => void;
}

const MapControls = ({
  onZoomIn,
  onZoomOut,
  onReset,
  onFullScreen
}: MapControlsProps) => {
  return (
    <div className="glass-panel p-1.5 space-y-1.5">
      <ControlButton icon={<Plus className="w-4 h-4" />} onClick={onZoomIn} label="Zoom in" />
      <ControlButton icon={<Minus className="w-4 h-4" />} onClick={onZoomOut} label="Zoom out" />
      <div className="w-full h-px bg-white/10 my-1.5" />
      <ControlButton icon={<RotateCw className="w-4 h-4" />} onClick={onReset} label="Reset view" />
      <ControlButton icon={<Maximize2 className="w-4 h-4" />} onClick={onFullScreen} label="Full screen" />
    </div>
  );
};

interface ControlButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  label: string;
}

const ControlButton = ({ icon, onClick, label }: ControlButtonProps) => {
  return (
    <button
      className={cn(
        "w-8 h-8 flex items-center justify-center rounded-md",
        "transition-all duration-200 ease-in-out",
        "hover:bg-primary/10 active:bg-primary/20",
        "focus:outline-none focus:ring-1 focus:ring-primary/30"
      )}
      onClick={onClick}
      title={label}
      aria-label={label}
    >
      {icon}
    </button>
  );
};

export default MapControls;
