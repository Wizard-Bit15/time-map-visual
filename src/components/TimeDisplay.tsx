
import React, { useState, useEffect } from 'react';
import { Clock, Globe } from 'lucide-react';
import { getDefaultTimeZones, formatTime, formatDate, updateAllTimeZones } from '../utils/timeUtils';
import { TimeZone } from '../types';
import { cn } from '@/lib/utils';

const TimeDisplay = () => {
  const [timeZones, setTimeZones] = useState<TimeZone[]>(getDefaultTimeZones());
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [use24Hour, setUse24Hour] = useState<boolean>(false);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setTimeZones(updateAllTimeZones(timeZones));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeZones]);
  
  return (
    <div className="glass-panel w-full max-w-md mx-auto p-6 space-y-6 animate-fade-in">
      {/* Main UTC clock */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center">
          <Clock className="w-6 h-6 text-primary mr-2" />
          <h2 className="text-xl font-semibold">World Clock</h2>
        </div>
        
        <div className="text-4xl font-bold tracking-tight animate-pulse-subtle">
          {formatTime(currentTime, use24Hour)}
        </div>
        <div className="text-sm text-muted-foreground">
          {formatDate(currentTime)}
        </div>
        
        <button 
          onClick={() => setUse24Hour(!use24Hour)}
          className="text-xs mt-2 text-primary hover:text-primary/80 transition-colors"
        >
          Switch to {use24Hour ? '12-hour' : '24-hour'} format
        </button>
      </div>
      
      {/* Time zone list */}
      <div className="space-y-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <Globe className="w-4 h-4 mr-2" />
          <span>Time Zones</span>
        </div>
        <div className="space-y-3">
          {timeZones.map((tz) => (
            <div 
              key={tz.id}
              className={cn(
                "flex justify-between items-center p-3 rounded-md transition-all", 
                "hover:bg-primary/5 border border-transparent hover:border-primary/10"
              )}
            >
              <div>
                <div className="font-medium">{tz.name}</div>
                <div className="text-xs text-muted-foreground">{tz.abbr} (UTC{tz.offset >= 0 ? '+' : ''}{tz.offset})</div>
              </div>
              <div className="text-right font-mono">
                {formatTime(tz.current, use24Hour)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimeDisplay;
