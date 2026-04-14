import { create } from 'zustand';

/**
 * Transient state for the /create multi-step portrait flow.
 * Cleared when the user starts a new portrait or navigates away.
 */
interface PortraitCreationStore {
  inputKeys: string[];
  localPreviews: string[]; // object URLs — revoke on reset
  email: string;
  selectedThemeSlug: string | null;

  setPhotos: (keys: string[], previews: string[]) => void;
  setEmail: (email: string) => void;
  selectTheme: (slug: string | null) => void;
  reset: () => void;
}

export const usePortraitStore = create<PortraitCreationStore>((set, get) => ({
  inputKeys: [],
  localPreviews: [],
  email: '',
  selectedThemeSlug: null,

  setPhotos: (keys, previews) => set({ inputKeys: keys, localPreviews: previews }),

  setEmail: (email) => set({ email }),

  selectTheme: (slug) => set({ selectedThemeSlug: slug }),

  reset: () => {
    // Revoke object URLs to avoid memory leaks
    get().localPreviews.forEach((url) => URL.revokeObjectURL(url));
    set({ inputKeys: [], localPreviews: [], email: '', selectedThemeSlug: null });
  },
}));
