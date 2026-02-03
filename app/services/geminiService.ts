import { GoogleGenerativeAI } from "@google/generative-ai";
import { FortuneResult } from "../types"; // ここが ../types であることを確認

export async function getCompatibilityFortune(
  name1: string, name2: string, 
  bloodType: string, constellation: string, eto: string, dob: string,
  bt2: any, c2: any, e2: any,
  relationship: string, dateType: string
): Promise<FortuneResult> {
  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `${name1}（${constellation}、${bloodType}型、${eto}、生年月日:${dob}）と${name2}の、${dateType}の相性と運勢を、${relationship}という関係性を踏まえて占ってください。結果は必ず以下のJSON形式で返してください。
  {"score": 相性0-100の数値, "summary": "一言要約", "advice": "詳細な鑑定内容とアドバイス"}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  const jsonMatch = text.match(/\{.*\}/s);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  throw new Error("鑑定結果の解析に失敗しました。");
}
