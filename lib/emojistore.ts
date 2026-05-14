// store/usePaymojiStore.ts
import { create } from "zustand";

type PaymojiStore = {
  emojis: string[];
  solName: string;
  setStoreEmojis: (emojis: string[]) => void;
  setStoreSolName: (name: string) => void;
  reset: () => void;
};

export const usePaymojiStore = create<PaymojiStore>((set) => ({
  emojis: [],
  solName: "",
  setStoreEmojis: (emojis) => set({ emojis }),
  setStoreSolName: (solName) => set({ solName }),
  reset: () => set({ emojis: [], solName: "" }),
}));
