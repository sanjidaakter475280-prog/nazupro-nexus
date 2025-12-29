
import { GoogleGenAI, Type } from "@google/genai";
import { BotStatus, TradingSignal, MarketInsight } from "../types";

// Initialize lazily to avoid crash if key is missing during bundle load
let genAI: GoogleGenAI | null = null;
const getAI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("Nexus Intelligence: VITE_GEMINI_API_KEY is not defined in environment.");
    return null;
  }
  if (!genAI) genAI = new GoogleGenAI({ apiKey });
  return genAI;
};

export const getMarketInsights = async (
  bots: BotStatus[],
  signals: TradingSignal[]
): Promise<MarketInsight> => {
  const prompt = `
    Act as Nazupro Nexus Intelligence. Analyze the current state of 3 AI trading bots:
    ${bots.map(b => `- ${b.name}: ${b.status}, PnL: ${b.pnl}%, Accuracy: ${b.accuracy}%`).join('\n')}
    
    Recent Signals:
    ${signals.slice(0, 5).map(s => `- ${s.botId} ${s.type} ${s.pair} at ${s.price}`).join('\n')}
    
    Provide a concise market insight report.
  `;

  try {
    const ai = getAI();
    if (!ai) return {
      summary: "AI Engine offline. Please check your VITE_GEMINI_API_KEY.",
      prediction: "Neutral",
      recommendations: ["Configure API Key"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            prediction: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["summary", "prediction", "recommendations"]
        }
      }
    });

    // Fixed: Accessed text as a property and added safety check for JSON.parse
    const jsonStr = response.text?.trim() || "{}";
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return {
      summary: "Nexus intelligence synchronization failed. Monitoring raw data feeds.",
      prediction: "Neutral trend detected based on algorithmic fallback.",
      recommendations: ["Ensure stable connectivity", "Review bot risk parameters manually"]
    };
  }
};
