import { TIMELINE_SECTIONS } from '../constants/timeline-sections';

/**
 * Parse a duration string like "3-5s" into { min, max } seconds.
 */
function parseDuration(str) {
  const match = str.match(/(\d+)-?(\d+)?s?/);
  if (!match) return { min: 5, max: 10 };
  return {
    min: parseInt(match[1]),
    max: match[2] ? parseInt(match[2]) : parseInt(match[1]),
  };
}

/**
 * Create an empty timeline from the storyboard sections.
 */
export function createEmptyTimeline() {
  return TIMELINE_SECTIONS.map(section => ({
    sectionId: section.id,
    label: section.label,
    icon: section.icon,
    color: section.color,
    targetDuration: parseDuration(section.duration),
    clips: [],
    totalDuration: 0,
  }));
}

/**
 * Build a timeline from AI edit plan and upload data.
 * Warns about skipped clips instead of silently dropping them.
 *
 * @param {object} editPlans - Map of sectionId -> { edit_plan: [...] }
 * @param {object} sections - From project store (sectionId -> { uploads })
 * @returns {{ timeline: Array, warnings: string[] }}
 */
export function buildTimelineFromAi(editPlans, sections) {
  const timeline = createEmptyTimeline();
  const warnings = [];

  for (const track of timeline) {
    const plan = editPlans[track.sectionId];
    const sectionUploads = sections[track.sectionId]?.uploads || [];

    if (!plan?.edit_plan || sectionUploads.length === 0) continue;

    track.clips = [];
    for (let idx = 0; idx < plan.edit_plan.length; idx++) {
      const item = plan.edit_plan[idx];
      const upload = sectionUploads[item.clip_index] || sectionUploads[0];

      if (!upload) {
        warnings.push(
          `Seção "${track.label}": clip ${idx} ignorado (upload index ${item.clip_index} não encontrado)`
        );
        continue;
      }

      const duration = item.out_time - item.in_time;
      if (duration <= 0) {
        warnings.push(
          `Seção "${track.label}": clip ${idx} ignorado (duração inválida: ${item.in_time}-${item.out_time})`
        );
        continue;
      }

      track.clips.push({
        id: `${track.sectionId}_clip_${idx}`,
        uploadId: upload.id,
        uploadFileName: upload.fileName,
        localUrl: upload.localUrl,
        thumbnailUrl: upload.thumbnailUrl,
        inPoint: Math.max(0, item.in_time),
        outPoint: item.out_time,
        duration: Math.max(0.5, duration),
        transition: item.transition_to_next || 'cut',
        reason: item.reason || '',
        aiScore: 0,
      });
    }

    track.totalDuration = track.clips.reduce((sum, c) => sum + c.duration, 0);
  }

  if (warnings.length > 0) {
    console.warn('[Timeline] Clips ignorados:', warnings);
  }

  return { timeline, warnings };
}

/**
 * Build a simple timeline from uploads without AI.
 * Uses first upload per section, trimmed to target duration.
 */
export function buildSimpleTimeline(sections) {
  const timeline = createEmptyTimeline();

  for (const track of timeline) {
    const sectionUploads = sections[track.sectionId]?.uploads || [];
    if (sectionUploads.length === 0) continue;

    const upload = sectionUploads[0];
    const maxDur = track.targetDuration.max;
    const uploadDuration = upload.duration || maxDur;
    const clipDuration = Math.min(uploadDuration, maxDur);

    track.clips = [{
      id: `${track.sectionId}_clip_0`,
      uploadId: upload.id,
      uploadFileName: upload.fileName,
      localUrl: upload.localUrl,
      thumbnailUrl: upload.thumbnailUrl,
      inPoint: 0,
      outPoint: clipDuration,
      duration: clipDuration,
      transition: 'cut',
      reason: '',
      aiScore: 0,
    }];

    track.totalDuration = clipDuration;
  }

  return timeline;
}

/**
 * Calculate total video duration from a timeline.
 */
export function getTimelineDuration(timeline) {
  return timeline.reduce((sum, track) => sum + track.totalDuration, 0);
}

/**
 * Get a flat ordered list of all clips from a timeline (for preview playback).
 */
export function flattenTimeline(timeline) {
  const flat = [];
  let currentTime = 0;

  for (const track of timeline) {
    for (const clip of track.clips) {
      flat.push({
        ...clip,
        sectionId: track.sectionId,
        sectionColor: track.color,
        startInTimeline: currentTime,
        endInTimeline: currentTime + clip.duration,
      });
      currentTime += clip.duration;
    }
  }

  return flat;
}
