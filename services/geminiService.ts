import { GoogleGenAI, Type } from "@google/genai";
import { FraudCase, RiskLevel, ScanResult, QuizQuestion } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SCAN_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    riskLevel: { 
      type: Type.STRING, 
      enum: [RiskLevel.SAFE, RiskLevel.WARNING, RiskLevel.DANGER, RiskLevel.UNKNOWN] 
    },
    content: { type: Type.STRING, description: "The decoded text or URL found in the QR code" },
    summary: { type: Type.STRING, description: "A short bold title for the result (e.g. 'Safe Official Website' or 'Suspected Phishing Site')" },
    reasoning: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of reasons for the risk assessment."
    },
    safetyTips: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Actionable advice for the user based on this specific scan."
    }
  },
  required: ["riskLevel", "content", "summary", "reasoning", "safetyTips"]
};

/**
 * Analyzes a QR Code image for potential security risks.
 */
export const analyzeQRCodeImage = async (base64Image: string): Promise<ScanResult> => {
  // Use gemini-2.5-flash for multimodal analysis with JSON output support.
  // gemini-2.5-flash-image is primarily for image generation and does not support responseSchema.
  const model = "gemini-2.5-flash";
  
  const prompt = `
    You are a cybersecurity expert specializing in QR code fraud and phishing detection.
    
    1. Identify the content of the QR code in this image (URL, text, etc.).
    2. Analyze the content for security risks. Look for:
       - Phishing patterns (typosquatting, strange TLDs).
       - Direct APK downloads.
       - Payment schemes disguised as utility apps.
       - Malicious redirects.
    3. Return a JSON object with the risk assessment.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: SCAN_SCHEMA
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ScanResult;
    }
    throw new Error("Empty response from AI");

  } catch (error) {
    console.error("Analysis failed:", error);
    return {
      riskLevel: RiskLevel.UNKNOWN,
      content: "Error reading code",
      summary: "Analysis Failed",
      reasoning: ["Could not process the image. Please ensure the QR code is clear."],
      safetyTips: ["Try scanning again with better lighting."]
    };
  }
};

/**
 * Analyzes a raw text string (URL or text) for security risks.
 * Used for Manual Input and Test Lab Simulation.
 */
export const analyzeString = async (text: string): Promise<ScanResult> => {
  const model = "gemini-2.5-flash";
  const prompt = `
    You are a cybersecurity expert. The user has provided the following text/URL for security analysis (it may have been decoded from a QR code or pasted manually).
    
    Content to analyze: "${text}"
    
    1. Check for phishing indicators, malicious domains, dangerous file extensions (apk, exe), or scam language.
    2. Determine if it is a security risk (Phishing, Malware, Scam) or Safe.
    3. Return a JSON object following the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: SCAN_SCHEMA
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ScanResult;
    }
    throw new Error("Empty response");
  } catch (error) {
    return {
      riskLevel: RiskLevel.UNKNOWN,
      content: text,
      summary: "Analysis Error",
      reasoning: ["AI could not process the request."],
      safetyTips: ["Check internet connection and try again."]
    };
  }
};

/**
 * Generates educational content about QR fraud.
 */
export const fetchFraudCases = async (): Promise<FraudCase[]> => {
  const model = "gemini-2.5-flash";
  const prompt = `
    Generate 5 distinct, realistic examples of recent QR code fraud cases (Quishing).
    Include varied scenarios like Parking Meters, Fake Citations, Crypto Airdrops, and Login Hijacking.
    Return JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              lossAmount: { type: Type.STRING },
              technique: { type: Type.STRING },
              prevention: { type: Type.STRING }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as FraudCase[];
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch cases:", error);
    return [];
  }
};

/**
 * Generates a quiz question to verify user knowledge.
 */
export const fetchQuizQuestion = async (): Promise<QuizQuestion | null> => {
  const model = "gemini-2.5-flash";
  const prompt = `
    Generate a single multiple-choice question to test a user's ability to spot a QR code scam.
    The question should describe a scenario (e.g., finding a sticker on a parking meter).
    Provide 3 options.
    Return JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctIndex: { type: Type.INTEGER, description: "0-based index of the correct answer" },
            explanation: { type: Type.STRING }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as QuizQuestion;
    }
    return null;
  } catch (error) {
    console.error("Quiz gen failed", error);
    return null;
  }
}