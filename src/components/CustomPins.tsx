
import React, { useState } from 'react';
import { MapPin, Plus, X, Check, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CustomPin {
  id: string;
  label: string;
  coordinates: { lat: number; lng: number };
  color?: string;
}

interface CustomPinsProps {
  pins: CustomPin[];
  onPinsChange: (pins: CustomPin[]) => void;
}

const CustomPins: React.FC<CustomPinsProps> = ({ pins, onPinsChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingPin, setEditingPin] = useState<CustomPin | null>(null);
  const [newPinLabel, setNewPinLabel] = useState('');
  const [newPinLat, setNewPinLat] = useState('');
  const [newPinLng, setNewPinLng] = useState('');
  
  const addPin = () => {
    if (!newPinLabel || !newPinLat || !newPinLng) return;
    
    try {
      const lat = parseFloat(newPinLat);
      const lng = parseFloat(newPinLng);
      
      if (isNaN(lat) || isNaN(lng)) {
        throw new Error('Invalid coordinates');
      }
      
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new Error('Coordinates out of range');
      }
      
      const newPin: CustomPin = {
        id: Date.now().toString(),
        label: newPinLabel,
        coordinates: { lat, lng },
        color: getRandomColor(),
      };
      
      onPinsChange([...pins, newPin]);
      resetForm();
    } catch (error) {
      console.error('Error adding pin:', error);
      // In a real app, you would show a toast message here
    }
  };
  
  const updatePin = () => {
    if (!editingPin || !newPinLabel || !newPinLat || !newPinLng) return;
    
    try {
      const lat = parseFloat(newPinLat);
      const lng = parseFloat(newPinLng);
      
      if (isNaN(lat) || isNaN(lng)) {
        throw new Error('Invalid coordinates');
      }
      
      const updatedPins = pins.map(pin => 
        pin.id === editingPin.id 
          ? { ...pin, label: newPinLabel, coordinates: { lat, lng } }
          : pin
      );
      
      onPinsChange(updatedPins);
      resetForm();
    } catch (error) {
      console.error('Error updating pin:', error);
    }
  };
  
  const removePin = (id: string) => {
    onPinsChange(pins.filter(pin => pin.id !== id));
  };
  
  const startEditing = (pin: CustomPin) => {
    setEditingPin(pin);
    setNewPinLabel(pin.label);
    setNewPinLat(pin.coordinates.lat.toString());
    setNewPinLng(pin.coordinates.lng.toString());
  };
  
  const resetForm = () => {
    setEditingPin(null);
    setNewPinLabel('');
    setNewPinLat('');
    setNewPinLng('');
  };
  
  const getRandomColor = () => {
    const colors = ['#4299e1', '#48bb78', '#ed8936', '#9f7aea', '#f56565', '#38b2ac'];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  return (
    <div className="glass-panel p-4 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">Custom Locations</h3>
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
        </div>
      </div>
      
      {/* Pin Form */}
      <div className={cn("space-y-2", editingPin ? "block" : "hidden")}>
        <h4 className="text-xs font-medium">{editingPin ? "Edit Location" : "Add New Location"}</h4>
        <input
          type="text"
          placeholder="Label"
          className="w-full p-1 text-xs rounded border border-input"
          value={newPinLabel}
          onChange={(e) => setNewPinLabel(e.target.value)}
        />
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Latitude"
            className="w-full p-1 text-xs rounded border border-input"
            value={newPinLat}
            onChange={(e) => setNewPinLat(e.target.value)}
          />
          <input
            type="text"
            placeholder="Longitude"
            className="w-full p-1 text-xs rounded border border-input"
            value={newPinLng}
            onChange={(e) => setNewPinLng(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={editingPin ? updatePin : addPin}
            className="text-xs px-2 py-1 bg-primary/20 rounded hover:bg-primary/30 transition-colors"
          >
            {editingPin ? "Update" : "Add"}
          </button>
          <button
            onClick={resetForm}
            className="text-xs px-2 py-1 bg-muted/20 rounded hover:bg-muted/30 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
      
      {/* New Location Button */}
      <button
        onClick={() => {
          setEditingPin(null);
          setNewPinLabel('');
          setNewPinLat('');
          setNewPinLng('');
        }}
        className={cn(
          "flex items-center text-xs p-2 w-full rounded-md",
          "hover:bg-primary/10 border border-dashed border-muted-foreground/30",
          "justify-center transition-colors",
          editingPin ? "hidden" : "block"
        )}
      >
        <Plus className="w-3 h-3 mr-1" /> Add New Location
      </button>
      
      {/* Pins List */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {pins.map((pin) => (
          <div 
            key={pin.id}
            className={cn(
              "flex justify-between items-center p-2 rounded-md",
              "hover:bg-primary/5 transition-colors border border-transparent hover:border-primary/10",
              "text-xs"
            )}
          >
            <div className="flex items-center flex-1">
              <MapPin 
                className="w-4 h-4 mr-2 flex-shrink-0" 
                style={{ color: pin.color }} 
              />
              <div>
                <div className="font-medium">{pin.label}</div>
                <div className="text-xs text-muted-foreground">
                  {pin.coordinates.lat.toFixed(4)}, {pin.coordinates.lng.toFixed(4)}
                </div>
              </div>
            </div>
            
            {isEditing && (
              <div className="flex space-x-1">
                <button 
                  onClick={() => startEditing(pin)}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => removePin(pin.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomPins;
