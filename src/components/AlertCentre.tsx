import React, { useState, useEffect } from 'react';
import { CityDefinition, WardInundationRisk, IMDAlertLevel } from '../utils/riskEngine';
import {
  BellRing,
  Send,
  Sparkles,
  CheckCircle2,
  FileText,
  Smartphone,
  MessageSquare,
  AlertOctagon,
  Shield,
  Clock,
  UserCheck,
  Building,
  RefreshCw,
} from 'lucide-react';

interface AlertLogEntry {
  id: string;
  timestamp: string;
  cityName: string;
  alertLevel: IMDAlertLevel;
  recipient: string;
  channel: 'SMS Gateway' | 'WhatsApp Broadcast' | 'Integrated CAP-CP';
  status: 'Dispatched & Acknowledged' | 'Transmitted' | 'Queued';
  wardTargets: string[];
  summary: string;
}

interface AlertCentreProps {
  city: CityDefinition;
  alertLevel: IMDAlertLevel;
  peakHourlyRate: number;
  accumulated24h: number;
  wardRisks: WardInundationRisk[];
  language: 'en' | 'hi';
}

export const AlertCentre: React.FC<AlertCentreProps> = ({
  city,
  alertLevel,
  peakHourlyRate,
  accumulated24h,
  wardRisks,
  language,
}) => {
  const [advisoryEn, setAdvisoryEn] = useState<string>('');
  const [advisoryHi, setAdvisoryHi] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeLangTab, setActiveLangTab] = useState<'en' | 'hi'>('en');
  const [showDispatchModal, setShowDispatchModal] = useState<boolean>(false);
  const [selectedRecipient, setSelectedRecipient] = useState<string>('District Magistrate & Collector');
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState<string | null>(null);

  // Top high-risk and critical wards
  const topVulnerableWards = wardRisks
    .filter((w) => w.riskScore >= 60)
    .map((w) => w.wardName);

  const highRiskWardsList =
    topVulnerableWards.length > 0
      ? topVulnerableWards
      : wardRisks.slice(0, 3).map((w) => w.wardName);

  // Initial Alert Log with realistic disaster control room history
  const [alertLogs, setAlertLogs] = useState<AlertLogEntry[]>([
    {
      id: 'AL-8921',
      timestamp: 'Today, 06:15 IST',
      cityName: city.name,
      alertLevel: alertLevel,
      recipient: 'District Magistrate & DDMA Command Room',
      channel: 'Integrated CAP-CP',
      status: 'Dispatched & Acknowledged',
      wardTargets: highRiskWardsList.slice(0, 2),
      summary: `Automated ${alertLevel} warning issued for ${city.name}. Pre-positioning pumps deployed.`,
    },
    {
      id: 'AL-8920',
      timestamp: 'Yesterday, 22:30 IST',
      cityName: city.name,
      alertLevel: 'Yellow',
      recipient: 'Municipal Stormwater Drainage Division',
      channel: 'SMS Gateway',
      status: 'Dispatched & Acknowledged',
      wardTargets: ['Central Drainage Sump', 'Railway Culverts'],
      summary: 'Maintenance patrol ordered to inspect trash screens along primary canals.',
    },
  ]);

  // Function to call Gemini API server endpoint
  const generateAdvisoryText = async (targetLang: 'en' | 'hi') => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cityName: city.name,
          alertLevel,
          peakHourlyRain: peakHourlyRate,
          accumulated24h,
          highRiskWards: highRiskWardsList,
          language: targetLang,
        }),
      });

      const json = await response.json();
      if (json.advisory) {
        if (targetLang === 'en') {
          setAdvisoryEn(json.advisory);
        } else {
          setAdvisoryHi(json.advisory);
        }
      }
    } catch (err) {
      console.error('Failed to generate advisory:', err);
      const fallback =
        targetLang === 'hi'
          ? `[आपातकालीन MoES/IMD बुलेटिन] ${city.name} में ${alertLevel} चेतावनी सक्रिय है। अगले 24 घंटों में ${accumulated24h} मिमी वर्षा संभावित है। संवेदनशील वार्ड: ${highRiskWardsList.join(', ')}। एनडीआरएफ टीमों को सतर्क रखें।`
          : `[OFFICIAL IMD/MoES ADVISORY] ${alertLevel.toUpperCase()} Alert active for ${city.name}. 24h accumulation: ${accumulated24h} mm. Peak: ${peakHourlyRate} mm/hr. Target vulnerable wards: ${highRiskWardsList.join(', ')}. Evacuation centers active.`;

      if (targetLang === 'en') setAdvisoryEn(fallback);
      else setAdvisoryHi(fallback);
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-generate on mount or city change if alert is Orange or Red
  useEffect(() => {
    generateAdvisoryText('en');
    generateAdvisoryText('hi');
  }, [city.id, alertLevel]);

  // Handle simulated dispatch
  const handleConfirmDispatch = () => {
    const newEntry: AlertLogEntry = {
      id: `AL-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: 'Just now, ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      cityName: city.name,
      alertLevel,
      recipient: selectedRecipient,
      channel: 'Integrated CAP-CP',
      status: 'Dispatched & Acknowledged',
      wardTargets: highRiskWardsList,
      summary: `Official ${alertLevel} directive dispatched to ${selectedRecipient}. Action protocols initiated.`,
    };

    setAlertLogs([newEntry, ...alertLogs]);
    setShowDispatchModal(false);
    setDispatchSuccessMsg(
      `Disaster bulletin successfully transmitted to ${selectedRecipient} via National Emergency Communication Protocol (CAP-CP / NIC SMS).`
    );
    setTimeout(() => setDispatchSuccessMsg(null), 5000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BellRing className="w-6 h-6 text-red-600 dark:text-red-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {language === 'hi'
                ? 'आपदा चेतावनी केंद्र एवं आधिकारिक बुलेटिन प्रेषण'
                : 'Emergency Alert Centre & Decision Support'}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {language === 'hi'
              ? 'ऑरेंज एवं रेड अलर्ट के लिए AI-संचालित द्विभाषी सलाह और जिला आपदा प्रबंधन प्राधिकरण (DDMA) संचार'
              : 'Automated bilingual advisories with priority ward evacuation recommendations for District Magistrates'}
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setShowDispatchModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>{language === 'hi' ? 'जिलाधिकारी को अलर्ट भेजें' : 'Send Alert to District Collector'}</span>
        </button>
      </div>

      {dispatchSuccessMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{dispatchSuccessMsg}</span>
        </div>
      )}

      {/* Priority Evacuation Targets Banner */}
      <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400">
            <AlertOctagon className="w-4 h-4" />
            <span>Priority Evacuation & Pump Pre-positioning Wards:</span>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-500">
            {highRiskWardsList.length} Wards Critical
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {wardRisks.slice(0, 4).map((w, idx) => (
            <div
              key={w.wardId}
              className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs shadow-sm"
            >
              <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300 font-bold flex items-center justify-center text-[10px]">
                #{idx + 1}
              </span>
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  {w.wardName}
                </span>
                <span className="text-[10px] text-slate-500">
                  Risk: {w.riskScore}/100 • Est. depth {w.expectedWaterDepthCm}cm
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Advisory Panel (Gemini Powered) */}
      <div className="bg-gradient-to-br from-indigo-50/70 via-blue-50/50 to-white dark:from-slate-800/80 dark:via-indigo-950/20 dark:to-slate-900 rounded-xl p-5 border border-indigo-200 dark:border-indigo-900/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {language === 'hi'
                    ? 'आधिकारिक आपातकालीन सलाह (Gemini AI द्वारा तैयार)'
                    : 'Official Disaster Management Advisory (Gemini AI Powered)'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                  MoES / IMD Protocol
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Action directives automatically generated based on numerical rainfall & ward depression models
              </span>
            </div>
          </div>

          {/* Lang Tabs & Refresh */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-slate-200 dark:bg-slate-700 p-0.5 text-xs font-bold">
              <button
                onClick={() => setActiveLangTab('en')}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeLangTab === 'en'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setActiveLangTab('hi')}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeLangTab === 'hi'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                हिन्दी (Hindi)
              </button>
            </div>

            <button
              onClick={() => generateAdvisoryText(activeLangTab)}
              disabled={isGenerating}
              title="Regenerate with Gemini"
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-1 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Advisory Content Box */}
        <div className="bg-white/90 dark:bg-slate-900/90 rounded-xl p-4 border border-indigo-100 dark:border-slate-800 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-200 font-sans shadow-inner min-h-[110px] flex items-center">
          {isGenerating ? (
            <div className="flex items-center gap-3 text-slate-500 py-3 mx-auto">
              <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
              <span className="font-medium text-xs">
                Generating actionable IMD early warning bulletin via Gemini AI...
              </span>
            </div>
          ) : (
            <div className="whitespace-pre-line">
              {activeLangTab === 'en' ? (advisoryEn || 'Drafting advisory...') : (advisoryHi || 'सलाह तैयार की जा रही है...')}
            </div>
          )}
        </div>
      </div>

      {/* Alert Log Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              Official Alert Dispatch & Transmission Log
            </h3>
          </div>
          <span className="text-xs text-slate-500">Live DDMA Network Audit</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">Ref ID</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Alert Level</th>
                <th className="p-3">Designated Recipient</th>
                <th className="p-3">Channel</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {alertLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {log.id}
                  </td>
                  <td className="p-3 whitespace-nowrap text-slate-500">{log.timestamp}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        log.alertLevel === 'Red'
                          ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                          : log.alertLevel === 'Orange'
                          ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300'
                      }`}
                    >
                      {log.alertLevel}
                    </span>
                  </td>
                  <td className="p-3 font-medium">{log.recipient}</td>
                  <td className="p-3 text-slate-500">{log.channel}</td>
                  <td className="p-3">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulated Dispatch Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-red-400" />
                <span className="font-bold text-sm sm:text-base">
                  Emergency Dispatch: District Collector / DDMA
                </span>
              </div>
              <button
                onClick={() => setShowDispatchModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Designated Recipient:
                </label>
                <select
                  value={selectedRecipient}
                  onChange={(e) => setSelectedRecipient(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                >
                  <option value="District Magistrate & Collector">
                    District Magistrate & Collector ({city.name} District)
                  </option>
                  <option value="Municipal Commissioner & Chief Engineer">
                    Municipal Commissioner (Stormwater & Drainage Cell)
                  </option>
                  <option value="Commandant, National Disaster Response Force (NDRF)">
                    Commandant, NDRF Regional Response Center
                  </option>
                  <option value="Joint Commissioner of Police (Traffic & Law)">
                    Joint Commissioner of Police (Traffic Control Room)
                  </option>
                </select>
              </div>

              {/* Message Channel Previews */}
              <div className="space-y-3">
                <div className="bg-slate-50 dark:bg-slate-800/70 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    <Smartphone className="w-4 h-4 text-blue-600" />
                    <span>SMS Broadcast Preview (Govt NIC Gateway)</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                    [IMD-EMERGENCY] {alertLevel.toUpperCase()} ALERT: {city.name}. Projected 24h Rain: {accumulated24h}mm, Peak {peakHourlyRate}mm/h. Immediate action directed for: {highRiskWardsList.slice(0, 3).join(', ')}. Evacuation centers active. Ref: PS26071.
                  </div>
                </div>

                <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-200 mb-1.5">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>Official WhatsApp Channel (Bilingual Bulletin)</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 space-y-1 leading-relaxed">
                    <div className="font-bold text-red-600">
                      🚨 VARSHARAKSHAK EARLY WARNING: {city.name.toUpperCase()}
                    </div>
                    <div>
                      <strong>Alert:</strong> {alertLevel} ({accumulated24h}mm expected in 24h)
                    </div>
                    <div>
                      <strong>Critical Wards:</strong> {highRiskWardsList.join(', ')}
                    </div>
                    <div className="text-slate-500 italic pt-1 border-t border-slate-200 dark:border-slate-800">
                      (सिमुलेटेड MoES/IMD आधिकारिक प्रसारण - कोई वास्तविक संदेश नहीं भेजा जाएगा)
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200">
                <strong>Safety Disclaimer:</strong> This is an authorized SIH 2026 test simulation. Clicking "Transmit Official Alert" registers the action in the local DDMA audit ledger without external carrier charges.
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-100 dark:bg-slate-800/80 p-4 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setShowDispatchModal(false)}
                className="px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDispatch}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmit Official Alert</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
