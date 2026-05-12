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
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper
} from '@mui/material';
import { Search, GpsFixed, Close } from '@mui/icons-material';
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

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

function LocationMarker({ position, setPosition }: { position: [number, number], setPosition: (p: [number, number]) => void }) {
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

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

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Search failed', err);
    }
    setSearching(false);
  };

  const selectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setPosition([lat, lng]);
    setSearchResults([]);
    setSearchQuery(result.display_name);
  };

  const handleSelect = () => {
    onSelect(position[0], position[1]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="font-bold flex justify-between items-center">
        Select Office Location
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ height: '600px', p: 0, position: 'relative' }}>
        {/* Search Overlay */}
        <Box sx={{ position: 'absolute', top: 16, left: 16, right: 16, zIndex: 1000, maxWidth: '400px' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search city, area or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            sx={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search className="text-primary" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {searching ? (
                    <CircularProgress size={20} />
                  ) : (
                    <Button onClick={handleSearch} size="small" variant="text" sx={{ minWidth: 0 }}>GO</Button>
                  )}
                </InputAdornment>
              )
            }}
          />
          {searchResults.length > 0 && (
            <Paper sx={{ mt: 1, maxHeight: '300px', overflowY: 'auto' }}>
              <List>
                {searchResults.map((res, i) => (
                  <ListItem button key={i} onClick={() => selectSearchResult(res)}>
                    <ListItemText 
                      primary={res.display_name.split(',')[0]} 
                      secondary={res.display_name} 
                      primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 'bold' }}
                      secondaryTypographyProps={{ fontSize: '0.75rem', noWrap: true }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Box>

        {loading ? (
          <Box className="h-full flex items-center justify-center bg-gray-50">
            <CircularProgress />
          </Box>
        ) : (
          <MapContainer 
            center={position} 
            zoom={15} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater center={position} />
            <LocationMarker position={position} setPosition={setPosition} />
          </MapContainer>
        )}
      </DialogContent>
      <DialogActions className="p-4 bg-gray-50 flex justify-between">
        <Button 
          startIcon={<GpsFixed />} 
          onClick={() => {
            navigator.geolocation.getCurrentPosition((pos) => setPosition([pos.coords.latitude, pos.coords.longitude]));
          }}
        >
          My Location
        </Button>
        <Box>
          <Button onClick={onClose} sx={{ mr: 1 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSelect}>Set Office Location</Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
