/**
 * PecuariaClip Pro — FFmpeg Transition Filters
 *
 * Maps transition names from the AI edit plan to FFmpeg xfade filter types.
 *
 * Available xfade transitions:
 * fade, wipeleft, wiperight, wipeup, wipedown, slideleft, slideright,
 * slideup, slidedown, circlecrop, rectcrop, distance, fadeblack,
 * fadewhite, radial, smoothleft, smoothright, smoothup, smoothdown,
 * circleopen, circleclose, vertopen, vertclose, horzopen, horzclose,
 * dissolve, pixelize, diagtl, diagtr, diagbl, diagbr, hlslice,
 * hrslice, vuslice, vdslice, hblur, fadegrays, wipetl, wipetr,
 * wipebl, wipebr, squeezeh, squeezev, zoomin, fadefast, fadeslow
 */

/**
 * Map our transition names to FFmpeg xfade types.
 * @param {string} transition - Transition name from AI or user
 * @returns {string} FFmpeg xfade transition type
 */
export function getTransitionFilter(transition) {
  const map = {
    // Common transitions
    'cut': null,                    // No transition (hard cut)
    'dissolve': 'dissolve',         // Classic cross-dissolve
    'fade': 'fade',                 // Fade through
    'fade_black': 'fadeblack',      // Fade through black
    'fade_white': 'fadewhite',      // Fade through white

    // Wipes
    'wipe_left': 'wipeleft',
    'wipe_right': 'wiperight',
    'wipe_up': 'wipeup',
    'wipe_down': 'wipedown',

    // Slides
    'slide_left': 'slideleft',
    'slide_right': 'slideright',
    'slide_up': 'slideup',
    'slide_down': 'slidedown',

    // Smooth transitions (best for professional look)
    'smooth_left': 'smoothleft',
    'smooth_right': 'smoothright',

    // Circle/crop transitions
    'circle_open': 'circleopen',
    'circle_close': 'circleclose',
    'circle_crop': 'circlecrop',

    // Special
    'zoom_in': 'zoomin',
    'radial': 'radial',
    'blur': 'hblur',
    'pixelize': 'pixelize',

    // Defaults from Gemini AI responses
    'crossfade': 'dissolve',
    'cross_dissolve': 'dissolve',
    'dip_to_black': 'fadeblack',
    'dip_to_white': 'fadewhite',
  };

  // Look up the transition, default to dissolve
  const normalized = (transition || 'dissolve').toLowerCase().replace(/[\s-]/g, '_');
  return map[normalized] || 'dissolve';
}

/**
 * Get recommended transition for a section change.
 * @param {string} fromSection - Section leaving
 * @param {string} toSection - Section entering
 * @returns {string} Recommended transition name
 */
export function getRecommendedTransition(fromSection, toSection) {
  // Dramatic transitions between major sections
  const dramaticSections = ['intro', 'cta'];

  if (dramaticSections.includes(fromSection) || dramaticSections.includes(toSection)) {
    return 'fade_black'; // Dramatic fade through black
  }

  // Smooth transition for related sections
  const animalSections = ['hero', 'angles', 'closeup'];
  if (animalSections.includes(fromSection) && animalSections.includes(toSection)) {
    return 'dissolve'; // Smooth dissolve between animal footage
  }

  // Data sections get clean cuts or quick dissolves
  const dataSections = ['data', 'genealogy'];
  if (dataSections.includes(fromSection) || dataSections.includes(toSection)) {
    return 'dissolve';
  }

  // Default
  return 'dissolve';
}
