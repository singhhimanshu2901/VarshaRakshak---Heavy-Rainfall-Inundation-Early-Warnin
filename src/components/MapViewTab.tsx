import React from 'react';
import { CityDefinition, WardInundationRisk } from '../utils/riskEngine';
import { RiskMap } from './RiskMap';
import { MapPin, Info, Layers, Eye, ShieldAlert, Droplets } from 'lucide-react';

interface MapViewTabProps {
  city: CityDefinition;
  wardRisks: WardInundationRisk[];
  selectedWardId: string | null;
  onSelectWard: (wardId: string) => void;
  isDark: boolean;
  language: 'en' | 'hi';
}

export const MapViewTab: React.FC<MapViewTabProps> = ({
  city,
  wardRisks,
  selectedWardId,
  onSelectWard,
  isDark,
  language,
}) => {
  const selectedWard = wardRisks.find((w) => w.wardId === selectedWardId) || null;

  return (
    <div className="space-y-5">
      {/* Map Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {language === 'hi' ? `${city.name} स्थानिक जलभराव मानचित्र` : `${city.name} Spatial Inundation Hazard Map`}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Interactive Leaflet GIS with OpenStreetMap tiles, micro-basin susceptibility polygons, and critical infrastructure.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
          <span>{wardRisks.length} Wards Tracked</span>
        </div>
      </div>

      {/* Main Interactive Map */}
      <RiskMap
        city={city}
        wardRisks={wardRisks}
        selectedWardId={selectedWardId}
        onSelectWard={onSelectWard}
        isDark={isDark}
      />

      {/* Ward Info Grid & Action Directives */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {wardRisks.map((w) => {
          const isSelected = selectedWardId === w.wardId;
          return (
            <div
              key={w.wardId}
              onClick={() => onSelectWard(w.wardId)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-blue-600 ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {w.wardName}
                </span>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-black text-white"
                  style={{ backgroundColor: w.colorHex }}
                >
                  {w.riskCategory}
                </span>
              </div>

              <div className="text-xs text-slate-500 space-y-1">
                <div>
                  <strong>Susceptibility Score:</strong> {w.riskScore}/100
                </div>
                <div>
                  <strong>Est. Waterlogging:</strong> {w.expectedWaterDepthCm} cm
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 italic pt-1 border-t border-slate-100 dark:border-slate-800 line-clamp-2">
                  "{w.recommendedAction}"
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
