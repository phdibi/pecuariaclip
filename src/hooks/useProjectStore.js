import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useProjectStore = create(
  persist(
    (set) => ({
      // Animal data
      animalData: {},
      setAnimalData: (data) => set({ animalData: data }),

      // Active tab
      activeTab: 'storyboard',
      setActiveTab: (tab) => set({ activeTab: tab }),

      // Video uploads per section
      sections: {
        intro: { uploads: [], selectedClips: [], aiAnalysis: null },
        hero: { uploads: [], selectedClips: [], aiAnalysis: null },
        angles: { uploads: [], selectedClips: [], aiAnalysis: null },
        closeup: { uploads: [], selectedClips: [], aiAnalysis: null },
        data: { uploads: [], selectedClips: [], aiAnalysis: null },
        genealogy: { uploads: [], selectedClips: [], aiAnalysis: null },
        progeny: { uploads: [], selectedClips: [], aiAnalysis: null },
        cta: { uploads: [], selectedClips: [], aiAnalysis: null },
      },
      addUpload: (sectionId, upload) =>
        set((state) => ({
          sections: {
            ...state.sections,
            [sectionId]: {
              ...state.sections[sectionId],
              uploads: [...state.sections[sectionId].uploads, upload],
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
        perSection: {
          intro: true, hero: true, angles: true, closeup: true,
          data: true, genealogy: true, progeny: true, cta: true,
        },
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

      // Reset project
      resetProject: () =>
        set({
          animalData: {},
          sections: {
            intro: { uploads: [], selectedClips: [], aiAnalysis: null },
            hero: { uploads: [], selectedClips: [], aiAnalysis: null },
            angles: { uploads: [], selectedClips: [], aiAnalysis: null },
            closeup: { uploads: [], selectedClips: [], aiAnalysis: null },
            data: { uploads: [], selectedClips: [], aiAnalysis: null },
            genealogy: { uploads: [], selectedClips: [], aiAnalysis: null },
            progeny: { uploads: [], selectedClips: [], aiAnalysis: null },
            cta: { uploads: [], selectedClips: [], aiAnalysis: null },
          },
          renderStatus: null,
          renderProgress: 0,
          finalVideoUrl: null,
        }),
    }),
    {
      name: 'pecuaria-clip-project',
    }
  )
);
