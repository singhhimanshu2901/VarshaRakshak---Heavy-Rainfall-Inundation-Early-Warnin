import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

// Initialize Gemini client server-side
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API endpoint for generating disaster management advisory
app.post('/api/advisory', async (req: Request, res: Response) => {
  try {
    const {
      cityName,
      alertLevel,
      peakHourlyRain,
      accumulated24h,
      highRiskWards,
      language = 'en',
    } = req.body;

    if (!ai) {
      // Fallback deterministic template if Gemini API key is not yet set
      const advisory = language === 'hi'
        ? `[सिमुलेटेड MoES/IMD बुलेटिन] ${cityName} के लिए ${alertLevel} चेतावनी जारी की गई है। अगले 24 घंटों में ${accumulated24h} मिमी वर्षा और ${peakHourlyRain} मिमी/घंटा की तीव्र वर्षा संभावित है। उच्च जोखिम वाले वार्ड: ${highRiskWards.join(', ')}। तत्काल एनडीआरएफ (NDRF) और जल निकासी टीमों को संवेदनशील क्षेत्रों में तैनात करें तथा निचले इलाकों को खाली करने के निर्देश दें।`
        : `[OFFICIAL IMD/MoES ADVISORY] ${alertLevel.toUpperCase()} Alert issued for ${cityName}. Projected 24h accumulation is ${accumulated24h} mm with peak intensity of ${peakHourlyRain} mm/hr. Priority evacuation and dewatering deployed for vulnerable wards: ${highRiskWards.join(', ')}. DDMA emergency control room activated.`;

      return res.json({ advisory, source: 'fallback' });
    }

    const prompt = `
You are the Chief Disaster Response & Early Warning Coordinator for India Meteorological Department (IMD) and Ministry of Earth Sciences (MoES) for Smart India Hackathon 2026 Problem Statement 26071.
Generate an urgent, highly authoritative, actionable official heavy rainfall and inundation early warning advisory for district authorities.

Details:
- City: ${cityName}
- IMD Alert Level: ${alertLevel}
- Forecast 24h Rainfall: ${accumulated24h} mm
- Peak Rainfall Intensity: ${peakHourlyRain} mm/hr
- Most Vulnerable Wards/Zones: ${highRiskWards.join(', ')}
- Output Language: ${language === 'hi' ? 'Hindi (हिन्दी)' : 'English'}

Format the advisory in 3 crisp sections:
1. SITUATION SUMMARY: State the alert level and rainfall intensity clearly.
2. PRIORITY WARDS & EVACUATION DIRECTIVES: Explicitly list the top vulnerable wards and evacuation/dewatering actions.
3. INTER-AGENCY ACTION PROTOCOLS: Directives for NDRF/SDRF, Municipal pumps, traffic diversions, and school/office advisories.

Keep the total length between 120 and 180 words. Tone must be decisive, official, and emergency-ready.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const advisoryText = response.text || 'Advisory could not be generated at this time.';
    res.json({ advisory: advisoryText, source: 'gemini' });
  } catch (error: any) {
    console.error('Error generating advisory with Gemini:', error);
    res.status(500).json({
      error: 'Failed to generate advisory',
      details: error?.message || 'Unknown error',
    });
  }
});

// Configure Vite integration for dev vs prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VarshaRakshak server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
