import { GoogleGenAI } from '@google/genai';

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
  const tags = Array.isArray(raw.tags)
    ? Array.from(
        new Set(
          raw.tags
            .map((t) => (typeof t === 'string' ? t.replace(/^#+/, '').trim().toLowerCase() : ''))
            .filter(Boolean)
        )
      ).slice(0, 5)
    : [];

  const summary = typeof raw.summary === 'string' ? raw.summary.trim() : '';
  return { tags, summary };
}

export async function generateMeta({ title, language, content }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { tags: language ? [language.toLowerCase()] : [], summary: '' };
  }

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

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const res = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
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
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  return {
    tags: language ? [language.toLowerCase()] : [],
    summary: ''
  };
}
