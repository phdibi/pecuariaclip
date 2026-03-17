import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TIMELINE_SECTIONS } from '../constants/timeline-sections';

const STORE_VERSION = 1;

/**
 * Create the default sections object from TIMELINE_SECTIONS constant.
 * Single source of truth — no duplication.
 */
function createDefaultSections() {
  const sections = {};
  for (const s of TIMELINE_SECTIONS) {
    sections[s.id] = { uploads: [], selectedClips: [], aiAnalysis: null };
  }
  return sections;
}

function createDefaultOverlayPerSection() {
  const perSection = {};
  for (const s of TIMELINE_SECTIONS) {
    perSection[s.id] = true;
  }
  return perSection;
}

export const useProjectStore = create(
  persist(
    (set) => ({
      // Animal data
      animalData: {},
      setAnimalData: (data) => set({ animalData: data }),

      // Active tab
      activeTab: 'storyboard',
      setActiveTab: (tab) => set({ activeTab: tab }),

      // Video uploads per section (generated from constants)
      sections: createDefaultSections(),
      addUpload: (sectionId, upload) =>
        set((state) => ({
          sections: {
            ...state.sections,
            [sectionId]: {
              ...state.sections[sectionId],
              uploads: [...(state.sections[sectionId]?.uploads || []), upload],
            },
          },
        })),
      removeUpload: (sectionId, uploadId) =>
        set((state) => ({
          sections: {
            ...state.sections,
            [sectionId]: {
              ...state.sections[sectionId],
              uploads: state.sections[sectionId].uploads.filter((u) => u.id !== uploadId),
            },
          },
        })),
      setSectionAnalysis: (sectionId, analysis) =>
        set((state) => ({
          sections: {
            ...state.sections,
            [sectionId]: {
              ...state.sections[sectionId],
              aiAnalysis: analysis,
            },
          },
        })),

      // Overlay settings
      overlaySettings: {
        burnOverlays: true,
        perSection: createDefaultOverlayPerSection(),
      },
      toggleBurnOverlays: () =>
        set((state) => ({
          overlaySettings: {
            ...state.overlaySettings,
            burnOverlays: !state.overlaySettings.burnOverlays,
          },
        })),
      toggleSectionOverlay: (sectionId) =>
        set((state) => ({
          overlaySettings: {
            ...state.overlaySettings,
            perSection: {
              ...state.overlaySettings.perSection,
              [sectionId]: !state.overlaySettings.perSection[sectionId],
            },
          },
        })),

      // Render status
      renderStatus: null, // null | 'queued' | 'processing' | 'done' | 'error'
      renderProgress: 0,
      finalVideoUrl: null,
      setRenderStatus: (status) => set({ renderStatus: status }),
      setRenderProgress: (progress) => set({ renderProgress: progress }),
      setFinalVideoUrl: (url) => set({ finalVideoUrl: url }),

      // Reset project (uses the same factory functions — no duplication)
      resetProject: () =>
        set({
          animalData: {},
          sections: createDefaultSections(),
          overlaySettings: {
            burnOverlays: true,
            perSection: createDefaultOverlayPerSection(),
          },
          renderStatus: null,
          renderProgress: 0,
          finalVideoUrl: null,
        }),
    }),
    {
      name: 'pecuaria-clip-project',
      version: STORE_VERSION,
      // Exclude large/transient data from persistence to prevent localStorage overflow
      partialize: (state) => ({
        animalData: state.animalData,
        activeTab: state.activeTab,
        overlaySettings: state.overlaySettings,
        // Persist sections but strip localUrl/thumbnailUrl (blob URLs don't survive refresh)
        sections: Object.fromEntries(
          Object.entries(state.sections).map(([id, sec]) => [
            id,
            {
              ...sec,
              uploads: sec.uploads.map(u => ({
                ...u,
                localUrl: null,
                thumbnailUrl: null,
              })),
              // Don't persist AI analysis (can be large)
              aiAnalysis: null,
            },
          ])
        ),
      }),
      // Handle schema migrations
      migrate: (persisted, version) => {
        if (version < STORE_VERSION) {
          return {
            ...persisted,
            sections: createDefaultSections(),
            overlaySettings: {
              burnOverlays: true,
              perSection: createDefaultOverlayPerSection(),
            },
          };
        }
        return persisted;
      },
    }
  )
);
