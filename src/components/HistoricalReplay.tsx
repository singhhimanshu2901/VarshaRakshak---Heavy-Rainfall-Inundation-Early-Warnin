import React, { useState } from 'react';
import historicalData from '../data/historicalEvents.json';
import { History, Clock, ArrowRight, ShieldCheck, AlertTriangle, CheckCircle2, ChevronRight, Zap } from 'lucide-react';

interface HistoricalReplayProps {
  isDark: boolean;
  language: 'en' | 'hi';
}

export const HistoricalReplay: React.FC<HistoricalReplayProps> = ({
  isDark,
  language,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>('mumbai-2005');
  const [selectedStepIdx, setSelectedStepIdx] = useState<number>(0);

  const activeEvent =
    historicalData.find((ev) => ev.id === selectedEventId) || historicalData[0];
  const activeTimeline = activeEvent.timelines[selectedStepIdx];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {language === 'hi'
                ? 'ऐतिहासिक आपदा पुनरावलोकन एवं पूर्व चेतावनी अनुकरण'
                : 'Historical Deluge Replay & Early Warning Simulation'}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {language === 'hi'
              ? 'प्रमाणित भारी वर्षा घटनाओं पर सिमुलेशन: -24 घंटे और -6 घंटे पहले वार्निंग कैसे जीवन बचा सकती थी।'
              : 'Benchmark heavy precipitation disasters in India: Inspect what alert VarshaRakshak would have generated 24h & 6h prior.'}
          </p>
        </div>

        {/* Event Selector Buttons */}
        <div className="flex flex-wrap gap-2">
          {historicalData.map((ev) => {
            const isChosen = ev.id === selectedEventId;
            return (
              <button
                key={ev.id}
                onClick={() => {
                  setSelectedEventId(ev.id);
                  setSelectedStepIdx(0);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  isChosen
                    ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-300 dark:ring-amber-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                }`}
              >
                {ev.cityName} ({ev.date.split(' ')[2] || ev.date})
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Event Context Card */}
      <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-amber-950 dark:text-amber-200 text-base">
              {activeEvent.title}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-semibold">
              {activeEvent.date}
            </span>
          </div>
          <p className="text-xs text-amber-900/80 dark:text-amber-300/80 mt-1 max-w-2xl leading-relaxed">
            {activeEvent.synopticSummary}
          </p>
        </div>
        <div className="flex gap-4 border-t sm:border-t-0 sm:border-l border-amber-200 dark:border-amber-900 pt-2 sm:pt-0 sm:pl-4">
          <div>
            <div className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">
              Peak 24h Rain
            </div>
            <div className="text-xl font-black text-amber-950 dark:text-amber-100">
              {activeEvent.historicalPeak24h} <span className="text-xs font-medium">mm</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">
              Max Intensity
            </div>
            <div className="text-xl font-black text-amber-950 dark:text-amber-100">
              {activeEvent.historicalPeakHourly} <span className="text-xs font-medium">mm/h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Slider & Navigation */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Time-to-Event Replay Scrubber:</span>
          </div>
          <span className="text-blue-600 dark:text-blue-400">
            {activeTimeline.step} ({activeTimeline.timestamp})
          </span>
        </div>

        {/* Step Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {activeEvent.timelines.map((timeline, idx) => {
            const isCurrent = selectedStepIdx === idx;
            const alertColor =
              timeline.systemAlert === 'Red'
                ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                : 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300';

            return (
              <button
                key={timeline.step}
                onClick={() => setSelectedStepIdx(idx)}
                className={`p-3 rounded-xl border text-left transition-all relative ${
                  isCurrent
                    ? `${alertColor} ring-2 ring-blue-500 shadow-md font-bold`
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-extrabold mb-1">
                  <span>{timeline.step}</span>
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      timeline.systemAlert === 'Red' ? 'bg-red-600' : 'bg-orange-500'
                    }`}
                  ></span>
                </div>
                <div className="text-[11px] truncate opacity-90">{timeline.systemAlertTitle}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Est. 24h: {timeline.forecastRain24h} mm
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Replay Comparison Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* VarshaRakshak Early Warning Performance */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800/90 dark:to-indigo-950/40 rounded-xl p-4 border border-blue-200 dark:border-indigo-900/60 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-200 text-sm">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span>VarshaRakshak Automated Prediction</span>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-black text-white ${
                activeTimeline.systemAlert === 'Red' ? 'bg-red-600' : 'bg-orange-500'
              }`}
            >
              {activeTimeline.systemAlert.toUpperCase()} ALERT
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-white/80 dark:bg-slate-900/70 p-3 rounded-xl text-center">
            <div>
              <div className="text-[10px] text-slate-500">Inundation Risk</div>
              <div className="text-base font-black text-red-600">
                {activeTimeline.inundationProbability}%
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">Soil Saturation</div>
              <div className="text-base font-black text-blue-700 dark:text-blue-300">
                {activeTimeline.soilSaturation}%
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">Projected Peak</div>
              <div className="text-base font-black text-slate-800 dark:text-slate-100">
                {activeTimeline.hourlyRate} <span className="text-[10px]">mm/h</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-2.5 rounded-lg flex items-start gap-2 text-xs text-emerald-900 dark:text-emerald-200">
            <Zap className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Lead-Time Advantage: </span>
              {activeTimeline.predictionLeadAdvantage}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Automated Action Triggered:
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-400 bg-white/80 dark:bg-slate-900/70 p-2.5 rounded-lg leading-relaxed border border-slate-200 dark:border-slate-800">
              {activeTimeline.actionProposed}
            </p>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              High-Risk Wards Flagged:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activeTimeline.highRiskWards.map((w) => (
                <span
                  key={w}
                  className="px-2 py-0.5 rounded text-[11px] font-medium bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800"
                >
                  {w}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Traditional / Conventional Synoptic Baseline */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300 text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>Conventional Manual System (Baseline)</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {activeTimeline.traditionalAlert}
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                Traditional Bottlenecks:
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                <li>Relied on coarse regional synoptic weather bulletins (sub-division level).</li>
                <li>No micro-topographic (ward-level) inundation routing.</li>
                <li>Red alerts were typically issued after flood water breached critical railway lines.</li>
              </ul>
            </div>

            <div className="p-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <span className="font-bold text-blue-900 dark:text-blue-300 block mb-1">
                Why Early Warning Lead Time Matters:
              </span>
              In urban disasters, every 1 hour of early lead time increases municipal evacuation capacity by ~15%, allowing preventive shutdown of electrified feeder pillars and timely closure of submerged underpasses.
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Historical Ground-Truth Comparison</span>
            <span className="font-mono font-bold text-blue-600">Event Replay Complete</span>
          </div>
        </div>
      </div>
    </div>
  );
};
