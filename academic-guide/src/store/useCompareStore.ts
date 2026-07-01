import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CompareState {
  compareIds: string[];
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set) => ({
      compareIds: [],
      toggleCompare: (id: string) =>
        set((state) => {
          if (state.compareIds.includes(id)) {
            return { compareIds: state.compareIds.filter((compareId) => compareId !== id) };
          }
          if (state.compareIds.length >= 3) {
            // Optional: We could trigger a toast notification here if we had a global toast system
            return state; // Prevent adding more than 3
          }
          return { compareIds: [...state.compareIds, id] };
        }),
      clearCompare: () => set({ compareIds: [] }),
    }),
    {
      name: 'academic-guide-compare',
    }
  )
);
