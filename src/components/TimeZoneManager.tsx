
import React, { useState, useEffect } from 'react';
import { TimeZone } from '../types';
import { Plus, X, Check } from 'lucide-react';
import { getDefaultTimeZones, updateAllTimeZones } from '../utils/timeUtils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

interface TimeZoneManagerProps {
  onTimeZonesChange?: (timeZones: TimeZone[]) => void;
}

// Popular time zones for quick selection
const popularTimeZones = [
  { id: 'America/Los_Angeles', name: 'Los Angeles', abbr: 'PT', offset: -8 },
  { id: 'America/Chicago', name: 'Chicago', abbr: 'CT', offset: -6 },
  { id: 'Asia/Shanghai', name: 'Shanghai', abbr: 'CST', offset: 8 },
  { id: 'Asia/Dubai', name: 'Dubai', abbr: 'GST', offset: 4 },
  { id: 'Europe/Paris', name: 'Paris', abbr: 'CET', offset: 1 },
  { id: 'Australia/Sydney', name: 'Sydney', abbr: 'AEST', offset: 10 },
];

const TimeZoneManager: React.FC<TimeZoneManagerProps> = ({ onTimeZonesChange }) => {
  const [timeZones, setTimeZones] = useState<TimeZone[]>(getDefaultTimeZones());
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeZones(prevTimeZones => updateAllTimeZones(prevTimeZones));
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    if (onTimeZonesChange) {
      onTimeZonesChange(timeZones);
    }
  }, [timeZones, onTimeZonesChange]);
  
  const addTimeZone = (newTz: Partial<TimeZone>) => {
    const tzExists = timeZones.some(tz => tz.id === newTz.id);
    
    if (!tzExists && newTz.id) {
      const now = new Date();
      
      // Create a proper time zone object
      const timeZoneToAdd: TimeZone = {
        id: newTz.id,
        name: newTz.name || newTz.id,
        abbr: newTz.abbr || 'GMT',
        offset: newTz.offset || 0,
        current: now
      };
      
      setTimeZones(prev => updateAllTimeZones([...prev, timeZoneToAdd]));
    }
  };
  
  const removeTimeZone = (timeZoneId: string) => {
    setTimeZones(prev => prev.filter(tz => tz.id !== timeZoneId));
  };
  
  return (
    <div className="glass-panel p-4 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">Time Zones</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={cn(
              "p-1 rounded-md text-xs transition-colors",
              isEditing 
                ? "bg-primary/20 text-primary" 
                : "hover:bg-primary/10"
            )}
          >
            {isEditing ? <Check className="w-4 h-4" /> : "Edit"}
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="p-1 rounded-md hover:bg-primary/10 transition-colors">
              <Plus className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-2 w-56">
              <div className="mb-2">
                <input
                  type="text"
                  placeholder="Search time zones..."
                  className="w-full p-1 text-xs rounded border border-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="max-h-48 overflow-y-auto">
                {popularTimeZones
                  .filter(tz => 
                    tz.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    tz.id.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(tz => (
                    <DropdownMenuItem
                      key={tz.id}
                      className="text-xs cursor-pointer"
                      onClick={() => addTimeZone(tz)}
                    >
                      <span>{tz.name}</span>
                      <span className="ml-auto text-muted-foreground">{tz.abbr}</span>
                    </DropdownMenuItem>
                  ))
                }
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {timeZones.map((tz) => (
          <div 
            key={tz.id}
            className={cn(
              "flex justify-between items-center p-2 rounded-md",
              "hover:bg-primary/5 transition-colors border border-transparent hover:border-primary/10",
              "text-xs"
            )}
          >
            <div className="flex-1">
              <div className="font-medium">{tz.name}</div>
              <div className="text-xs text-muted-foreground">{tz.abbr} (UTC{tz.offset >= 0 ? '+' : ''}{tz.offset})</div>
            </div>
            
            {isEditing && (
              <button 
                onClick={() => removeTimeZone(tz.id)}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimeZoneManager;
