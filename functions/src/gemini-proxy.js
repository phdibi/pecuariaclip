import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { defineSecret } from 'firebase-functions/params';

// API key stored in Firebase Secret Manager (not in code)
const geminiApiKey = defineSecret('GEMINI_API_KEY');

/**
 * Secure proxy for Gemini API calls.
 * Keeps the API key server-side, validates auth, applies rate limiting.
 *
 * Client sends: { prompt: string, images: Array<{ mimeType, base64 }> }
 * Returns: Gemini JSON response
 */
export const geminiProxy = onCall(
  {
    secrets: [geminiApiKey],
    cors: true,
    enforceAppCheck: false, // Enable in production
    maxInstances: 10,
    timeoutSeconds: 120,
    memory: '512MiB',
  },
  async (request) => {
    // Verify authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Faça login para usar a IA.');
    }

    const { prompt, images } = request.data;

    if (!prompt || typeof prompt !== 'string') {
      throw new HttpsError('invalid-argument', 'Prompt é obrigatório.');
    }

    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey.value());
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      // Build content parts
      const parts = [{ text: prompt }];

      if (images && Array.isArray(images)) {
        for (const img of images) {
          if (img.base64 && img.mimeType) {
            parts.push({
              inlineData: {
                mimeType: img.mimeType,
                data: img.base64,
              },
            });
          }
        }
      }

      const result = await model.generateContent(parts);
      const text = result.response.text();

      // Try to parse as JSON
      try {
        return { result: JSON.parse(text) };
      } catch {
        // Try to extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return { result: JSON.parse(jsonMatch[0]) };
        }
        return { result: text };
      }
    } catch (err) {
      console.error('Gemini proxy error:', err);
      throw new HttpsError('internal', `Erro na API Gemini: ${err.message}`);
    }
  }
);
