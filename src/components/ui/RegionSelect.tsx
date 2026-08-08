"use client";

import { useState, useEffect } from "react";
import { Label } from "./label";

interface Region {
  id: string;
  name: string;
}

interface RegionSelectProps {
  onRegionChange: (
    region: { provinsi: string; kota: string; kecamatan: string; kelurahan: string },
    autoCoords?: { lat: number; lng: number; address?: string }
  ) => void;
  required?: boolean;
}

const API_BASE = "https://www.emsifa.com/api-wilayah-indonesia/api";

export default function RegionSelect({ onRegionChange, required = true }: RegionSelectProps) {
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [cities, setCities] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<Region[]>([]);
  const [villages, setVillages] = useState<Region[]>([]);

  const [selectedProv, setSelectedProv] = useState<Region | null>(null);
  const [selectedCity, setSelectedCity] = useState<Region | null>(null);
  const [selectedDist, setSelectedDist] = useState<Region | null>(null);
  const [selectedVill, setSelectedVill] = useState<Region | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/provinces.json`)
      .then((res) => res.json())
      .then((data) => setProvinces(data))
      .catch((err) => console.error("Error fetching provinces", err));
  }, []);

  const triggerChange = (prov: Region | null, city: Region | null, dist: Region | null, vill: Region | null, coords?: { lat: number; lng: number; address?: string }) => {
    onRegionChange({
      provinsi: prov?.name || "",
      kota: city?.name || "",
      kecamatan: dist?.name || "",
      kelurahan: vill?.name || "",
    }, coords);
  };

  const handleProvChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const prov = provinces.find((p) => p.id === e.target.value) || null;
    setSelectedProv(prov);
    setSelectedCity(null);
    setSelectedDist(null);
    setSelectedVill(null);
    setCities([]);
    setDistricts([]);
    setVillages([]);
    triggerChange(prov, null, null, null);
    
    if (prov) {
      try {
        const res = await fetch(`${API_BASE}/regencies/${prov.id}.json`);
        const data = await res.json();
        setCities(data);
      } catch (err) {
        console.error("Error fetching cities", err);
      }
    }
  };

  const handleCityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const city = cities.find((c) => c.id === e.target.value) || null;
    setSelectedCity(city);
    setSelectedDist(null);
    setSelectedVill(null);
    setDistricts([]);
    setVillages([]);
    triggerChange(selectedProv, city, null, null);

    if (city) {
      try {
        const res = await fetch(`${API_BASE}/districts/${city.id}.json`);
        const data = await res.json();
        setDistricts(data);
      } catch (err) {
        console.error("Error fetching districts", err);
      }
    }
  };

  const handleDistChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dist = districts.find((d) => d.id === e.target.value) || null;
    setSelectedDist(dist);
    setSelectedVill(null);
    setVillages([]);
    triggerChange(selectedProv, selectedCity, dist, null);

    if (dist) {
      try {
        const res = await fetch(`${API_BASE}/villages/${dist.id}.json`);
        const data = await res.json();
        setVillages(data);
      } catch (err) {
        console.error("Error fetching villages", err);
      }
    }
  };

  const handleVillChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vill = villages.find((v) => v.id === e.target.value) || null;
    setSelectedVill(vill);
    triggerChange(selectedProv, selectedCity, selectedDist, vill);

    if (vill && selectedProv && selectedCity && selectedDist) {
      try {
        const query = `${vill.name}, ${selectedDist.name}, ${selectedCity.name}, ${selectedProv.name}, Indonesia`;
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        const data = await res.json();
        
        if (data && data.length > 0) {
          triggerChange(selectedProv, selectedCity, selectedDist, vill, {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
            address: data[0].display_name
          });
        }
      } catch (err) {
        console.error("Geocoding failed", err);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 border border-slate-200 rounded-xl mb-4">
      <div className="space-y-1.5">
        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Provinsi {required && <span className="text-red-500">*</span>}</Label>
        <select required={required} className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0D47A1]/50 focus-visible:border-[#0D47A1]" value={selectedProv?.id || ""} onChange={handleProvChange}>
          <option value="" disabled>Pilih Provinsi...</option>
          {provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      
      <div className="space-y-1.5">
        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kota/Kabupaten {required && <span className="text-red-500">*</span>}</Label>
        <select required={required} disabled={!selectedProv} className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0D47A1]/50 focus-visible:border-[#0D47A1] disabled:opacity-50 disabled:bg-slate-100" value={selectedCity?.id || ""} onChange={handleCityChange}>
          <option value="" disabled>Pilih Kota/Kabupaten...</option>
          {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      
      <div className="space-y-1.5">
        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kecamatan {required && <span className="text-red-500">*</span>}</Label>
        <select required={required} disabled={!selectedCity} className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0D47A1]/50 focus-visible:border-[#0D47A1] disabled:opacity-50 disabled:bg-slate-100" value={selectedDist?.id || ""} onChange={handleDistChange}>
          <option value="" disabled>Pilih Kecamatan...</option>
          {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>
      
      <div className="space-y-1.5">
        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kelurahan/Desa {required && <span className="text-red-500">*</span>}</Label>
        <select required={required} disabled={!selectedDist} className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0D47A1]/50 focus-visible:border-[#0D47A1] disabled:opacity-50 disabled:bg-slate-100" value={selectedVill?.id || ""} onChange={handleVillChange}>
          <option value="" disabled>Pilih Kelurahan...</option>
          {villages.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
      </div>
    </div>
  );
}
