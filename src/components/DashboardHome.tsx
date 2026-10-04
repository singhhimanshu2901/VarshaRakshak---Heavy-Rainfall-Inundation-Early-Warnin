import React, { useState } from 'react';
import {
  CityDefinition,
  RainfallRiskSummary,
  WardInundationRisk,
  IMDAlertLevel,
} from '../utils/riskEngine';
import { RainfallChart } from './RainfallChart';
import {
  AlertTriangle,
  CloudRain,
  Droplets,
  Layers,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  Info,
  Building,
  HelpCircle,
  Clock,
  Sparkles,
  Search,
  CheckCircle2,
} from 'lucide-react';

interface DashboardHomeProps {
  city: CityDefinition;
  rainfallSummary: RainfallRiskSummary;
  wardRisks: WardInundationRisk[];
  selectedWardId: string | null;
  onSelectWard: (wardId: string) => void;
  isDark: boolean;
  language: 'en' | 'hi';
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  city,
  rainfallSummary,
  wardRisks,
  selectedWardId,
  onSelectWard,
  isDark,
  language,
}) => {
  const [wardFilter, setWardFilter] = useState<'all' | 'critical' | 'moderate'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const selectedWard = wardRisks.find((w) => w.wardId === selectedWardId) || null;

  // Filtered wards
  const filteredWards = wardRisks.filter((w) => {
    const matchesSearch =
      w.wardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.elevationCategory.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (wardFilter === 'critical') return w.riskScore >= 60;
    if (wardFilter === 'moderate') return w.riskScore >= 35 && w.riskScore < 60;
    return true;
  });

  // Color styles based on IMD Alert Level
  const getAlertBadgeStyle = (level: IMDAlertLevel) => {
    switch (level) {
      case 'Red':
        return {
          bg: 'bg-red-600',
          border: 'border-red-500',
          shadow: 'shadow-red-500/20',
          textColor: 'text-red-600',
          lightBg: 'bg-red-50 dark:bg-red-950/40',
          ring: 'ring-red-400',
        };
      case 'Orange':
        return {
          bg: 'bg-orange-500',
          border: 'border-orange-500',
          shadow: 'shadow-orange-500/20',
          textColor: 'text-orange-600',
          lightBg: 'bg-orange-50 dark:bg-orange-950/40',
          ring: 'ring-orange-400',
        };
      case 'Yellow':
        return {
          bg: 'bg-amber-500',
          border: 'border-amber-500',
          shadow: 'shadow-amber-500/20',
          textColor: 'text-amber-600',
          lightBg: 'bg-amber-50 dark:bg-amber-950/40',
          ring: 'ring-amber-400',
        };
      case 'Green':
      default:
        return {
          bg: 'bg-emerald-600',
          border: 'border-emerald-500',
          shadow: 'shadow-emerald-500/20',
          textColor: 'text-emerald-600',
          lightBg: 'bg-emerald-50 dark:bg-emerald-950/40',
          ring: 'ring-emerald-400',
        };
    }
  };

  const badgeStyle = getAlertBadgeStyle(rainfallSummary.alertLevel);

  return (
    <div className="space-y-6">
      {/* Primary Alert Banner & City Summary Card */}
      <div
        className={`rounded-2xl p-6 border-2 transition-all shadow-xl ${badgeStyle.border} ${badgeStyle.lightBg} relative overflow-hidden`}
      >
        {/* Decorative corner glow */}
        <div
          className={`absolute -top-16 -right-16 w-48 h-48 rounded-full ${badgeStyle.bg} opacity-15 blur-3xl pointer-events-none`}
        ></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Left: IMD Alert Level Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span
                className={`px-4 py-1.5 rounded-xl text-white font-black text-sm tracking-wider uppercase shadow-md flex items-center gap-2 ${badgeStyle.bg}`}
              >
                <AlertTriangle className="w-4 h-4" />
                IMD CODE {rainfallSummary.alertLevel.toUpperCase()}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                National Early Warning Protocol
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {rainfallSummary.alertTitle}
            </h1>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
              {rainfallSummary.alertDescription}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400 pt-1">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                City Focus: {city.name}, {city.state}
              </span>
              <span>•</span>
              <span>Hotspot Areas: {city.historicalHotspot}</span>
            </div>
          </div>

          {/* Right: Key Meteorological Telemetry Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 min-w-[320px]">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Peak Hourly Intensity
              </span>
              <div className="text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                {rainfallSummary.peakHourlyRate}{' '}
                <span className="text-xs font-semibold text-slate-500">mm/hr</span>
              </div>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                Convective Peak
              </span>
            </div>

            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Next 24h Total
              </span>
              <div className="text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                {rainfallSummary.accumulatedNext24h}{' '}
                <span className="text-xs font-semibold text-slate-500">mm</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                72h Sum: {rainfallSummary.accumulatedNext72h}mm
              </span>
            </div>

            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Soil Saturation Index
              </span>
              <div className="text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                {rainfallSummary.soilSaturationPercent}
                <span className="text-xs font-semibold text-slate-500">%</span>
              </div>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                Past 3d Rain: {rainfallSummary.past3DayTotal}mm
              </span>
            </div>

            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Vulnerable Wards
              </span>
              <div className="text-xl font-black text-red-600 mt-0.5">
                {wardRisks.filter((w) => w.riskScore >= 60).length} / {wardRisks.length}
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                High / Critical Inundation
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Illustrative Input Disclaimer */}
      <div className="bg-blue-50/60 dark:bg-blue-950/30 p-3 rounded-xl border border-blue-200/70 dark:border-blue-900/50 flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-300">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Scientific Methodology Note:</strong> Ward low-lying and drainage deficiency scores are illustrative baseline inputs calibrated for SIH 2026. Designed for dynamic ingestion of CartoDEM / Copernicus 30m Digital Elevation Models (DEM) and Height Above Nearest Drainage (HAND) hydraulic flow grids.
        </p>
      </div>

      {/* 72h Rainfall Forecast Chart */}
      <RainfallChart
        hourlyPoints={rainfallSummary.hourlyPoints}
        isDark={isDark}
        language={language}
      />

      {/* Transparent Inundation Formula Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
              {language === 'hi'
                ? 'वार्ड जलभराव जोखिम गणना सूत्र (Inundation Risk Formulation)'
                : 'Ward Inundation Susceptibility Formulation'}
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">Physics-Informed Empirical</span>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl font-mono text-xs text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
          <span className="text-blue-600 dark:text-blue-400 font-bold">Inundation Risk (0-100)</span> =
          {' [0.35 × Forecast_Rainfall_Factor + 0.25 × Soil_Saturation + 0.25 × LowLying_Score + 0.15 × (1 - Drainage_Efficiency)] × Convective_Surge_Factor'}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600 dark:text-slate-400">
          <div className="bg-slate-50/50 dark:bg-slate-800/40 p-2 rounded-lg">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">Rainfall (35%)</span>
            Next 24h accumulation normalized to 180mm.
          </div>
          <div className="bg-slate-50/50 dark:bg-slate-800/40 p-2 rounded-lg">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">Soil Moisture (25%)</span>
            Past 3-day antecedent moisture index.
          </div>
          <div className="bg-slate-50/50 dark:bg-slate-800/40 p-2 rounded-lg">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">Low-Lying (25%)</span>
            Basin depression index (DEM / HAND).
          </div>
          <div className="bg-slate-50/50 dark:bg-slate-800/40 p-2 rounded-lg">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">Drainage (15%)</span>
            Stormwater outfall deficit & culvert bottleneck.
          </div>
        </div>
      </div>

      {/* Ward Inundation Susceptibility Rankings */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              {language === 'hi' ? 'वार्ड-स्तरीय जलभराव जोखिम अनुक्रम' : 'Ward-Level Inundation Risk Ranking'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ranked descending by calculated vulnerability score; click any ward to view action protocol.
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter ward name..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-semibold">
              <button
                onClick={() => setWardFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  wardFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                All ({wardRisks.length})
              </button>
              <button
                onClick={() => setWardFilter('critical')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  wardFilter === 'critical'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                High/Critical
              </button>
            </div>
          </div>
        </div>

        {/* Wards Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredWards.map((w) => {
            const isSelected = selectedWardId === w.wardId;
            return (
              <div
                key={w.wardId}
                onClick={() => onSelectWard(w.wardId)}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-blue-600 ring-2 ring-blue-500/50 bg-blue-50/40 dark:bg-blue-950/20 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block font-bold">
                      {w.wardId}
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {w.wardName}
                    </h4>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase text-white tracking-wider shrink-0"
                    style={{ backgroundColor: w.colorHex }}
                  >
                    {w.riskCategory}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/70 p-2 rounded-lg">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Risk Score</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-base">
                      {w.riskScore}
                      <span className="text-[10px] text-slate-400">/100</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Est. Depth</span>
                    <span className="font-bold text-blue-700 dark:text-blue-400 text-base">
                      {w.expectedWaterDepthCm} cm
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                  <div>
                    <span className="font-medium text-slate-600 dark:text-slate-300">DEM Class:</span>{' '}
                    {w.elevationCategory}
                  </div>
                  <div className="truncate">
                    <span className="font-medium text-slate-600 dark:text-slate-300">Infra:</span>{' '}
                    {w.criticalInfrastructure}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-medium">
                  <span>View Mitigation Directives</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Ward Detail Drawer Modal / Card */}
      {selectedWard && (
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 border border-slate-800 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">
                  Ward Emergency Protocol: {selectedWard.wardName}
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Micro-basin assessment for {city.name} District Administration
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="px-3 py-1 rounded-full text-xs font-black uppercase text-white shadow-sm"
                style={{ backgroundColor: selectedWard.colorHex }}
              >
                {selectedWard.riskCategory} Risk ({selectedWard.riskScore}/100)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 block uppercase">Topographic Index</span>
              <span className="font-semibold text-xs text-slate-200">{selectedWard.elevationCategory}</span>
              <div className="text-[10px] text-slate-400 mt-1">
                Low-Lying Score: {(selectedWard.lowLyingScore * 100).toFixed(0)}%
              </div>
            </div>

            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 block uppercase">Drainage Outfall Deficit</span>
              <span className="font-semibold text-xs text-amber-300">
                {selectedWard.drainageDeficiencyPercent}% Bottleneck
              </span>
              <div className="text-[10px] text-slate-400 mt-1">
                Runoff backflow threshold reached
              </div>
            </div>

            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 block uppercase">Critical Assets at Risk</span>
              <span className="font-semibold text-xs text-slate-200">{selectedWard.criticalInfrastructure}</span>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl space-y-1">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
              Official Recommended Action Protocol:
            </span>
            <p className="text-xs sm:text-sm text-amber-100 leading-relaxed font-sans">
              "{selectedWard.recommendedAction}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
