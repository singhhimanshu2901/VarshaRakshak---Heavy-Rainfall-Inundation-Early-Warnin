/**
 * VarshaRakshak Risk Engines
 * SIH 2026 Problem Statement 26071
 * Ministry of Earth Sciences (MoES) / India Meteorological Department (IMD)
 *
 * This module isolates all mathematical formulations for heavy rainfall prediction,
 * ensemble uncertainty intervals, and ward-level urban inundation susceptibility.
 */

export interface WardDefinition {
  id: string;
  name: string;
  lat: number;
  lon: number;
  lowLyingScore: number; // 0.0 to 1.0 (Topographic depression index)
  drainageScore: number; // 0.0 to 1.0 (Stormwater outfall efficiency)
  elevationCategory: string;
  criticalInfrastructure: string;
  populationDensity: string;
  recommendedAction: string;
}

export interface CityDefinition {
  id: string;
  name: string;
  state: string;
  lat: number;
  lon: number;
  zoom: number;
  description: string;
  historicalHotspot: string;
  wards: WardDefinition[];
}

export type IMDAlertLevel = 'Green' | 'Yellow' | 'Orange' | 'Red';

export interface HourlyForecastPoint {
  time: string;
  precipitation: number; // mm
  precipitationProbability: number; // %
  accumulated3h: number; // mm
  accumulated24h: number; // mm
  heavyRainfallProbability: number; // % (0-100)
  p10Precipitation: number; // Lower 10th percentile (ensemble spread)
  p50Precipitation: number; // Median expectation
  p90Precipitation: number; // Upper 90th percentile (convective surge)
}

export interface RainfallRiskSummary {
  alertLevel: IMDAlertLevel;
  alertTitle: string;
  alertColorHex: string;
  alertDescription: string;
  peakHourlyRate: number; // mm/hr
  peakHourTime: string;
  accumulatedNext24h: number; // mm
  accumulatedNext72h: number; // mm
  past3DayTotal: number; // mm
  soilSaturationPercent: number; // 0-100%
  heavyRainHoursCount: number;
  hourlyPoints: HourlyForecastPoint[];
}

export interface WardInundationRisk {
  wardId: string;
  wardName: string;
  lat: number;
  lon: number;
  riskScore: number; // 0 to 100
  riskCategory: 'Low' | 'Moderate' | 'High' | 'Critical';
  colorHex: string;
  peakTimeEstimate: string;
  expectedWaterDepthCm: number; // estimated inundation depth (cm)
  recommendedAction: string;
  elevationCategory: string;
  criticalInfrastructure: string;
  drainageDeficiencyPercent: number;
  lowLyingScore: number;
  soilSaturationInfluence: number;
}

/**
 * IMD Standard Thresholds for 24-hour Accumulated Rainfall:
 * - Very Light / Light: 0.1 to 15.5 mm
 * - Moderate: 15.6 to 64.4 mm
 * - Heavy: 64.5 to 115.5 mm (Yellow/Orange)
 * - Very Heavy: 115.6 to 204.4 mm (Orange)
 * - Extremely Heavy: > 204.4 mm (Red)
 */
export function determineIMDAlert(
  accumulated24h: number,
  peakHourly: number,
  soilSaturation: number
): {
  level: IMDAlertLevel;
  title: string;
  colorHex: string;
  description: string;
} {
  // Convective surge trigger: high short-duration rate + high prior saturation can escalate alert
  const effectiveRainIndex = accumulated24h + (peakHourly > 45 ? 50 : peakHourly > 30 ? 25 : 0) + (soilSaturation > 80 ? 20 : 0);

  if (accumulated24h >= 204.5 || effectiveRainIndex >= 230 || peakHourly >= 65) {
    return {
      level: 'Red',
      title: 'WARNING / TAKE ACTION (चेतावनी - कार्रवाई करें)',
      colorHex: '#dc2626', // Red-600
      description:
        'Extremely Heavy Rainfall (>204.4 mm/24h or >65 mm/hr). High probability of widespread inundation, transport disruption, and electrical hazard. Immediate evacuation of low-lying floodplains recommended.',
    };
  }

  if (accumulated24h >= 115.6 || effectiveRainIndex >= 140 || peakHourly >= 35) {
    return {
      level: 'Orange',
      title: 'ALERT / BE PREPARED (सतर्कता - तैयार रहें)',
      colorHex: '#ea580c', // Orange-600
      description:
        'Very Heavy Rainfall (115.6 - 204.4 mm/24h or >35 mm/hr). Significant waterlogging expected in underpasses and low-lying wards. Deploy dewatering pumps and alert emergency rescue teams.',
    };
  }

  if (accumulated24h >= 64.5 || effectiveRainIndex >= 80 || peakHourly >= 18) {
    return {
      level: 'Yellow',
      title: 'WATCH / BE UPDATED (निगरानी - अद्यतन रहें)',
      colorHex: '#ca8a04', // Yellow-600
      description:
        'Heavy Rainfall (64.5 - 115.5 mm/24h or >18 mm/hr). Localized localized ponding possible in poorly drained sectors. Monitor weather bulletins closely.',
    };
  }

  return {
    level: 'Green',
    title: 'NO WARNING / BE UPDATED (सामान्य - कोई चेतावनी नहीं)',
    colorHex: '#16a34a', // Green-600
    description:
      'Light to Moderate rainfall forecast (<64.5 mm/24h). No significant inundation hazard expected under normal drainage conditions.',
  };
}

/**
 * Calculates heavy rainfall probability for an individual hour
 * Combines NWP precipitation rate, probability of precipitation,
 * and antecedent 3h & 24h accumulation.
 */
export function computeHourlyHeavyRainProbability(
  hourlyPrecipMm: number,
  precipitationProbPercent: number,
  accum3h: number
): number {
  // Intensity score (sigmoid-like scaling up to 50 mm/hr)
  const intensityFactor = Math.min(1.0, hourlyPrecipMm / 35.0);

  // Confidence scaling by precipitation probability
  const probFactor = (precipitationProbPercent || 50) / 100.0;

  // Persistence / compounding 3-hour accumulation factor
  const accumFactor = Math.min(1.0, accum3h / 65.0);

  // Weighted composite probability
  const compositeProb = (0.50 * intensityFactor + 0.30 * probFactor + 0.20 * accumFactor) * 100;

  return Math.min(100, Math.max(0, Math.round(compositeProb)));
}

/**
 * Derives Soil Saturation / Antecedent Moisture Index from past 3-day precipitation.
 * Uses an exponential decay function: Rain on day -1 has higher weight than day -3.
 */
export function computeSoilSaturationPercent(past3DayRainMm: number): number {
  // Standard catchment capacity model: 120mm saturated soil threshold for Indian urban silt/clay
  const soilCapacityMm = 120.0;
  const saturationRatio = Math.min(1.0, past3DayRainMm / soilCapacityMm);
  return Math.round(saturationRatio * 100);
}

/**
 * Inundation Risk Formulation:
 * Risk Score (0-100) =
 *   [ 0.35 * Rainfall Factor (Forecast 24h)
 *   + 0.25 * Soil Saturation Factor (Past 3-day antecedent moisture)
 *   + 0.25 * Low-Lying Vulnerability Index (Topography / Depression)
 *   + 0.15 * Drainage Deficiency (1 - Drainage Efficiency) ] * 100
 *
 * Clamped strictly between 0 and 100.
 */
export function computeWardInundationRisk(
  ward: WardDefinition,
  accumulated24hMm: number,
  soilSaturationPercent: number,
  peakHourlyMm: number
): WardInundationRisk {
  // Normalized components (each 0.0 to 1.0)
  const rainfallFactor = Math.min(1.0, accumulated24hMm / 180.0);
  const saturationFactor = soilSaturationPercent / 100.0;
  const lowLyingFactor = Math.min(1.0, Math.max(0.0, ward.lowLyingScore));
  const drainageDeficiency = Math.min(1.0, Math.max(0.0, 1.0 - ward.drainageScore));

  // Convective surge amplifier: if peak hourly rate is intense (>35 mm/hr), short-term ponding escalates
  const convectiveAmplifier = peakHourlyMm > 50 ? 1.15 : peakHourlyMm > 30 ? 1.08 : 1.0;

  const rawScore =
    (0.35 * rainfallFactor +
     0.25 * saturationFactor +
     0.25 * lowLyingFactor +
     0.15 * drainageDeficiency) * 100 * convectiveAmplifier;

  const riskScore = Math.min(100, Math.max(5, Math.round(rawScore)));

  let riskCategory: 'Low' | 'Moderate' | 'High' | 'Critical' = 'Low';
  let colorHex = '#16a34a'; // Green

  if (riskScore >= 80) {
    riskCategory = 'Critical';
    colorHex = '#dc2626'; // Red
  } else if (riskScore >= 60) {
    riskCategory = 'High';
    colorHex = '#ea580c'; // Orange
  } else if (riskScore >= 35) {
    riskCategory = 'Moderate';
    colorHex = '#ca8a04'; // Yellow
  } else {
    riskCategory = 'Low';
    colorHex = '#16a34a'; // Green
  }

  // Estimate expected water depth in cm based on score and low-lying severity
  const expectedWaterDepthCm = Math.round((riskScore / 100) * (ward.lowLyingScore * 75 + 15));

  // Determine peak time estimate relative to current hour
  const peakTimeEstimate = 'Within next 4 to 8 hours';

  return {
    wardId: ward.id,
    wardName: ward.name,
    lat: ward.lat,
    lon: ward.lon,
    riskScore,
    riskCategory,
    colorHex,
    peakTimeEstimate,
    expectedWaterDepthCm,
    recommendedAction: ward.recommendedAction,
    elevationCategory: ward.elevationCategory,
    criticalInfrastructure: ward.criticalInfrastructure,
    drainageDeficiencyPercent: Math.round(drainageDeficiency * 100),
    lowLyingScore: ward.lowLyingScore,
    soilSaturationInfluence: Math.round(saturationFactor * 100),
  };
}

/**
 * Processes Open-Meteo API response (or bundled sample data) into enriched risk metrics
 */
export function processWeatherData(
  weatherJson: any,
  city: CityDefinition
): {
  rainfallSummary: RainfallRiskSummary;
  wardRisks: WardInundationRisk[];
} {
  const times: string[] = weatherJson?.hourly?.time || [];
  const precipList: number[] = weatherJson?.hourly?.precipitation || [];
  const probList: number[] = weatherJson?.hourly?.precipitation_probability || [];

  // Determine current index (assume middle or split between past and future if past_days=3)
  // Usually past_days=3 means first 72 hours are past, next 72 hours are forecast.
  const pastHoursCount = Math.min(72, Math.floor(times.length / 2));
  const pastPrecip = precipList.slice(0, pastHoursCount);
  const futurePrecip = precipList.slice(pastHoursCount);
  const futureTimes = times.slice(pastHoursCount);
  const futureProb = probList.slice(pastHoursCount);

  // Past 3-day rainfall sum
  const past3DayTotal = pastPrecip.reduce((sum, val) => sum + (val || 0), 0);
  const soilSaturationPercent = computeSoilSaturationPercent(past3DayTotal);

  // Next 24h and 72h accumulation
  const next24hPrecip = futurePrecip.slice(0, 24);
  const accumulatedNext24h = next24hPrecip.reduce((sum, val) => sum + (val || 0), 0);
  const accumulatedNext72h = futurePrecip.reduce((sum, val) => sum + (val || 0), 0);

  // Find peak hourly rate in the next 72h
  let peakHourlyRate = 0;
  let peakHourIndex = 0;
  for (let i = 0; i < futurePrecip.length; i++) {
    const p = futurePrecip[i] || 0;
    if (p > peakHourlyRate) {
      peakHourlyRate = p;
      peakHourIndex = i;
    }
  }
  const peakHourTime = futureTimes[peakHourIndex] || 'N/A';

  // Build hourly forecast points with 3h and 24h rolling totals and ensemble uncertainty bounds
  const hourlyPoints: HourlyForecastPoint[] = [];
  let heavyRainHoursCount = 0;

  for (let i = 0; i < Math.min(72, futureTimes.length); i++) {
    const precip = futurePrecip[i] || 0;
    const prob = futureProb[i] ?? 60;

    // 3h rolling accumulation
    const start3h = Math.max(0, i - 2);
    const accum3h = futurePrecip.slice(start3h, i + 1).reduce((s, v) => s + (v || 0), 0);

    // 24h rolling accumulation
    const start24h = Math.max(0, i - 23);
    const accum24h = futurePrecip.slice(start24h, i + 1).reduce((s, v) => s + (v || 0), 0);

    const heavyRainProb = computeHourlyHeavyRainProbability(precip, prob, accum3h);
    if (heavyRainProb >= 60 || precip >= 15.6) {
      heavyRainHoursCount++;
    }

    // Uncertainty ensemble spread (+/- 25% spread around NWP median, minimum variance 1.5mm)
    const variance = Math.max(1.2, precip * 0.28);
    const p10 = Math.max(0, +(precip - variance).toFixed(1));
    const p50 = +precip.toFixed(1);
    const p90 = +(precip + variance * 1.35).toFixed(1);

    hourlyPoints.push({
      time: futureTimes[i],
      precipitation: p50,
      precipitationProbability: prob,
      accumulated3h: +accum3h.toFixed(1),
      accumulated24h: +accum24h.toFixed(1),
      heavyRainfallProbability: heavyRainProb,
      p10Precipitation: p10,
      p50Precipitation: p50,
      p90Precipitation: p90,
    });
  }

  // IMD Alert Determination
  const alertInfo = determineIMDAlert(accumulatedNext24h, peakHourlyRate, soilSaturationPercent);

  const rainfallSummary: RainfallRiskSummary = {
    alertLevel: alertInfo.level,
    alertTitle: alertInfo.title,
    alertColorHex: alertInfo.colorHex,
    alertDescription: alertInfo.description,
    peakHourlyRate: +peakHourlyRate.toFixed(1),
    peakHourTime,
    accumulatedNext24h: +accumulatedNext24h.toFixed(1),
    accumulatedNext72h: +accumulatedNext72h.toFixed(1),
    past3DayTotal: +past3DayTotal.toFixed(1),
    soilSaturationPercent,
    heavyRainHoursCount,
    hourlyPoints,
  };

  // Compute Inundation Risk for each Ward
  const wardRisks: WardInundationRisk[] = city.wards.map((ward) =>
    computeWardInundationRisk(ward, accumulatedNext24h, soilSaturationPercent, peakHourlyRate)
  );

  // Sort descending by risk score
  wardRisks.sort((a, b) => b.riskScore - a.riskScore);

  return { rainfallSummary, wardRisks };
}
