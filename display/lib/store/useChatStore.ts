import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ToggleState {
  ask: boolean;
  hear: boolean;
  hide: boolean;
}

interface ChatStore {
  toggle: ToggleState;
  setToggle: (key: keyof ToggleState, value: boolean) => void;
  resetToggle: () => void;
}

const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      toggle: {
        ask: false,
        hear: false,
        hide: false,
      },
      setToggle: (key, value) =>
        set((state) => ({
          toggle: {
            ...state.toggle,
            [key]: value,
          },
        })),
      resetToggle: () =>
        set(() => ({
          toggle: {
            ask: false,
            hear: false,
            hide: false,
          },
        })),
    }),
    {
      name: "chat-store",
    }
  )
);

export default useChatStore;
