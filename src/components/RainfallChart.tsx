import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { HourlyForecastPoint } from '../utils/riskEngine';
import { CloudRain, Activity, Layers, Info } from 'lucide-react';

interface RainfallChartProps {
  hourlyPoints: HourlyForecastPoint[];
  isDark: boolean;
  language: 'en' | 'hi';
}

export const RainfallChart: React.FC<RainfallChartProps> = ({
  hourlyPoints,
  isDark,
  language,
}) => {
  const [viewMode, setViewMode] = useState<'hourly' | 'accumulated' | 'probability'>('hourly');

  // Format timestamp for display (e.g., "Thu 06:00")
  const chartData = hourlyPoints.map((pt, idx) => {
    const d = new Date(pt.time);
    const dayStr = isNaN(d.getTime())
      ? `T+${idx}h`
      : d.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
          weekday: 'short',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });

    return {
      timeLabel: dayStr,
      p10: pt.p10Precipitation,
      p50: pt.p50Precipitation,
      p90: pt.p90Precipitation,
      spread: Math.max(0, +(pt.p90Precipitation - pt.p10Precipitation).toFixed(1)),
      precipitation: pt.precipitation,
      accumulated24h: pt.accumulated24h,
      heavyProb: pt.heavyRainfallProbability,
      precipitationProb: pt.precipitationProbability,
    };
  });

  const gridStroke = isDark ? '#334155' : '#e2e8f0';
  const textFill = isDark ? '#94a3b8' : '#64748b';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      {/* Header with Mode Switches */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <CloudRain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              {language === 'hi' ? '72 घंटे वर्षा पूर्वानुमान एवं अनिश्चितता बैंड' : '72-Hour Precipitation & Uncertainty Band'}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'hi'
              ? 'P10-P90 एनसेंबल प्रकीर्णन के साथ संख्यात्मक मौसम मॉडल (NWP) आउटपुट'
              : 'Multi-model ensemble spread displaying P10 (Lower), P50 (Median), and P90 (Convective Surge)'}
          </p>
        </div>

        {/* View Switchers */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setViewMode('hourly')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'hourly'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            {language === 'hi' ? 'प्रति घंटा (mm/h)' : 'Hourly (mm/h)'}
          </button>
          <button
            onClick={() => setViewMode('accumulated')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'accumulated'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            {language === 'hi' ? '24h संचयी (mm)' : '24h Total (mm)'}
          </button>
          <button
            onClick={() => setViewMode('probability')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'probability'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            {language === 'hi' ? 'भारी वर्षा प्रायिकता (%)' : 'Heavy Prob (%)'}
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'hourly' ? (
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis
                dataKey="timeLabel"
                stroke={textFill}
                fontSize={11}
                tickLine={false}
                interval={Math.floor(chartData.length / 8)}
                angle={-25}
                textAnchor="end"
              />
              <YAxis stroke={textFill} fontSize={11} tickLine={false} unit=" mm" />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900/95 text-white p-2.5 rounded-xl text-xs shadow-xl border border-slate-700 space-y-1">
                        <div className="font-bold border-b border-slate-700 pb-1 text-slate-200">
                          {label}
                        </div>
                        <div className="text-blue-300 font-semibold">
                          Expected (P50): {data.p50} mm/hr
                        </div>
                        <div className="text-slate-300 text-[11px]">
                          Uncertainty Span: {data.p10} mm - {data.p90} mm/hr
                        </div>
                        <div className="text-amber-300 text-[11px]">
                          Heavy Rain Probability: {data.heavyProb}%
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                height={32}
                formatter={(value) => (
                  <span className="text-xs text-slate-600 dark:text-slate-300">{value}</span>
                )}
              />

              {/* IMD Threshold Reference Lines */}
              <ReferenceLine
                y={15.6}
                stroke="#ca8a04"
                strokeDasharray="4 4"
                label={{ value: 'IMD Heavy (>15.6 mm/h)', position: 'insideTopRight', fill: '#ca8a04', fontSize: 10 }}
              />
              <ReferenceLine
                y={30}
                stroke="#ea580c"
                strokeDasharray="4 4"
                label={{ value: 'Very Intense (>30 mm/h)', position: 'insideTopRight', fill: '#ea580c', fontSize: 10 }}
              />

              {/* P90 Upper Uncertainty Area */}
              <Area
                type="monotone"
                dataKey="p90"
                name="P90 Convective Bound"
                fill="#93c5fd"
                stroke="#60a5fa"
                fillOpacity={0.2}
              />

              {/* Median Forecast Bar */}
              <Bar
                dataKey="p50"
                name="Forecast Intensity (mm/h)"
                fill="#2563eb"
                radius={[4, 4, 0, 0]}
              />

              {/* P10 Lower Bound Line */}
              <Line
                type="monotone"
                dataKey="p10"
                name="P10 Minimum Expectation"
                stroke="#10b981"
                strokeWidth={1.5}
                dot={false}
              />
            </ComposedChart>
          ) : viewMode === 'accumulated' ? (
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis
                dataKey="timeLabel"
                stroke={textFill}
                fontSize={11}
                tickLine={false}
                interval={Math.floor(chartData.length / 8)}
                angle={-25}
                textAnchor="end"
              />
              <YAxis stroke={textFill} fontSize={11} tickLine={false} unit=" mm" />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900/95 text-white p-2.5 rounded-xl text-xs shadow-xl border border-slate-700 space-y-1">
                        <div className="font-bold border-b border-slate-700 pb-1 text-slate-200">
                          {label}
                        </div>
                        <div className="text-cyan-300 font-semibold">
                          24h Rolling Total: {data.accumulated24h} mm
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                height={32}
                formatter={(value) => (
                  <span className="text-xs text-slate-600 dark:text-slate-300">{value}</span>
                )}
              />

              {/* IMD 24h Thresholds */}
              <ReferenceLine
                y={64.5}
                stroke="#ca8a04"
                strokeDasharray="4 4"
                label={{ value: 'IMD Heavy (64.5 mm)', position: 'insideTopRight', fill: '#ca8a04', fontSize: 10 }}
              />
              <ReferenceLine
                y={115.6}
                stroke="#ea580c"
                strokeDasharray="4 4"
                label={{ value: 'Very Heavy (115.6 mm)', position: 'insideTopRight', fill: '#ea580c', fontSize: 10 }}
              />
              <ReferenceLine
                y={204.4}
                stroke="#dc2626"
                strokeDasharray="4 4"
                label={{ value: 'Extremely Heavy (204.4 mm)', position: 'insideTopRight', fill: '#dc2626', fontSize: 10 }}
              />

              <Area
                type="monotone"
                dataKey="accumulated24h"
                name="24h Rolling Accumulated (mm)"
                fill="#0284c7"
                stroke="#0369a1"
                strokeWidth={2}
                fillOpacity={0.25}
              />
            </ComposedChart>
          ) : (
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis
                dataKey="timeLabel"
                stroke={textFill}
                fontSize={11}
                tickLine={false}
                interval={Math.floor(chartData.length / 8)}
                angle={-25}
                textAnchor="end"
              />
              <YAxis stroke={textFill} fontSize={11} tickLine={false} unit="%" domain={[0, 100]} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900/95 text-white p-2.5 rounded-xl text-xs shadow-xl border border-slate-700 space-y-1">
                        <div className="font-bold border-b border-slate-700 pb-1 text-slate-200">
                          {label}
                        </div>
                        <div className="text-amber-400 font-semibold">
                          Heavy Rainfall Risk: {data.heavyProb}%
                        </div>
                        <div className="text-slate-300 text-[11px]">
                          Precipitation Probability: {data.precipitationProb}%
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                height={32}
                formatter={(value) => (
                  <span className="text-xs text-slate-600 dark:text-slate-300">{value}</span>
                )}
              />

              <ReferenceLine
                y={70}
                stroke="#dc2626"
                strokeDasharray="4 4"
                label={{ value: 'High Confidence Heavy Rain (>70%)', position: 'insideTopRight', fill: '#dc2626', fontSize: 10 }}
              />

              <Bar
                dataKey="heavyProb"
                name="Heavy Rainfall Probability (%)"
                fill="#d97706"
                radius={[4, 4, 0, 0]}
              />
              <Line
                type="monotone"
                dataKey="precipitationProb"
                name="General Rain Probability (%)"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Uncertainty & IMD Legend Note */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-blue-500" />
          <span>
            {language === 'hi'
              ? 'आईएमडी मानक: भारी (64.5-115.5mm), बहुत भारी (115.6-204.4mm), अत्यंत भारी (>204.4mm)'
              : 'IMD Standards: Heavy (64.5-115.5mm), Very Heavy (115.6-204.4mm), Extremely Heavy (>204.4mm)'}
          </span>
        </div>
        <span className="font-medium text-slate-700 dark:text-slate-300">
          Uncertainty: Ensemble P10-P90 Spread
        </span>
      </div>
    </div>
  );
};
