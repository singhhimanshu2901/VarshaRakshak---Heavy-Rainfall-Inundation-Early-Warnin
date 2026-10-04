import sampleData from '../data/sampleForecast.json';

export interface WeatherFetchResult {
  data: any;
  source: 'live' | 'sample_fallback';
  latencyMs: number;
  lastUpdated: string;
  error?: string;
}

export async function fetchCityWeatherData(
  cityId: string,
  lat: number,
  lon: number
): Promise<WeatherFetchResult> {
  const startTime = Date.now();
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation,precipitation_probability&past_days=3&forecast_days=3&timezone=auto`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);

    const response = await fetch(url, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Open-Meteo HTTP error status: ${response.status}`);
    }

    const json = await response.json();
    if (!json?.hourly?.precipitation) {
      throw new Error('Malformed hourly precipitation data received');
    }

    return {
      data: json,
      source: 'live',
      latencyMs: Date.now() - startTime,
      lastUpdated: new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };
  } catch (err: any) {
    console.warn(`Weather fetch failed for ${cityId}, engaging bundled fallback:`, err.message);

    // Fallback to high-fidelity bundled sample data
    const fallbackCityData = (sampleData as Record<string, any>)[cityId] || sampleData['mumbai'];

    return {
      data: fallbackCityData,
      source: 'sample_fallback',
      latencyMs: Date.now() - startTime,
      lastUpdated: new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      error: err.name === 'AbortError' ? 'Network timeout (>6.5s)' : (err.message || 'API Unreachable'),
    };
  }
}
