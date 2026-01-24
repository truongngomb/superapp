/**
 * AI Generation Service
 * 
 * Logic to inspect content and generate scenes using Google Generative AI (Gemini).
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { ServiceUnavailableError } from '../middleware/index.js';

interface GeneratedScene {
  script_text: string;
  visual_prompt: string;
  duration?: number;
}

export class AiGenerateService {
  private genAI?: GoogleGenerativeAI;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private model?: any;

  constructor() {
    if (!config.ai.geminiApiKey) {
      logger.warn('AI', 'GEMINI_API_KEY is not set. AI features will be disabled.');
    } else {
        this.genAI = new GoogleGenerativeAI(config.ai.geminiApiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }
  }

  /**
   * Check if AI service is available
   */
  isAvailable(): boolean {
    return !!this.model;
  }

  /**
   * Generate video script and scenes from a topic or description
   */
  async generateScript(topic: string): Promise<GeneratedScene[]> {
    if (!this.isAvailable()) {
      throw new ServiceUnavailableError('AI Service is not configured');
    }

    const prompt = `
      You are an expert video script writer and visual director.
      Create a compelling short video script about: "${topic}".
      
      Output ONLY valid JSON array where each object represents a scene with:
      - "script_text": The voiceover or dialogue text (keep it concise).
      - "visual_prompt": A detailed description for an AI image generator to create the background visual.
      - "duration": Estimated duration in seconds (number).

      Example format:
      [
        { "script_text": "...", "visual_prompt": "...", "duration": 5 }
      ]
    `;

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const result = await this.model.generateContent(prompt);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const response = await result.response;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const text = response.text();
      
      // Basic cleanup to ensure JSON
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      return JSON.parse(jsonStr as string) as GeneratedScene[];
    } catch (error) {
      logger.error('AI', 'Failed to generate script', { error });
      throw new Error('Failed to generate script from AI');
    }
  }
}

export const aiGenerateService = new AiGenerateService();
