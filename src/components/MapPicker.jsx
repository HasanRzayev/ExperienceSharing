import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet default marker icon issue - Vite compatible approach
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapPicker = ({ initialPosition = [40.4093, 49.8671], onLocationSelect, locationName }) => {
  const [position, setPosition] = useState(initialPosition);

  useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition);
    }
  }, [initialPosition]);

  function LocationMarker() {
    useMapEvents({
      click(e) {
        const newPos = [e.latlng.lat, e.latlng.lng];
        setPosition(newPos);
        if (onLocationSelect) {
          onLocationSelect(newPos);
        }
      },
    });

    return position ? <Marker position={position}></Marker> : null;
  }

  return (
    <div className="relative">
      {locationName && (
        <div className="mb-2 p-2 bg-purple-50 dark:bg-purple-900 rounded-lg">
          <p className="text-sm text-purple-700 dark:text-purple-300">
            📍 {locationName}
          </p>
        </div>
      )}
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: '400px', width: '100%', borderRadius: '12px' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker />
      </MapContainer>
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        💡 Xəritəyə klikləyərək məkanınızı seçin
      </p>
    </div>
  );
};

export default MapPicker;

