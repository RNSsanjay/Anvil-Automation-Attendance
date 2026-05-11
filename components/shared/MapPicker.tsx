'use client';

import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

interface MapPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (lat: number, lng: number) => void;
  initialLocation?: { lat: number, lng: number } | null;
}

function LocationMarker({ position, setPosition }: { position: [number, number], setPosition: (p: [number, number]) => void }) {
  const map = useMap();
  
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={icon}></Marker>
  );
}

export default function MapPicker({ open, onClose, onSelect, initialLocation }: MapPickerProps) {
  const [position, setPosition] = useState<[number, number]>(
    initialLocation ? [initialLocation.lat, initialLocation.lng] : [28.6139, 77.2090] // Default to Delhi
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && !initialLocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
          setLoading(false);
        },
        () => setLoading(false),
        { enableHighAccuracy: true }
      );
    }
  }, [open, initialLocation]);

  const handleSelect = () => {
    onSelect(position[0], position[1]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="font-bold">Select Location on Map</DialogTitle>
      <DialogContent sx={{ height: '500px', p: 0 }}>
        {loading ? (
          <Box className="h-full flex items-center justify-center">
            <CircularProgress />
          </Box>
        ) : (
          <MapContainer 
            center={position} 
            zoom={15} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={position} setPosition={setPosition} />
          </MapContainer>
        )}
      </DialogContent>
      <DialogActions className="p-4 bg-gray-50">
        <Typography variant="caption" className="flex-grow ml-4 text-text-secondary">
          Click on the map to mark your office location
        </Typography>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSelect}>Select Location</Button>
      </DialogActions>
    </Dialog>
  );
}
