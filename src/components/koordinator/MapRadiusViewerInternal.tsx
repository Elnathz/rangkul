"use client";

import { MapContainer, TileLayer, Marker, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in Leaflet with webpack/nextjs
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapRadiusViewerInternalProps {
  lat: number;
  lng: number;
  radiusKm: number;
}

export default function MapRadiusViewerInternal({ lat, lng, radiusKm }: MapRadiusViewerInternalProps) {
  return (
    <div className="h-[250px] w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm relative z-0 mt-4">
      <MapContainer 
        center={[lat, lng]} 
        zoom={13} 
        scrollWheelZoom={false} 
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
        dragging={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={icon} />
        <Circle 
          center={[lat, lng]} 
          radius={radiusKm * 1000} 
          pathOptions={{ 
            color: '#0D47A1', 
            fillColor: '#0D47A1', 
            fillOpacity: 0.15,
            weight: 2
          }} 
        />
      </MapContainer>
    </div>
  );
}
