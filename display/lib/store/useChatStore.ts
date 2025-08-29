import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ToggleState {
  ask: boolean;
  hear: boolean;
  hide: boolean;
  inDetail: boolean;
}

interface ChatStore {
  toggle: ToggleState;
  setToggle: (key: keyof ToggleState, value: boolean) => void;
  resetToggle: () => void;
}

const defaultValues = {
  ask: false,
  hear: false,
  hide: false,
  inDetail: false,
};
const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      toggle: defaultValues,
      setToggle: (key, value) =>
        set((state) => ({
          toggle: {
            ...state.toggle,
            [key]: value,
          },
        })),
      resetToggle: () =>
        set(() => ({
          toggle: defaultValues,
        })),
    }),
    {
      name: "chat-store",
    }
  )
);

export default useChatStore;
