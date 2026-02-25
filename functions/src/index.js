/**
 * PecuariaClip Pro — Cloud Functions
 *
 * Entry point for all Firebase Cloud Functions.
 *  - geminiProxy: secure proxy for Gemini API calls (keeps API key server-side)
 *  - triggerRender: starts a Cloud Run Job for video rendering
 *  - getRenderStatus: returns current render job status
 *  - onRenderComplete: Firestore trigger when render finishes
 */

export { geminiProxy } from './gemini-proxy.js';
export { triggerRender } from './render-trigger.js';
export { getRenderStatus } from './render-status.js';
