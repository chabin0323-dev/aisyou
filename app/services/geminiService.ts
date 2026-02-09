import { GoogleGenAI, Type } from "@google/genai";
import type { FortuneResult } from '../types';

// Vercel + Vite 用（重要）
const apiKey = import.meta.env.VITE_API_KEY as string | undefined;

if (!apiKey) {
  throw new Error("VITE_API_KEY is not set");
}

const ai = new GoogleGenAI({ apiKey });

const divinationDetailSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    content: { type: Type.STRING },
  },
  required: ["title", "content"],
};

const fiveElementsSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    content: { type: Type.STRING },
  },
  required: ["title", "content"],
};

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.INTEGER },
    title: { type: Type.STRING },
    reading: { type: Type.STRING },
    advice: { type: Type.STRING },
    luckyNumber: { type: Type.STRING },
    luckyColor: { type: Type.STRING },
    luckyItem: { type: Type.STRING },
    generalFortune: { ...divinationDetailSchema },
    nameCompatibility: { ...divinationDetailSchema },
    constellationCompatibility: { ...divinationDetailSchema },
    bloodTypeCompatibility: { ...divinationDetailSchema },
    fiveElementsCompatibility: { ...fiveElementsSchema },
    destinyAnalysis: { ...divinationDetailSchema },
  },
  required: [
    "score",
    "title",
    "reading",
    "advice",
    "luckyNumber",
    "luckyColor",
    "luckyItem",
    "generalFortune",
    "nameCompatibility",
    "constellationCompatibility",
    "bloodTypeCompatibility",
    "fiveElementsCompatibility",
    "destinyAnalysis"
  ],
};

export const getCompatibilityFortune = async (
  name1: string | null,
  name2: string | null,
  bloodType1: string | null,
  constellation1: string | null,
  eto1: string | null,
  dob1: string | null,
  bloodType2: string | null,
  constellation2: string | null,
  dob2: string | null,
  relationship: string,
  divinationDate: 'today' | 'tomorrow'
): Promise<FortuneResult> => {

  const prompt = `
  相性占いを作成してください。

  あなた:
  名前: ${name1}
  血液型: ${bloodType1}
  星座: ${constellation1}
  干支: ${eto1}
  生年月日: ${dob1}

  相手:
  名前: ${name2}
  血液型: ${bloodType2}
  星座: ${constellation2}
  生年月日: ${dob2}

  関係: ${relationship}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema,
      temperature: 0,
    },
  });

  return JSON.parse(response.text) as FortuneResult;
};
