/**
 * PecuariaClip Pro — Overlay Renderer
 *
 * Renders React overlay components as transparent PNG images using Puppeteer.
 * These PNGs are then composited onto the video by FFmpeg.
 *
 * Each overlay type (intro, datacard, deps, genealogy, cta) is rendered
 * at the target resolution with a transparent background.
 *
 * In the Cloud Run container, Chromium is installed via the Dockerfile.
 */

import { promises as fs } from 'fs';
import path from 'path';

/**
 * Render all needed overlays as PNG files.
 *
 * @param {object} overlaySettings - { burnOverlays: bool, perSection: { sectionId: bool } }
 * @param {object} animalData - Animal data for overlay content
 * @param {Array} timeline - Timeline sections
 * @param {object} resolution - { width, height }
 * @param {string} workDir - Working directory
 * @returns {Map<string, string>} sectionId -> PNG file path
 */
export async function renderOverlays(overlaySettings, animalData, timeline, resolution, workDir) {
  if (!overlaySettings?.burnOverlays) {
    return new Map();
  }

  const overlayDir = path.join(workDir, 'overlays');
  await fs.mkdir(overlayDir, { recursive: true });

  const { width, height } = resolution;
  const overlayPaths = new Map();

  // Map of section -> overlay type
  const OVERLAY_MAP = {
    intro: 'intro',
    hero: 'datacard',
    angles: 'datacard',
    closeup: 'datacard',
    data: 'deps',
    genealogy: 'genealogy',
    progeny: 'datacard',
    cta: 'cta',
  };

  // Determine which overlays are needed
  const neededOverlays = new Map(); // overlayType -> sectionIds[]
  for (const track of timeline) {
    if (track.clips.length === 0) continue;
    if (!overlaySettings.perSection?.[track.sectionId]) continue;

    const overlayType = OVERLAY_MAP[track.sectionId];
    if (!overlayType) continue;

    if (!neededOverlays.has(overlayType)) {
      neededOverlays.set(overlayType, []);
    }
    neededOverlays.get(overlayType).push(track.sectionId);
  }

  if (neededOverlays.size === 0) {
    return overlayPaths;
  }

  console.log(`Rendering ${neededOverlays.size} overlay types...`);

  let browser;
  try {
    // Dynamic import puppeteer (only available in the rendering container)
    const puppeteer = await import('puppeteer');
    browser = await puppeteer.default.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--hide-scrollbars',
        '--disable-extensions',
      ],
    });

    // Reuse a single page for all overlays (avoids creating new browser per type)
    const page = await browser.newPage();
    await page.setViewport({ width, height });

    for (const [overlayType, sectionIds] of neededOverlays) {
      const pngPath = path.join(overlayDir, `overlay_${overlayType}.png`);

      try {
        const html = generateOverlayHtml(overlayType, animalData, width, height);
        await page.setContent(html, { waitUntil: 'networkidle0' });

        // Wait for fonts to load with a timeout
        await Promise.race([
          page.evaluate(() => document.fonts.ready),
          new Promise(resolve => setTimeout(resolve, 5000)),
        ]);

        // Take screenshot with transparent background
        await page.screenshot({
          path: pngPath,
          omitBackground: true, // Transparent background
          type: 'png',
        });

        // Verify file was created
        await fs.access(pngPath);

        // Map all sections that use this overlay to the same PNG
        for (const sectionId of sectionIds) {
          overlayPaths.set(sectionId, pngPath);
        }

        console.log(`Rendered overlay: ${overlayType} -> ${pngPath}`);
      } catch (err) {
        console.error(`Failed to render overlay ${overlayType}:`, err.message);
      }
    }

    await browser.close();
  } catch (err) {
    console.error('Puppeteer rendering failed:', err.message);
    console.log('Falling back to SVG-based overlay rendering...');

    if (browser) {
      try { await browser.close(); } catch { /* ignore */ }
    }

    // Fallback: Generate simple SVG overlays converted to PNG
    for (const [overlayType, sectionIds] of neededOverlays) {
      const pngPath = path.join(overlayDir, `overlay_${overlayType}.png`);
      try {
        await renderSvgOverlay(overlayType, animalData, width, height, pngPath);
        for (const sectionId of sectionIds) {
          overlayPaths.set(sectionId, pngPath);
        }
      } catch (fallbackErr) {
        console.error(`SVG fallback also failed for ${overlayType}:`, fallbackErr.message);
      }
    }
  }

  return overlayPaths;
}

/**
 * Generate full HTML page for a given overlay type.
 * Includes Google Fonts, the overlay styles, and renders at target resolution.
 */
function generateOverlayHtml(overlayType, data, width, height) {
  const d = data || {};
  const fontLinks = `
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Bebas+Neue&family=DM+Sans:wght@400;600&display=swap" rel="stylesheet">
  `;

  const baseStyles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: ${width}px;
      height: ${height}px;
      overflow: hidden;
      background: transparent;
      font-family: 'DM Sans', sans-serif;
    }
    .overlay {
      position: absolute;
      width: 100%;
      height: 100%;
    }
  `;

  let overlayContent = '';

  switch (overlayType) {
    case 'intro':
      overlayContent = `
        <div class="overlay" style="
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          background: radial-gradient(ellipse at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.95) 100%);
        ">
          <div style="
            font-family: 'Playfair Display', serif;
            font-size: ${Math.round(width * 0.05)}px;
            color: #B8860B;
            text-align: center;
            letter-spacing: 6px;
            text-shadow: 0 2px 20px rgba(184,134,11,0.4);
          ">${escapeHtml(d.farmName || d.fazenda || 'FAZENDA')}</div>
          <div style="
            font-family: 'Bebas Neue', sans-serif;
            font-size: ${Math.round(width * 0.035)}px;
            color: rgba(255,255,255,0.6);
            letter-spacing: 8px;
            margin-top: ${Math.round(height * 0.02)}px;
          ">APRESENTA</div>
          <div style="
            width: ${Math.round(width * 0.15)}px;
            height: 2px;
            background: linear-gradient(90deg, transparent, #B8860B, transparent);
            margin: ${Math.round(height * 0.03)}px 0;
          "></div>
          <div style="
            font-family: 'Playfair Display', serif;
            font-size: ${Math.round(width * 0.06)}px;
            color: #fff;
            text-align: center;
            letter-spacing: 4px;
          ">${escapeHtml(d.name || d.nome || 'ANIMAL')}</div>
        </div>
      `;
      break;

    case 'datacard':
      overlayContent = `
        <div class="overlay" style="display: flex; align-items: flex-end;">
          <div style="
            width: 100%;
            padding: ${Math.round(height * 0.03)}px ${Math.round(width * 0.04)}px;
            background: linear-gradient(transparent, rgba(0,0,0,0.85));
          ">
            <div style="
              font-family: 'Playfair Display', serif;
              font-size: ${Math.round(width * 0.028)}px;
              color: #B8860B;
              letter-spacing: 3px;
              margin-bottom: ${Math.round(height * 0.008)}px;
            ">${escapeHtml(d.name || d.nome || '')}</div>
            <div style="
              display: flex; gap: ${Math.round(width * 0.03)}px;
              font-family: 'DM Sans', sans-serif;
              font-size: ${Math.round(width * 0.013)}px;
              color: rgba(255,255,255,0.8);
            ">
              ${d.breed || d.raca ? `<span><strong>Raça:</strong> ${escapeHtml(d.breed || d.raca)}</span>` : ''}
              ${d.rgd ? `<span><strong>RGD:</strong> ${escapeHtml(d.rgd)}</span>` : ''}
              ${d.weight || d.peso ? `<span><strong>Peso:</strong> ${escapeHtml(String(d.weight || d.peso))}kg</span>` : ''}
              ${d.ce ? `<span><strong>CE:</strong> ${escapeHtml(String(d.ce))}cm</span>` : ''}
            </div>
          </div>
        </div>
      `;
      break;

    case 'deps':
      const deps = d.deps || d.dEPs || {};
      const depItems = Object.entries(deps).slice(0, 6);
      overlayContent = `
        <div class="overlay" style="display: flex; align-items: center; justify-content: flex-end;">
          <div style="
            width: ${Math.round(width * 0.35)}px;
            padding: ${Math.round(height * 0.03)}px;
            background: rgba(0,0,0,0.85);
            border-left: 3px solid #B8860B;
            margin-right: ${Math.round(width * 0.03)}px;
          ">
            <div style="
              font-family: 'Bebas Neue', sans-serif;
              font-size: ${Math.round(width * 0.02)}px;
              color: #B8860B;
              letter-spacing: 4px;
              margin-bottom: ${Math.round(height * 0.015)}px;
            ">DEPs — AVALIAÇÃO GENÉTICA</div>
            ${depItems.map(([key, val]) => `
              <div style="
                display: flex; align-items: center; justify-content: space-between;
                padding: ${Math.round(height * 0.006)}px 0;
                border-bottom: 1px solid rgba(255,255,255,0.1);
              ">
                <span style="
                  font-family: 'DM Sans', sans-serif;
                  font-size: ${Math.round(width * 0.012)}px;
                  color: rgba(255,255,255,0.7);
                  text-transform: uppercase;
                ">${escapeHtml(key)}</span>
                <span style="
                  font-family: 'Bebas Neue', sans-serif;
                  font-size: ${Math.round(width * 0.016)}px;
                  color: #B8860B;
                ">${escapeHtml(String(val))}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      break;

    case 'genealogy':
      overlayContent = `
        <div class="overlay" style="display: flex; align-items: center; justify-content: center;">
          <div style="
            width: ${Math.round(width * 0.6)}px;
            padding: ${Math.round(height * 0.04)}px;
            background: rgba(0,0,0,0.85);
            border: 1px solid rgba(184,134,11,0.3);
            border-radius: 12px;
            text-align: center;
          ">
            <div style="
              font-family: 'Bebas Neue', sans-serif;
              font-size: ${Math.round(width * 0.022)}px;
              color: #B8860B;
              letter-spacing: 4px;
              margin-bottom: ${Math.round(height * 0.02)}px;
            ">GENEALOGIA</div>
            <div style="
              font-family: 'Playfair Display', serif;
              font-size: ${Math.round(width * 0.025)}px;
              color: #fff;
              margin-bottom: ${Math.round(height * 0.02)}px;
            ">${escapeHtml(d.name || d.nome || 'ANIMAL')}</div>
            <div style="display: flex; justify-content: space-around;">
              <div>
                <div style="font-family: 'DM Sans'; font-size: ${Math.round(width * 0.01)}px; color: rgba(255,255,255,0.5);">PAI</div>
                <div style="font-family: 'DM Sans'; font-size: ${Math.round(width * 0.014)}px; color: #fff;">${escapeHtml(d.father || d.pai || '—')}</div>
              </div>
              <div>
                <div style="font-family: 'DM Sans'; font-size: ${Math.round(width * 0.01)}px; color: rgba(255,255,255,0.5);">MÃE</div>
                <div style="font-family: 'DM Sans'; font-size: ${Math.round(width * 0.014)}px; color: #fff;">${escapeHtml(d.mother || d.mae || '—')}</div>
              </div>
            </div>
          </div>
        </div>
      `;
      break;

    case 'cta':
      overlayContent = `
        <div class="overlay" style="
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          background: radial-gradient(ellipse at center, rgba(139,0,0,0.9) 0%, rgba(0,0,0,0.95) 100%);
        ">
          <div style="
            font-family: 'Playfair Display', serif;
            font-size: ${Math.round(width * 0.04)}px;
            color: #B8860B;
            letter-spacing: 4px;
            margin-bottom: ${Math.round(height * 0.02)}px;
          ">ENTRE EM CONTATO</div>
          ${d.whatsapp ? `
            <div style="
              font-family: 'DM Sans'; font-size: ${Math.round(width * 0.025)}px;
              color: #fff; margin-bottom: ${Math.round(height * 0.01)}px;
            ">📱 ${escapeHtml(d.whatsapp)}</div>
          ` : ''}
          ${d.auctionDate || d.dataLeilao ? `
            <div style="
              font-family: 'DM Sans'; font-size: ${Math.round(width * 0.018)}px;
              color: rgba(255,255,255,0.7); margin-top: ${Math.round(height * 0.015)}px;
            ">📅 ${escapeHtml(d.auctionDate || d.dataLeilao)}</div>
          ` : ''}
          ${d.farmName || d.fazenda ? `
            <div style="
              font-family: 'Bebas Neue'; font-size: ${Math.round(width * 0.02)}px;
              color: rgba(184,134,11,0.6); letter-spacing: 6px;
              margin-top: ${Math.round(height * 0.03)}px;
            ">${escapeHtml(d.farmName || d.fazenda)}</div>
          ` : ''}
        </div>
      `;
      break;

    default:
      overlayContent = '';
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  ${fontLinks}
  <style>${baseStyles}</style>
</head>
<body>
  ${overlayContent}
</body>
</html>`;
}

/**
 * Fallback: render a simple overlay using SVG (no Puppeteer needed).
 * Creates a basic text overlay at the target resolution.
 */
async function renderSvgOverlay(overlayType, data, width, height, outputPath) {
  // This is a minimal fallback. Full overlays need Puppeteer.
  const d = data || {};
  const name = d.name || d.nome || 'Animal';

  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" style="stop-color:rgb(0,0,0);stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:rgb(0,0,0);stop-opacity:0" />
    </linearGradient>
  </defs>
  <rect x="0" y="${height - 150}" width="${width}" height="150" fill="url(#bg)" />
  <text x="${width * 0.05}" y="${height - 60}" font-family="sans-serif" font-size="36" fill="#B8860B" letter-spacing="3">${escapeHtml(name)}</text>
</svg>`;

  await fs.writeFile(outputPath.replace('.png', '.svg'), svgContent);
  // Note: In production, convert SVG to PNG using sharp or another tool
  // For now, just save the SVG as a placeholder
  console.warn(`SVG fallback saved for ${overlayType} (needs conversion to PNG)`);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
