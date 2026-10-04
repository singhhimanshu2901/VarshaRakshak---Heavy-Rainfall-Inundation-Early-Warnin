/**
 * VarshaRakshak: AI/ML-Based Integrated Heavy Rainfall Early Warning & Inundation Prediction System
 * Smart India Hackathon 2026 • Problem Statement 26071
 * Ministry of Earth Sciences (MoES) • India Meteorological Department (IMD)
 */

import React, { useState, useEffect } from 'react';
import citiesData from './data/cities.json';
import { CityDefinition, processWeatherData, RainfallRiskSummary, WardInundationRisk } from './utils/riskEngine';
import { fetchCityWeatherData, WeatherFetchResult } from './services/weatherService';
import { translations, Language } from './utils/translations';
import { DashboardHome } from './components/DashboardHome';
import { MapViewTab } from './components/MapViewTab';
import { NowcastPanel } from './components/NowcastPanel';
import { HistoricalReplay } from './components/HistoricalReplay';
import { AlertCentre } from './components/AlertCentre';
import { ModelPerformance } from './components/ModelPerformance';
import { AboutArchitecture } from './components/AboutArchitecture';

import {
  CloudRain,
  Shield,
  MapPin,
  Radar,
  History,
  BellRing,
  BarChart3,
  GitFork,
  Moon,
  Sun,
  Globe,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';

const CITIES: CityDefinition[] = citiesData as CityDefinition[];

export default function App() {
  const [selectedCityId, setSelectedCityId] = useState<string>('mumbai');
  const [currentTab, setCurrentTab] = useState<
    'dashboard' | 'map' | 'nowcast' | 'replay' | 'alerts' | 'metrics' | 'about'
  >('dashboard');
  const [language, setLanguage] = useState<Language>('en');
  const [isDark, setIsDark] = useState<boolean>(false);
  const [selectedWardId, setSelectedWardId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Data states
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchResult, setFetchResult] = useState<WeatherFetchResult | null>(null);
  const [processedResult, setProcessedResult] = useState<{
    rainfallSummary: RainfallRiskSummary;
    wardRisks: WardInundationRisk[];
  } | null>(null);

  const activeCity = CITIES.find((c) => c.id === selectedCityId) || CITIES[0];
  const t = translations[language];

  // Toggle Dark Mode class on document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Load weather forecast whenever selected city changes
  const loadWeatherData = async (city: CityDefinition) => {
    setLoading(true);
    try {
      const result = await fetchCityWeatherData(city.id, city.lat, city.lon);
      setFetchResult(result);
      const processed = processWeatherData(result.data, city);
      setProcessedResult(processed);
      // default select the highest risk ward
      if (processed.wardRisks.length > 0) {
        setSelectedWardId(processed.wardRisks[0].wardId);
      }
    } catch (err) {
      console.error('Failed to load weather data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeatherData(activeCity);
  }, [selectedCityId]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Government-Tech Notification Bar */}
      <div className="bg-slate-900 text-slate-300 text-[11px] px-4 py-1.5 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-semibold text-white tracking-wide">
              {t.sihBadge}
            </span>
            <span className="hidden md:inline text-slate-500">•</span>
            <span className="hidden md:inline text-slate-300">
              {t.ministryBadge}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {fetchResult && (
              <span className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    fetchResult.source === 'live' ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                ></span>
                {fetchResult.source === 'live' ? t.liveData : t.cachedData} ({fetchResult.latencyMs}ms)
              </span>
            )}

            <button
              onClick={() => loadWeatherData(activeCity)}
              title={t.refreshData}
              className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-blue-400' : ''}`} />
              <span className="hidden sm:inline">{t.refreshData}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main App Header */}
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Brand & Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <CloudRain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50">
                  {t.appTitle}
                </span>
                <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  SIH 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block truncate max-w-md">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Controls: City Selector, Language & Dark Mode */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* City Selector */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <select
                value={selectedCityId}
                onChange={(e) => setSelectedCityId(e.target.value)}
                className="bg-transparent font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
              >
                {CITIES.map((c) => (
                  <option key={c.id} value={c.id} className="dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    {c.name} ({c.state})
                  </option>
                ))}
              </select>
            </div>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              title="Toggle English / हिन्दी"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-500" />
              <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 md:hidden text-slate-700 dark:text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex space-x-1 overflow-x-auto py-1 border-t border-slate-100 dark:border-slate-800 text-xs font-bold scrollbar-none">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <CloudRain className="w-4 h-4" />
              <span>{t.navDashboard}</span>
            </button>

            <button
              onClick={() => setCurrentTab('map')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                currentTab === 'map'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>{t.navMap}</span>
            </button>

            <button
              onClick={() => setCurrentTab('nowcast')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                currentTab === 'nowcast'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Radar className="w-4 h-4" />
              <span>{t.navNowcast}</span>
            </button>

            <button
              onClick={() => setCurrentTab('replay')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                currentTab === 'replay'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              <span>{t.navReplay}</span>
            </button>

            <button
              onClick={() => setCurrentTab('alerts')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                currentTab === 'alerts'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BellRing className="w-4 h-4" />
              <span>{t.navAlerts}</span>
            </button>

            <button
              onClick={() => setCurrentTab('metrics')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                currentTab === 'metrics'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>{t.navMetrics}</span>
            </button>

            <button
              onClick={() => setCurrentTab('about')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                currentTab === 'about'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <GitFork className="w-4 h-4" />
              <span>{t.navAbout}</span>
            </button>
          </nav>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-900 space-y-1 text-xs font-bold">
            <button
              onClick={() => {
                setCurrentTab('dashboard');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left p-2.5 rounded-lg flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <CloudRain className="w-4 h-4 text-blue-600" />
              <span>{t.navDashboard}</span>
            </button>
            <button
              onClick={() => {
                setCurrentTab('map');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left p-2.5 rounded-lg flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>{t.navMap}</span>
            </button>
            <button
              onClick={() => {
                setCurrentTab('nowcast');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left p-2.5 rounded-lg flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Radar className="w-4 h-4 text-indigo-600" />
              <span>{t.navNowcast}</span>
            </button>
            <button
              onClick={() => {
                setCurrentTab('replay');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left p-2.5 rounded-lg flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <History className="w-4 h-4 text-amber-600" />
              <span>{t.navReplay}</span>
            </button>
            <button
              onClick={() => {
                setCurrentTab('alerts');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left p-2.5 rounded-lg flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <BellRing className="w-4 h-4 text-red-600" />
              <span>{t.navAlerts}</span>
            </button>
            <button
              onClick={() => {
                setCurrentTab('metrics');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left p-2.5 rounded-lg flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <span>{t.navMetrics}</span>
            </button>
            <button
              onClick={() => {
                setCurrentTab('about');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left p-2.5 rounded-lg flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <GitFork className="w-4 h-4 text-emerald-600" />
              <span>{t.navAbout}</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          /* Loading Skeleton */
          <div className="space-y-6 animate-pulse">
            <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
            <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
              <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
              <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
            </div>
          </div>
        ) : processedResult ? (
          <>
            {currentTab === 'dashboard' && (
              <DashboardHome
                city={activeCity}
                rainfallSummary={processedResult.rainfallSummary}
                wardRisks={processedResult.wardRisks}
                selectedWardId={selectedWardId}
                onSelectWard={(id) => setSelectedWardId(id)}
                isDark={isDark}
                language={language}
              />
            )}

            {currentTab === 'map' && (
              <MapViewTab
                city={activeCity}
                wardRisks={processedResult.wardRisks}
                selectedWardId={selectedWardId}
                onSelectWard={(id) => setSelectedWardId(id)}
                isDark={isDark}
                language={language}
              />
            )}

            {currentTab === 'nowcast' && (
              <div className="space-y-6">
                <NowcastPanel
                  city={activeCity}
                  wardRisks={processedResult.wardRisks}
                  peakHourlyRate={processedResult.rainfallSummary.peakHourlyRate}
                  isDark={isDark}
                  language={language}
                />
                <DashboardHome
                  city={activeCity}
                  rainfallSummary={processedResult.rainfallSummary}
                  wardRisks={processedResult.wardRisks}
                  selectedWardId={selectedWardId}
                  onSelectWard={(id) => setSelectedWardId(id)}
                  isDark={isDark}
                  language={language}
                />
              </div>
            )}

            {currentTab === 'replay' && (
              <HistoricalReplay isDark={isDark} language={language} />
            )}

            {currentTab === 'alerts' && (
              <AlertCentre
                city={activeCity}
                alertLevel={processedResult.rainfallSummary.alertLevel}
                peakHourlyRate={processedResult.rainfallSummary.peakHourlyRate}
                accumulated24h={processedResult.rainfallSummary.accumulatedNext24h}
                wardRisks={processedResult.wardRisks}
                language={language}
              />
            )}

            {currentTab === 'metrics' && (
              <ModelPerformance language={language} isDark={isDark} />
            )}

            {currentTab === 'about' && (
              <AboutArchitecture language={language} />
            )}
          </>
        ) : (
          <div className="p-12 text-center text-slate-500">
            Failed to process meteorological telemetry. Please refresh.
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500 dark:text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              VarshaRakshak • Smart India Hackathon 2026 (PS 26071)
            </span>
          </div>

          <div className="text-center sm:text-right">
            <span>Ministry of Earth Sciences (MoES) • India Meteorological Department (IMD)</span>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Powered by Open-Meteo Forecast API & Google Gemini AI • Standard IMD Color Warning Coding
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
