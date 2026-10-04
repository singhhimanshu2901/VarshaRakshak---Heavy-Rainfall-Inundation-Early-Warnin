import React, { useState, useEffect } from 'react';
import { CityDefinition, WardInundationRisk } from '../utils/riskEngine';
import { Play, Pause, RotateCcw, Radar, FastForward, Info, Compass, ShieldAlert } from 'lucide-react';

interface NowcastPanelProps {
  city: CityDefinition;
  wardRisks: WardInundationRisk[];
  peakHourlyRate: number;
  isDark: boolean;
  language: 'en' | 'hi';
}

const TIMESTEPS = [
  { label: 'T+00 min', offsetMinutes: 0, scale: 0.85, title: 'Current DWR Radar Echo' },
  { label: 'T+30 min', offsetMinutes: 30, scale: 1.15, title: 'Convective Core Surge' },
  { label: 'T+60 min', offsetMinutes: 60, scale: 1.35, title: 'Peak Basin Inundation Window' },
  { label: 'T+90 min', offsetMinutes: 90, scale: 1.20, title: 'Mesoscale Band Drift' },
  { label: 'T+120 min', offsetMinutes: 120, scale: 0.95, title: 'Secondary Cell Influx' },
  { label: 'T+150 min', offsetMinutes: 150, scale: 0.70, title: 'Gradual Dissipation' },
  { label: 'T+180 min', offsetMinutes: 180, scale: 0.50, title: 'Runoff Peak at Drainage Outfall' },
];

export const NowcastPanel: React.FC<NowcastPanelProps> = ({
  city,
  wardRisks,
  peakHourlyRate,
  isDark,
  language,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1200); // ms per step

  // Auto playback loop
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentStepIdx((prev) => (prev + 1) % TIMESTEPS.length);
    }, playbackSpeed);
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  const activeStep = TIMESTEPS[currentStepIdx];

  // Derive radar cell displacement based on time offset (simulates cloud movement WNW to ESE)
  const driftX = (activeStep.offsetMinutes / 180) * 40 - 20;
  const driftY = (activeStep.offsetMinutes / 180) * 28 - 14;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      {/* Title & Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
              <Radar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              {language === 'hi'
                ? '0-3 घंटे वर्षा गतिशीलता नाउकास्टिंग रडार'
                : '0-3 Hour High-Resolution Rainfall Nowcast'}
            </h3>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Nowcasting module (ConvLSTM planned)
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
              Doppler Weather Radar (DWR) 1km Synthetic Grid
            </span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl text-xs">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> Play
              </>
            )}
          </button>
          <button
            onClick={() => setCurrentStepIdx(0)}
            title="Reset to T+00"
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPlaybackSpeed((s) => (s === 1200 ? 600 : 1200))}
            className="px-2 py-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all flex items-center gap-1"
          >
            <FastForward className="w-3 h-3" />
            {playbackSpeed === 600 ? '2x Fast' : '1x Speed'}
          </button>
        </div>
      </div>

      {/* Main Radar Simulation Canvas */}
      <div className="relative w-full h-80 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
        {/* Radar concentric circular grid */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-24 h-24 rounded-full border border-cyan-400"></div>
          <div className="w-48 h-48 rounded-full border border-cyan-400 absolute"></div>
          <div className="w-72 h-72 rounded-full border border-cyan-400 absolute"></div>
          <div className="w-full h-px bg-cyan-400/40 absolute"></div>
          <div className="h-full w-px bg-cyan-400/40 absolute"></div>
        </div>

        {/* Rotating Radar Sweep Line */}
        <div
          className="absolute inset-0 pointer-events-none origin-center animate-[spin_4s_linear_infinite]"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, transparent 320deg, rgba(6, 182, 212, 0.25) 360deg)',
          }}
        ></div>

        {/* Dynamic Simulated Cloudburst Heatmap Core */}
        <div
          className="absolute transition-all duration-700 ease-out pointer-events-none"
          style={{
            transform: `translate(${driftX}px, ${driftY}px) scale(${activeStep.scale})`,
            filter: 'blur(22px)',
          }}
        >
          {/* Intense core (Red/Violet) */}
          <div className="w-44 h-44 rounded-full bg-gradient-to-tr from-red-600 via-orange-500 to-amber-300 opacity-80"></div>
          {/* Outer rain band (Cyan/Blue) */}
          <div className="w-64 h-64 rounded-full bg-blue-500/50 absolute -top-10 -left-10 -z-10"></div>
        </div>

        {/* Secondary convective fragment */}
        <div
          className="absolute transition-all duration-700 ease-out pointer-events-none"
          style={{
            transform: `translate(${driftX * 1.3 - 40}px, ${driftY * 1.2 + 30}px) scale(${
              activeStep.scale * 0.75
            })`,
            filter: 'blur(18px)',
          }}
        >
          <div className="w-28 h-28 rounded-full bg-amber-500/70"></div>
        </div>

        {/* City Ward Position Markers on the Radar Grid */}
        <div className="absolute inset-0 p-6 pointer-events-none flex flex-col justify-between">
          <div className="flex justify-between items-start text-xs font-mono text-cyan-400/80">
            <div>
              <span className="font-bold text-white block">{city.name.toUpperCase()} DWR RADAR</span>
              <span>250 km Range Scan • Band S</span>
            </div>
            <div className="text-right">
              <span className="text-amber-400 font-bold block">{activeStep.label}</span>
              <span className="text-slate-400">{activeStep.title}</span>
            </div>
          </div>

          {/* Wards placed relatively */}
          <div className="relative w-full h-44">
            {wardRisks.map((w, idx) => {
              // Distribute pseudo-spatially around grid
              const angle = (idx / wardRisks.length) * 2 * Math.PI;
              const radius = 60 + (idx % 3) * 35;
              const left = `calc(50% + ${Math.cos(angle) * radius}px)`;
              const top = `calc(50% + ${Math.sin(angle) * radius * 0.65}px)`;

              return (
                <div
                  key={w.wardId}
                  style={{ left, top }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-sans"
                >
                  <span
                    className={`w-2 h-2 rounded-full ring-2 ${
                      w.riskCategory === 'Critical'
                        ? 'bg-red-500 ring-red-300 animate-ping'
                        : w.riskCategory === 'High'
                        ? 'bg-orange-500 ring-orange-300'
                        : 'bg-yellow-400 ring-yellow-200'
                    }`}
                  ></span>
                  <span className="text-slate-200 font-medium px-1.5 py-0.5 rounded bg-slate-900/80 backdrop-blur-sm border border-slate-700 whitespace-nowrap shadow-sm">
                    {w.wardName.split('(')[0].trim()}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Bottom telemetry overlay */}
          <div className="flex justify-between items-end text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Vector: 22 km/h ESE (115°)</span>
            </div>
            <div className="text-right text-cyan-300">
              Peak Core: {(peakHourlyRate * activeStep.scale).toFixed(1)} mm/hr
            </div>
          </div>
        </div>
      </div>

      {/* Scrub Bar Timesteps */}
      <div className="space-y-1.5">
        <div className="grid grid-cols-7 gap-1">
          {TIMESTEPS.map((step, idx) => (
            <button
              key={step.label}
              onClick={() => {
                setCurrentStepIdx(idx);
                setIsPlaying(false);
              }}
              className={`p-2 rounded-xl text-center text-xs font-semibold transition-all border ${
                currentStepIdx === idx
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md ring-2 ring-indigo-300 dark:ring-indigo-800'
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="text-[11px]">{step.label}</div>
              <div className="text-[9px] truncate font-normal opacity-80 mt-0.5">
                {step.offsetMinutes === 0 ? 'Now' : `+${step.offsetMinutes}m`}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* DBZ Radar Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
        <div className="flex items-center gap-1.5 font-medium">
          <span>Reflectivity (dBZ):</span>
          <div className="flex h-2.5 rounded-full overflow-hidden border border-slate-300 dark:border-slate-700 w-36">
            <div className="w-1/4 bg-blue-400" title="15-30 dBZ (Light rain)"></div>
            <div className="w-1/4 bg-emerald-500" title="30-40 dBZ (Moderate rain)"></div>
            <div className="w-1/4 bg-amber-500" title="40-50 dBZ (Heavy rain)"></div>
            <div className="w-1/4 bg-red-600" title=">50 dBZ (Severe convective)"></div>
          </div>
        </div>
        <div className="text-[11px] flex items-center gap-1 text-slate-500">
          <Info className="w-3.5 h-3.5 text-blue-500" />
          <span>ConvLSTM optical flow extrapolation planned for IMD DWR network integration</span>
        </div>
      </div>
    </div>
  );
};
