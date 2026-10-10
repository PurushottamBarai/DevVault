import Groq from 'groq-sdk';
import { GoogleGenAI } from '@google/genai';
import { normalizeTags } from '../utils/tag.util.js';

function cleanJson(text) {
  if (!text) return '{}';
  const trimmed = text.trim();
  if (trimmed.startsWith('```json')) {
    return trimmed.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  }
  if (trimmed.startsWith('```')) {
    return trimmed.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return trimmed;
}

function normalizeResult(raw) {
  const tags = normalizeTags(raw.tags).slice(0, 5);
  const summary = typeof raw.summary === 'string' ? raw.summary.trim() : '';
  return { tags, summary };
}

export async function generateMeta({ title, language, content }) {
  const prompt = `You are a professional ${language} software developer.
Analyze the following code snippet and title. You need to generate a 12 to 20 words summary sentence for "${title}" and the code.
If there are any spelling mistakes or typos in the title, understand and correct them automatically.
Generate 3 to 5 relevant lowercase tags without '#'.

Return ONLY valid JSON matching this schema:
{"tags": ["tag1", "tag2", "tag3"], "summary": "12 to 20 words summary sentence"}

Title: ${title}
Language: ${language}
Code:
${(content || '').slice(0, 6000)}`;

  // 1. Try Groq (Ultra-fast: ~0.2 - 0.8s)
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      const groq = new Groq({ apiKey: groqKey });
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'qwen/qwen3.8-27b',
        response_format: { type: 'json_object' }
      });
      const text = completion.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(cleanJson(text));
      const normalized = normalizeResult(parsed);
      if (normalized.tags.length > 0 || normalized.summary) {
        return normalized;
      }
    } catch (groqErr) {
      console.warn('Groq generation fallback:', groqErr.message);
    }
  }

  // 2. Fallback to Gemini
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const res = await ai.models.generateContent({
          model: 'gemini-3.5-flash-lite',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const text = typeof res?.text === 'function' ? res.text() : res?.text || '';
        const parsed = JSON.parse(cleanJson(text));
        const normalized = normalizeResult(parsed);

        if (normalized.tags.length > 0 || normalized.summary) {
          return normalized;
        }
      } catch {
        if (attempt < 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    }
  }

  return {
    tags: language ? [language.toLowerCase()] : [],
    summary: ''
  };
}
