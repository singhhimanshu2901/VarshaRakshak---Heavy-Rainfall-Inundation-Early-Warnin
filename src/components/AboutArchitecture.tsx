import React, { useState } from 'react';
import {
  GitFork,
  ArrowRight,
  Database,
  Layers,
  Cpu,
  Waves,
  BellRing,
  Users,
  Code,
  FileCode2,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  Shield,
  Lightbulb,
} from 'lucide-react';

interface AboutArchitectureProps {
  language: 'en' | 'hi';
}

export const AboutArchitecture: React.FC<AboutArchitectureProps> = ({ language }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const sampleDemSnippet = `// VarshaRakshak DEM/HAND Raster Ingestion Pipeline
// Replace synthetic ward lowLyingScore with GDAL raster zonal statistics

import { fromFile } from 'geotiff'; // or python rasterio backend
import { computeHAND } from './hydroEngine';

export async function extractWardTopographicIndex(
  demRasterPath: string,       // e.g. 'data/CartoDEM_v3_Mumbai_30m.tif'
  drainageNetworkPath: string,  // HydroSHEDS stream vector GeoJSON
  wardPolygonGeoJSON: any
) {
  // 1. Open Digital Elevation Model
  const tiff = await fromFile(demRasterPath);
  const image = await tiff.getImage();
  const elevationData = await image.readRasters();

  // 2. Compute Height Above Nearest Drainage (HAND)
  // HAND calculates vertical distance between each DEM cell and the nearest flow path
  const handGrid = computeHAND(elevationData, drainageNetworkPath);

  // 3. Zonal statistics: Calculate mean HAND and depression depth for each ward
  const wardZonalStats = wardPolygonGeoJSON.features.map((ward: any) => {
    const handValuesInWard = extractPixelsInPolygon(handGrid, ward.geometry);
    const meanHAND = average(handValuesInWard);
    
    // Normalized low-lying vulnerability score (0.0 = high ridge, 1.0 = deep depression)
    const lowLyingScore = Math.max(0, Math.min(1, (15.0 - meanHAND) / 15.0));
    
    return {
      wardId: ward.properties.ward_id,
      lowLyingScore,
      meanHAND_meters: meanHAND,
      elevationCategory: meanHAND < 2.0 ? 'Saucer Depression / Sea-Level Fringe' : 'Upland Ridge'
    };
  });

  return wardZonalStats;
}`;

  return (
    <div className="space-y-6">
      {/* Overview & Hackathon Info Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                VarshaRakshak System Architecture & SIH 2026 Context
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Smart India Hackathon 2026 • Problem Statement 26071 • Ministry of Earth Sciences (MoES) / India Meteorological Department (IMD)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
              PS 26071
            </span>
          </div>
        </div>

        <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
          <p>
            <strong>Problem Statement 26071:</strong> <em>"AI/ML-Based Integrated Heavy Rainfall Early Warning and Inundation Prediction System"</em> addresses one of the most pressing challenges facing urban India: predicting rapid localized cloudbursts, severe monsoon downpours, and resulting urban inundation at micro-basin (ward) granularity before arterial roads, underpasses, and low-lying settlements are overwhelmed.
          </p>
          <p>
            VarshaRakshak integrates numerical weather prediction (NWP) precipitation forecasts with antecedent soil saturation dynamics and physical urban topography to provide actionable, bilingual decision support for District Disaster Management Authorities (DDMA) and municipal commissioners.
          </p>
        </div>
      </div>

      {/* End-to-End Pipeline Diagram */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
            <GitFork className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            End-to-End Data Pipeline & Algorithmic Flow
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Six-stage integrated processing chain from telemetry ingestion to automated emergency broadcast
          </p>
        </div>

        {/* Responsive Pipeline Steps */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 pt-2">
          {/* Stage 1 */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-2">
            <div>
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center mb-2">
                1
              </div>
              <div className="font-bold text-slate-800 dark:text-slate-100 text-xs">Data Ingestion</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                Open-Meteo Hourly API, IMD AWS gauges, DWR radar volumes, and INSAT-3DR satellite data.
              </div>
            </div>
            <div className="text-[10px] font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 p-1 rounded">
              REST / NetCDF
            </div>
          </div>

          {/* Stage 2 */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-2">
            <div>
              <div className="w-7 h-7 rounded-lg bg-cyan-100 dark:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 font-bold text-xs flex items-center justify-center mb-2">
                2
              </div>
              <div className="font-bold text-slate-800 dark:text-slate-100 text-xs">Spatiotemporal Fusion</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                Antecedent Soil Moisture (3-day exponential decay) + 3h / 24h rolling accumulations.
              </div>
            </div>
            <div className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 p-1 rounded">
              Antecedent Decay
            </div>
          </div>

          {/* Stage 3 */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-2">
            <div>
              <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center mb-2">
                3
              </div>
              <div className="font-bold text-slate-800 dark:text-slate-100 text-xs">Rainfall Risk Engine</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                Probability of heavy rainfall + P10/P50/P90 ensemble bounds + IMD threshold categorizer.
              </div>
            </div>
            <div className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 p-1 rounded">
              IMD Color Standard
            </div>
          </div>

          {/* Stage 4 */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-2">
            <div>
              <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center justify-center mb-2">
                4
              </div>
              <div className="font-bold text-slate-800 dark:text-slate-100 text-xs">Inundation Model</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                Ward depression index, drainage deficit, soil saturation, and convective surge amplifier.
              </div>
            </div>
            <div className="text-[10px] font-mono text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-1 rounded">
              0-100 Ward Score
            </div>
          </div>

          {/* Stage 5 */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-2">
            <div>
              <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center mb-2">
                5
              </div>
              <div className="font-bold text-slate-800 dark:text-slate-100 text-xs">Gemini AI Advisory</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                Official emergency directives in Hindi and English prioritizing top vulnerable wards.
              </div>
            </div>
            <div className="text-[10px] font-mono text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 p-1 rounded">
              Bilingual MoES/IMD
            </div>
          </div>

          {/* Stage 6 */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-2">
            <div>
              <div className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300 font-bold text-xs flex items-center justify-center mb-2">
                6
              </div>
              <div className="font-bold text-slate-800 dark:text-slate-100 text-xs">Alert & Dissemination</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                District Collector dispatch, DDMA control room audit, CAP-CP common alerting protocol.
              </div>
            </div>
            <div className="text-[10px] font-mono text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-1 rounded">
              Action Taken
            </div>
          </div>
        </div>
      </div>

      {/* Transparent Formula Card */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Code className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-white text-base">
            Transparent Mathematical Formulation (Inundation Susceptibility Engine)
          </h3>
        </div>

        <div className="bg-black/50 p-4 rounded-xl font-mono text-xs text-cyan-300 border border-cyan-900/60 overflow-x-auto leading-relaxed">
          <div className="text-amber-400 font-bold">
            Risk_Score(Ward, t) = Clamped[0, 100] {'{'}
          </div>
          <div className="pl-4 text-slate-200">
            [ 0.35 × (R_forecast_24h / 180mm) +
          </div>
          <div className="pl-4 text-slate-200">
            &nbsp;&nbsp;0.25 × Soil_Saturation(Past_3Day) +
          </div>
          <div className="pl-4 text-slate-200">
            &nbsp;&nbsp;0.25 × Ward_LowLying_Index +
          </div>
          <div className="pl-4 text-slate-200">
            &nbsp;&nbsp;0.15 × (1.0 - Ward_Drainage_Efficiency) ] × 100 × Convective_Surge_Multiplier
          </div>
          <div className="text-amber-400 font-bold">{'}'}</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-slate-300 pt-2">
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="font-bold text-cyan-400 block mb-1">1. Forecast Rain Factor (35%)</span>
            Normalized against 180mm 24-hour threshold (approaching IMD Extremely Heavy mark).
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="font-bold text-blue-400 block mb-1">2. Soil Saturation (25%)</span>
            Calculated from 3-day antecedent rainfall with time-decay weighting against 120mm urban soil threshold.
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="font-bold text-amber-400 block mb-1">3. Low-Lying Vulnerability (25%)</span>
            Topographic depression score (0.0 to 1.0) derived from physical basin and elevation contours.
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="font-bold text-red-400 block mb-1">4. Drainage Deficit (15%)</span>
            Inverse of stormwater outfall capacity, culvert bottleneck, and tidal backflow vulnerability.
          </div>
        </div>
      </div>

      {/* Developer Integration README */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              Developer Guide: How to Swap in Real Satellite Rasters & DEM/HAND Data
            </h3>
          </div>
          <button
            onClick={() => copyToClipboard(sampleDemSnippet, 'dem-snippet')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all"
          >
            {copiedSection === 'dem-snippet' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy Code
              </>
            )}
          </button>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            VarshaRakshak is designed with modular dependency decoupling. In production deployment, replace the baseline JSON ward parameters with high-resolution Digital Elevation Model (DEM) rasters:
          </p>
          <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <li>
              <strong>CartoDEM (ISRO Bhuvan) or Copernicus DEM 30m (GLO-30):</strong> Download GeoTIFF tiles for the target municipal boundaries.
            </li>
            <li>
              <strong>Generate HAND (Height Above Nearest Drainage):</strong> Run TauDEM or WhiteboxTools to compute D8 flow directions, flow accumulation, and vertical distance to stream channel.
            </li>
            <li>
              <strong>Extract Zonal Statistics:</strong> Overlay municipal ward boundary shapefiles / GeoJSON onto the HAND raster. Cells with HAND &lt; 2.0 meters are classified as high-risk ponding sumps.
            </li>
            <li>
              <strong>Replace JSON:</strong> Ingest the resulting dictionary into <code className="text-blue-600 font-mono">src/data/cities.json</code> or query dynamically via backend GIS service.
            </li>
          </ol>
        </div>

        {/* Code Block */}
        <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 font-mono text-xs text-emerald-400 p-4 overflow-x-auto max-h-80">
          <pre>{sampleDemSnippet}</pre>
        </div>
      </div>
    </div>
  );
};
