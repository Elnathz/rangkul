"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";
import L from "leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";

// Fix for default marker icons in Leaflet with webpack/nextjs
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapProps {
  position: { lat: number; lng: number } | null;
  onPositionChange: (pos: { lat: number; lng: number }, address?: string) => void;
  defaultCenter?: { lat: number; lng: number };
}

function SearchField({ onPositionChange }: { onPositionChange: (pos: { lat: number; lng: number }, address?: string) => void }) {
  const map = useMap();
  
  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const searchControl = new (GeoSearchControl as any)({
      provider: provider,
      style: "bar",
      showMarker: false,
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true,
      searchLabel: "Cari alamat jalan, kota, atau kecamatan...",
    });

    map.addControl(searchControl);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleShowLocation = (e: any) => {
       const latlng = { lat: e.location.y, lng: e.location.x };
       onPositionChange(latlng, e.location.label);
    };
    
    map.on("geosearch/showlocation", handleShowLocation);
    
    return () => {
       map.removeControl(searchControl);
       map.off("geosearch/showlocation", handleShowLocation);
    };
  }, [map, onPositionChange]);

  return null;
}

function LocationMarker({ position, onPositionChange, defaultCenter }: MapProps) {
  const [currentPos, setCurrentPos] = useState<L.LatLng | null>(
    position ? new L.LatLng(position.lat, position.lng) : null
  );

  const map = useMapEvents({
    async click(e) {
      setCurrentPos(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
      
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`);
        const data = await res.json();
        const address = data.display_name || "";
        onPositionChange({ lat: e.latlng.lat, lng: e.latlng.lng }, address);
      } catch (err) {
        onPositionChange({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });

  useEffect(() => {
    if (position) {
      const newPos = new L.LatLng(position.lat, position.lng);
      // Only flyTo if the change comes from outside (or search), not identical to current
      if (!currentPos || newPos.lat !== currentPos.lat || newPos.lng !== currentPos.lng) {
        setCurrentPos(newPos);
        map.flyTo(newPos, 15);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, map]);

  return currentPos ? <Marker position={currentPos} icon={icon} /> : null;
}

export default function Map({ position, onPositionChange, defaultCenter = { lat: -6.9175, lng: 107.6191 } }: MapProps) {
  return (
    <div className="h-[350px] w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
      <MapContainer 
        center={position ? [position.lat, position.lng] : [defaultCenter.lat, defaultCenter.lng]} 
        zoom={position ? 15 : 12} 
        scrollWheelZoom={false} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <SearchField onPositionChange={onPositionChange} />
        <LocationMarker position={position} onPositionChange={onPositionChange} defaultCenter={defaultCenter} />
      </MapContainer>
    </div>
  );
}
