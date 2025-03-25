
import { MapStyle, MapViewport } from '../types';
import { Globe, Map, Layers } from 'lucide-react';

export const defaultMapViewport: MapViewport = {
  center: { lat: 20, lng: 0 },
  zoom: 2,
  pitch: 0,
  bearing: 0
};

export const mapStyles: MapStyle[] = [
  {
    id: 'streets',
    name: 'Streets',
    url: 'mapbox://styles/mapbox/streets-v12',
    icon: 'map'
  },
  {
    id: 'satellite',
    name: 'Satellite',
    url: 'mapbox://styles/mapbox/satellite-v9',
    icon: 'layers'
  },
  {
    id: 'light',
    name: 'Light',
    url: 'mapbox://styles/mapbox/light-v11',
    icon: 'sun'
  },
  {
    id: 'dark',
    name: 'Dark',
    url: 'mapbox://styles/mapbox/dark-v11',
    icon: 'moon'
  }
];

export const getMapStyleById = (id: string): MapStyle => {
  return mapStyles.find(style => style.id === id) || mapStyles[0];
};

export const getMapStyleIcon = (styleId: string) => {
  switch (styleId) {
    case 'streets':
      return Map;
    case 'satellite':
      return Layers;
    case 'light':
      return Globe;
    case 'dark':
      return Globe;
    default:
      return Map;
  }
};

export const getMapboxToken = (): string | null => {
  // In a real application, this would be environment variable or secured
  return localStorage.getItem('mapbox_token');
};

export const setMapboxToken = (token: string): void => {
  localStorage.setItem('mapbox_token', token);
};
