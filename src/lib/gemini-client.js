import { getSceneAnalysisPrompt, getCutRecommendationPrompt } from './prompts/scene-analysis';
import { TIMELINE_SECTIONS } from '../constants/timeline-sections';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Get the Gemini API key from environment.
 * In production, this should go through a Cloud Function proxy.
 * For development, we use the key directly from env.
 */
function getApiKey() {
  return import.meta.env.VITE_GEMINI_API_KEY;
}

/**
 * Convert a frame dataUrl (JPEG) to base64 for the Gemini API.
 */
function dataUrlToBase64(dataUrl) {
  return dataUrl.replace(/^data:image\/\w+;base64,/, '');
}

/**
 * Call the Gemini API with images and a text prompt.
 */
async function callGemini(prompt, frameDataUrls) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY não configurada. Adicione no arquivo .env.local');
  }

  const parts = [
    { text: prompt },
    ...frameDataUrls.map(url => ({
      inlineData: {
        mimeType: 'image/jpeg',
        data: dataUrlToBase64(url),
      },
    })),
  ];

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('Gemini não retornou resposta válida.');
  }

  try {
    return JSON.parse(text);
  } catch {
    // Try to extract JSON from the response text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Gemini retornou JSON inválido.');
  }
}

/**
 * Analyze a single clip's frames using Gemini.
 * @param {string} sectionId - Section of the storyboard
 * @param {string[]} frameDataUrls - Array of JPEG data URLs (best frames from client analysis)
 */
export async function analyzeClipWithGemini(sectionId, frameDataUrls) {
  const section = TIMELINE_SECTIONS.find(s => s.id === sectionId);
  const prompt = getSceneAnalysisPrompt(sectionId, section?.desc || '');
  return callGemini(prompt, frameDataUrls);
}

/**
 * Get edit recommendations for a section based on analyzed clips.
 * @param {string} sectionId
 * @param {Array} clipAnalyses - Array of { clipIndex, analysis } from analyzeClipWithGemini
 */
export async function getEditRecommendation(sectionId, clipAnalyses) {
  const section = TIMELINE_SECTIONS.find(s => s.id === sectionId);

  const clipsSummary = clipAnalyses.map((ca, i) =>
    `Clip ${i}: Rating=${ca.analysis.clip.clip_rating}/100, In=${ca.analysis.clip.recommended_in_frame}, Out=${ca.analysis.clip.recommended_out_frame}, Notes="${ca.analysis.clip.notes}"`
  ).join('\n');

  const prompt = getCutRecommendationPrompt(
    sectionId,
    section?.desc || '',
    section?.duration || '5-10s',
    clipsSummary
  );

  // No images needed for the edit recommendation — text-only prompt
  return callGemini(prompt, []);
}

/**
 * Check if Gemini API key is configured.
 */
export function isGeminiConfigured() {
  return !!import.meta.env.VITE_GEMINI_API_KEY;
}
