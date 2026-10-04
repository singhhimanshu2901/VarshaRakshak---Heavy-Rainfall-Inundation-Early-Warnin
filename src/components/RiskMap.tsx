import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap } from 'react-leaflet';
import { CityDefinition, WardInundationRisk } from '../utils/riskEngine';
import { ShieldAlert, Droplets, Waves, Building2, Eye, Layers } from 'lucide-react';

interface RiskMapProps {
  city: CityDefinition;
  wardRisks: WardInundationRisk[];
  selectedWardId: string | null;
  onSelectWard: (wardId: string) => void;
  isDark: boolean;
}

// Controller to smoothly pan and zoom map when city changes
function MapViewController({ lat, lon, zoom }: { lat: number; lon: number; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], zoom, { animate: true });
  }, [lat, lon, zoom, map]);
  return null;
}

export const RiskMap: React.FC<RiskMapProps> = ({
  city,
  wardRisks,
  selectedWardId,
  onSelectWard,
  isDark,
}) => {
  // Layer visibility toggles
  const [showInundation, setShowInundation] = useState(true);
  const [showIsohyets, setShowIsohyets] = useState(true);
  const [showCriticalInfra, setShowCriticalInfra] = useState(true);

  // Basemap URLs
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const attribution = isDark
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <div className="relative w-full h-[540px] rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
      {/* Map Control Overlay */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 text-xs font-medium space-y-2">
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700 pb-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span>GIS Hazard Layers</span>
        </div>
        <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={showInundation}
            onChange={(e) => setShowInundation(e.target.checked)}
            className="rounded text-blue-600 focus:ring-blue-500"
          />
          <span>Ward Inundation Zones</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={showIsohyets}
            onChange={(e) => setShowIsohyets(e.target.checked)}
            className="rounded text-blue-600 focus:ring-blue-500"
          />
          <span>Isohyetal Rain Spread</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={showCriticalInfra}
            onChange={(e) => setShowCriticalInfra(e.target.checked)}
            className="rounded text-blue-600 focus:ring-blue-500"
          />
          <span>Critical Infrastructure</span>
        </label>
      </div>

      {/* Legend Badge */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Inundation Risk Category
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-600 ring-2 ring-red-300"></span>
            <span className="text-slate-700 dark:text-slate-200 font-medium">Critical (80-100)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-500 ring-2 ring-orange-300"></span>
            <span className="text-slate-700 dark:text-slate-200 font-medium">High (60-79)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 ring-2 ring-amber-300"></span>
            <span className="text-slate-700 dark:text-slate-200 font-medium">Moderate (35-59)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600 ring-2 ring-emerald-300"></span>
            <span className="text-slate-700 dark:text-slate-200 font-medium">Low (&lt;35)</span>
          </div>
        </div>
      </div>

      <MapContainer
        center={[city.lat, city.lon]}
        zoom={city.zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <MapViewController lat={city.lat} lon={city.lon} zoom={city.zoom} />
        <TileLayer attribution={attribution} url={tileUrl} />

        {/* Isohyetal / Rainfall simulated plume rings */}
        {showIsohyets && (
          <>
            <CircleMarker
              center={[city.lat + 0.005, city.lon + 0.005]}
              radius={70}
              pathOptions={{
                color: '#3b82f6',
                fillColor: '#60a5fa',
                fillOpacity: 0.12,
                weight: 1,
                dashArray: '4 4',
              }}
            />
            <CircleMarker
              center={[city.lat, city.lon]}
              radius={110}
              pathOptions={{
                color: '#0284c7',
                fillColor: '#38bdf8',
                fillOpacity: 0.08,
                weight: 1,
                dashArray: '6 6',
              }}
            />
          </>
        )}

        {/* Ward Inundation Circles */}
        {showInundation &&
          wardRisks.map((w) => {
            const isSelected = selectedWardId === w.wardId;
            const radius = isSelected ? 26 : Math.max(16, Math.round(w.riskScore / 3.8));

            return (
              <CircleMarker
                key={w.wardId}
                center={[w.lat, w.lon]}
                radius={radius}
                pathOptions={{
                  color: isSelected ? '#1e1b4b' : w.colorHex,
                  fillColor: w.colorHex,
                  fillOpacity: isSelected ? 0.85 : 0.65,
                  weight: isSelected ? 3.5 : 2,
                }}
                eventHandlers={{
                  click: () => onSelectWard(w.wardId),
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                  <div className="font-semibold text-xs text-slate-800">
                    {w.wardName} ({w.riskScore}/100 - {w.riskCategory})
                  </div>
                </Tooltip>

                <Popup className="custom-popup">
                  <div className="p-1 space-y-2 max-w-[260px] text-xs font-sans">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                      <span className="font-bold text-slate-900 text-sm">{w.wardName}</span>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider"
                        style={{ backgroundColor: w.colorHex }}
                      >
                        {w.riskCategory}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2 rounded-lg">
                      <div>
                        <span className="text-slate-500 block">Risk Score</span>
                        <span className="font-bold text-slate-800 text-sm">
                          {w.riskScore}
                          <span className="text-[10px] text-slate-400">/100</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Est. Inundation</span>
                        <span className="font-bold text-blue-700 text-sm">
                          {w.expectedWaterDepthCm} cm
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 font-medium block">Topography / DEM Category:</span>
                      <span className="text-slate-700 font-semibold">{w.elevationCategory}</span>
                    </div>

                    {showCriticalInfra && (
                      <div>
                        <span className="text-slate-500 font-medium block">Critical Assets:</span>
                        <span className="text-slate-700">{w.criticalInfrastructure}</span>
                      </div>
                    )}

                    <div className="border-t border-slate-200 pt-1.5">
                      <span className="text-amber-800 font-bold block mb-0.5 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3 text-amber-600" />
                        Action Protocol:
                      </span>
                      <p className="text-[11px] leading-relaxed text-slate-600 italic">
                        "{w.recommendedAction}"
                      </p>
                    </div>

                    <button
                      onClick={() => onSelectWard(w.wardId)}
                      className="w-full mt-1 py-1 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-center font-medium flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3 h-3" /> Focus on Ward Detail
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
      </MapContainer>
    </div>
  );
};
