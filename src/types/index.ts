
export type TimeZone = {
  id: string;
  name: string;
  abbr: string;
  offset: number;
  current: Date;
};

export type Coordinates = {
  lat: number;
  lng: number;
};

export type MapStyle = {
  id: string;
  name: string;
  url: string;
  icon: string;
};

export type MapViewport = {
  center: Coordinates;
  zoom: number;
  pitch: number;
  bearing: number;
};

export type DayNightInfo = {
  sunriseTime: Date;
  sunsetTime: Date;
  isDaytime: boolean;
  sunPosition: Coordinates;
};

export type MapboxToken = string | null;

export type CustomPin = {
  id: string;
  label: string;
  coordinates: Coordinates;
  color?: string;
};

export type DataLayer = {
  id: string;
  name: string;
  enabled: boolean;
  icon?: React.ReactNode;
  premium?: boolean;
};
