import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Coordinates, MapStyle, MapViewport } from '../types';
import { defaultMapViewport } from '../utils/mapUtils';
import { calculateSunPosition, calculateDayNightTerminator } from '../utils/timeUtils';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { CustomPin } from './CustomPins';

interface WorldMapProps {
  mapboxToken: string | null;
  mapStyle: MapStyle;
  showDayNight?: boolean;
  showSun?: boolean;
  enabledLayers?: string[];
  customPins?: CustomPin[];
}

const WorldMap: React.FC<WorldMapProps> = ({
  mapboxToken,
  mapStyle,
  showDayNight = true,
  showSun = true,
  enabledLayers = [],
  customPins = []
}) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewport, setViewport] = useState<MapViewport>(defaultMapViewport);
  
  const dayNightSourceId = 'day-night-layer';
  const sunSourceId = 'sun-position';
  const customPinsSourceId = 'custom-pins';
  const flightsSourceId = 'air-traffic';
  const shipsSourceId = 'maritime-routes';
  
  useEffect(() => {
    if (!mapboxToken) {
      setError('Mapbox token is required');
      setLoading(false);
      return;
    }
    
    if (!mapContainer.current) return;
    
    try {
      mapboxgl.accessToken = mapboxToken;
      
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle.url,
        center: [viewport.center.lng, viewport.center.lat],
        zoom: viewport.zoom,
        pitch: viewport.pitch,
        bearing: viewport.bearing,
        attributionControl: false,
        projection: 'globe',
      });
      
      newMap.on('load', () => {
        setLoading(false);
        
        newMap.setFog({
          color: 'rgb(186, 210, 235)',
          'high-color': 'rgb(36, 92, 223)',
          'horizon-blend': 0.02,
          'space-color': 'rgb(11, 11, 25)',
          'star-intensity': 0.6
        });
        
        if (showDayNight) {
          addDayNightLayer(newMap);
        }
        
        if (showSun) {
          addSunPosition(newMap);
        }
        
        newMap.addSource(customPinsSourceId, {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          }
        });
        
        newMap.addLayer({
          id: 'custom-pins-layer',
          type: 'circle',
          source: customPinsSourceId,
          paint: {
            'circle-radius': 6,
            'circle-color': ['get', 'color'],
            'circle-opacity': 0.8,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
            'circle-stroke-opacity': 0.8
          }
        });
        
        newMap.addLayer({
          id: 'custom-pins-labels',
          type: 'symbol',
          source: customPinsSourceId,
          layout: {
            'text-field': ['get', 'label'],
            'text-size': 12,
            'text-font': ['Open Sans Bold'],
            'text-offset': [0, 1.5],
            'text-anchor': 'top'
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': '#000000',
            'text-halo-width': 1
          }
        });
        
        if (enabledLayers.includes('air-traffic')) {
          addAirTrafficLayer(newMap);
        }
        
        if (enabledLayers.includes('maritime-routes')) {
          addMaritimeRoutesLayer(newMap);
        }
        
        updateCustomPins(newMap, customPins);
      });
      
      newMap.on('error', (e) => {
        console.error('Mapbox error:', e);
        setError('Error loading map');
        setLoading(false);
      });
      
      newMap.addControl(new mapboxgl.NavigationControl({
        showCompass: false
      }), 'top-right');
      
      newMap.dragRotate.disable();
      newMap.touchZoomRotate.disableRotation();
      
      let spinEnabled = true;
      let userInteracting = false;
      let spinTimeout: number;
      const secondsPerRevolution = 120;
      
      const spinGlobe = () => {
        if (!spinEnabled || userInteracting || !newMap) return;
        
        const longitude = newMap.getCenter().lng - 0.1;
        newMap.easeTo({ center: [longitude, viewport.center.lat], duration: 100, easing: (n) => n });
        spinTimeout = window.setTimeout(spinGlobe, 100);
      };
      
      newMap.on('mousedown', () => {
        userInteracting = true;
        window.clearTimeout(spinTimeout);
      });
      
      newMap.on('mouseup', () => {
        userInteracting = false;
        spinGlobe();
      });
      
      newMap.on('dragend', () => {
        userInteracting = false;
        spinGlobe();
      });
      
      newMap.on('touchend', () => {
        userInteracting = false;
        spinGlobe();
      });
      
      window.setTimeout(spinGlobe, 2000);
      
      map.current = newMap;
      
      return () => {
        window.clearTimeout(spinTimeout);
        newMap.remove();
      };
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Error initializing map');
      setLoading(false);
    }
  }, [mapboxToken]);
  
  useEffect(() => {
    if (map.current) {
      map.current.setStyle(mapStyle.url);
    }
  }, [mapStyle]);
  
  useEffect(() => {
    if (map.current && map.current.loaded() && customPins) {
      updateCustomPins(map.current, customPins);
    }
  }, [customPins]);
  
  useEffect(() => {
    if (!map.current || !map.current.loaded()) return;
    
    if (enabledLayers.includes('air-traffic')) {
      if (!map.current.getSource(flightsSourceId)) {
        addAirTrafficLayer(map.current);
      }
      setLayerVisibility(map.current, 'air-traffic-layer', true);
    } else {
      setLayerVisibility(map.current, 'air-traffic-layer', false);
    }
    
    if (enabledLayers.includes('maritime-routes')) {
      if (!map.current.getSource(shipsSourceId)) {
        addMaritimeRoutesLayer(map.current);
      }
      setLayerVisibility(map.current, 'maritime-routes-layer', true);
    } else {
      setLayerVisibility(map.current, 'maritime-routes-layer', false);
    }
    
    if (enabledLayers.includes('day-night')) {
      if (!map.current.getSource(dayNightSourceId)) {
        addDayNightLayer(map.current);
      }
      setLayerVisibility(map.current, 'day-night-layer', true);
    } else {
      setLayerVisibility(map.current, 'day-night-layer', false);
    }
    
    if (enabledLayers.includes('sun-position')) {
      if (!map.current.getSource(sunSourceId)) {
        addSunPosition(map.current);
      }
      setLayerVisibility(map.current, 'sun-position', true);
      setLayerVisibility(map.current, 'sun-glow', true);
    } else {
      setLayerVisibility(map.current, 'sun-position', false);
      setLayerVisibility(map.current, 'sun-glow', false);
    }
  }, [enabledLayers]);
  
  const setLayerVisibility = (mapInstance: mapboxgl.Map, layerId: string, visible: boolean) => {
    if (mapInstance.getLayer(layerId)) {
      mapInstance.setLayoutProperty(
        layerId,
        'visibility',
        visible ? 'visible' : 'none'
      );
    }
  };
  
  const updateCustomPins = (mapInstance: mapboxgl.Map, pins: CustomPin[]) => {
    if (!mapInstance.getSource(customPinsSourceId)) return;
    
    const source = mapInstance.getSource(customPinsSourceId) as mapboxgl.GeoJSONSource;
    source.setData({
      type: 'FeatureCollection',
      features: pins.map(pin => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [pin.coordinates.lng, pin.coordinates.lat]
        },
        properties: {
          id: pin.id,
          label: pin.label,
          color: pin.color || '#4299e1'
        }
      }))
    });
  };
  
  const addAirTrafficLayer = (mapInstance: mapboxgl.Map) => {
    const dummyFlights = [
      { from: [-122.4194, 37.7749], to: [-74.0060, 40.7128], progress: 0.7 },
      { from: [2.3522, 48.8566], to: [139.6917, 35.6895], progress: 0.3 },
      { from: [-0.1278, 51.5074], to: [121.4737, 31.2304], progress: 0.5 },
      { from: [151.2093, -33.8688], to: [37.6173, 55.7558], progress: 0.8 }
    ];
    
    const features = dummyFlights.map(flight => {
      const [fromLng, fromLat] = flight.from;
      const [toLng, toLat] = flight.to;
      
      const currentLng = fromLng + (toLng - fromLng) * flight.progress;
      const currentLat = fromLat + (toLat - fromLat) * flight.progress;
      
      return {
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [currentLng, currentLat]
        },
        properties: {
          fromLng,
          fromLat,
          toLng,
          toLat
        }
      };
    });
    
    mapInstance.addSource(flightsSourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features
      }
    });
    
    mapInstance.addLayer({
      id: 'air-traffic-paths',
      type: 'line',
      source: flightsSourceId,
      layout: {
        visibility: 'visible',
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#88CCEE',
        'line-width': 1,
        'line-opacity': 0.6,
        'line-dasharray': [2, 2]
      }
    });
    
    mapInstance.addLayer({
      id: 'air-traffic-layer',
      type: 'symbol',
      source: flightsSourceId,
      layout: {
        visibility: 'visible',
        'icon-image': 'airport',
        'icon-size': 0.7,
        'icon-allow-overlap': true,
        'icon-rotate': 45
      }
    });
  };
  
  const addMaritimeRoutesLayer = (mapInstance: mapboxgl.Map) => {
    const dummyShipRoutes = [
      { route: [
        [-122.4194, 37.7749],
        [-117.1611, 32.7157],
        [-109.4265, 23.0953],
        [-99.1332, 19.4326]
      ]},
      { route: [
        [114.1095, 22.3964],
        [127.6791, 26.2124],
        [139.6917, 35.6895]
      ]}
    ];
    
    const features = dummyShipRoutes.map(ship => ({
      type: "Feature" as const,
      geometry: {
        type: "LineString" as const,
        coordinates: ship.route
      },
      properties: {}
    }));
    
    mapInstance.addSource(shipsSourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features
      }
    });
    
    mapInstance.addLayer({
      id: 'maritime-routes-layer',
      type: 'line',
      source: shipsSourceId,
      layout: {
        visibility: 'visible',
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#44AABB',
        'line-width': 2,
        'line-opacity': 0.7
      }
    });
  };
  
  const addDayNightLayer = (mapInstance: mapboxgl.Map) => {
    const terminatorCoordinates = calculateDayNightTerminator();
    
    if (!mapInstance.getSource(dayNightSourceId)) {
      mapInstance.addSource(dayNightSourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [terminatorCoordinates.map(coord => [coord.lng, coord.lat])]
          },
          properties: {}
        }
      });
      
      mapInstance.addLayer({
        id: 'day-night-layer',
        type: 'fill',
        source: dayNightSourceId,
        layout: {},
        paint: {
          'fill-color': '#1a202c',
          'fill-opacity': 0.3
        }
      });
      
      const updateDayNight = () => {
        if (!mapInstance.getSource(dayNightSourceId)) return;
        
        const newTerminatorCoordinates = calculateDayNightTerminator();
        
        const source = mapInstance.getSource(dayNightSourceId) as mapboxgl.GeoJSONSource;
        source.setData({
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [newTerminatorCoordinates.map(coord => [coord.lng, coord.lat])]
          },
          properties: {}
        });
        
        if (showSun && mapInstance.getSource(sunSourceId)) {
          updateSunPosition(mapInstance);
        }
      };
      
      const dayNightInterval = setInterval(updateDayNight, 60000);
      
      window.addEventListener('beforeunload', () => {
        clearInterval(dayNightInterval);
      });
    }
  };
  
  const addSunPosition = (mapInstance: mapboxgl.Map) => {
    const sunPosition = calculateSunPosition();
    
    if (!mapInstance.getSource(sunSourceId)) {
      mapInstance.addSource(sunSourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [sunPosition.lng, sunPosition.lat]
          },
          properties: {}
        }
      });
      
      mapInstance.addLayer({
        id: 'sun-position',
        type: 'circle',
        source: sunSourceId,
        paint: {
          'circle-radius': 8,
          'circle-color': '#FDB813',
          'circle-opacity': 0.9,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FEF9E7',
          'circle-stroke-opacity': 0.8
        }
      });
      
      mapInstance.addLayer({
        id: 'sun-glow',
        type: 'circle',
        source: sunSourceId,
        paint: {
          'circle-radius': 20,
          'circle-color': '#FDB813',
          'circle-opacity': 0.15,
          'circle-blur': 1
        }
      });
    }
  };
  
  const updateSunPosition = (mapInstance: mapboxgl.Map) => {
    const sunPosition = calculateSunPosition();
    
    const source = mapInstance.getSource(sunSourceId) as mapboxgl.GeoJSONSource;
    source.setData({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [sunPosition.lng, sunPosition.lat]
      },
      properties: {}
    });
  };
  
  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg">
      <div 
        ref={mapContainer} 
        className={cn(
          "w-full h-full transition-opacity duration-500",
          loading ? "opacity-0" : "opacity-100"
        )}
      />
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
            <span className="text-sm">Loading map...</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-destructive/10 backdrop-blur-sm">
          <div className="glass-panel p-6 max-w-xs mx-auto text-center">
            <h3 className="text-lg font-semibold mb-2">Error</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <button 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorldMap;

