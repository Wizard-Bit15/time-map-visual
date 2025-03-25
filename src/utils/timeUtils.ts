
import { TimeZone } from '../types';

const defaultTimeZones: TimeZone[] = [
  { 
    id: 'UTC', 
    name: 'Coordinated Universal Time', 
    abbr: 'UTC', 
    offset: 0,
    current: new Date()
  },
  { 
    id: 'America/New_York', 
    name: 'New York', 
    abbr: 'EST/EDT', 
    offset: -5,
    current: new Date()
  },
  { 
    id: 'Europe/London', 
    name: 'London', 
    abbr: 'GMT/BST', 
    offset: 0,
    current: new Date()
  },
  { 
    id: 'Asia/Tokyo', 
    name: 'Tokyo', 
    abbr: 'JST', 
    offset: 9,
    current: new Date()
  },
];

export const getTimeInTimeZone = (timeZoneId: string): Date => {
  try {
    const now = new Date();
    
    // This is a simplified approach; in a production app, we would use a proper
    // timezone library like date-fns-tz for accurate timezone conversions
    return new Date(now.toLocaleString('en-US', { timeZone: timeZoneId }));
  } catch (error) {
    console.error(`Error getting time for timezone ${timeZoneId}:`, error);
    return new Date();
  }
};

export const updateAllTimeZones = (timeZones: TimeZone[]): TimeZone[] => {
  return timeZones.map(tz => ({
    ...tz,
    current: getTimeInTimeZone(tz.id)
  }));
};

export const getDefaultTimeZones = (): TimeZone[] => {
  return updateAllTimeZones(defaultTimeZones);
};

export const formatTime = (date: Date, use24Hour: boolean = false): string => {
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: !use24Hour
  };
  
  return date.toLocaleTimeString('en-US', options);
};

export const formatDate = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  return date.toLocaleDateString('en-US', options);
};

export const calculateSunPosition = (date: Date = new Date()): { lat: number; lng: number } => {
  // This is a simplified calculation for demo purposes
  // A real implementation would use solar position algorithms
  
  const now = date;
  const hours = now.getUTCHours();
  const minutes = now.getUTCMinutes();
  
  // Convert time to longitude (24 hours = 360 degrees)
  const lng = ((hours + minutes / 60) / 24) * 360 - 180;
  
  // Calculate approximate latitude based on date
  // This is a very simple approximation of the sun's declination
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getUTCFullYear(), 0, 0).getTime()) / 86400000);
  const lat = 23.45 * Math.sin((dayOfYear - 81) * (2 * Math.PI / 365));
  
  return { lat, lng };
};

export const isDayAtCoordinates = (coords: { lat: number; lng: number }): boolean => {
  const sunPosition = calculateSunPosition();
  
  // Simple day/night calculation based on longitude
  // This is a very basic approximation for demonstration
  const hourDiff = Math.abs(coords.lng - sunPosition.lng);
  return hourDiff < 90 || hourDiff > 270;
};

export const calculateDayNightTerminator = (): { lat: number; lng: number }[] => {
  // In a real implementation, this would calculate the actual day/night terminator
  // For this demo, we'll provide a simplified approximation
  
  const sunPosition = calculateSunPosition();
  const points: { lat: number; lng: number }[] = [];
  
  // Generate points along the terminator (simplified)
  for (let lat = -90; lat <= 90; lat += 5) {
    // Calculate longitude of terminator at this latitude
    // This is a very simplified calculation
    let lng = sunPosition.lng + 90;
    if (lng > 180) lng -= 360;
    
    points.push({ lat, lng });
  }
  
  // Generate the other side of the terminator
  for (let lat = 90; lat >= -90; lat -= 5) {
    let lng = sunPosition.lng - 90;
    if (lng < -180) lng += 360;
    
    points.push({ lat, lng });
  }
  
  return points;
};
