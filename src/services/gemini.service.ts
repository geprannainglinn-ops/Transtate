import { Injectable } from '@angular/core';
import { GoogleGenAI, Type, SchemaType } from "@google/genai";

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env['API_KEY'] });
  }

  async processAudio(base64Audio: string, mimeType: string): Promise<{ transcription: string, english: string, chinese: string }> {
    const model = 'gemini-2.5-flash';

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        transcription: {
          type: Type.STRING,
          description: "The verbatim transcription of the Burmese speech.",
        },
        english: {
          type: Type.STRING,
          description: "The English translation of the speech.",
        },
        chinese: {
          type: Type.STRING,
          description: "The Simplified Chinese translation of the speech.",
        },
      },
      required: ["transcription", "english", "chinese"],
    };

    try {
      const response = await this.ai.models.generateContent({
        model: model,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Audio
              }
            },
            {
              text: "Transcribe the audio which is spoken in Burmese. Then provide the English and Chinese (Simplified) translations."
            }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        }
      });

      if (response.text) {
        return JSON.parse(response.text);
      } else {
        throw new Error("No response text generated.");
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }
}