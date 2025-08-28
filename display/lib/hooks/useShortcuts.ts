import { SHORTCUTS } from "@/constants/shortcuts";
import { useHotkeys } from "react-hotkeys-hook";
import useChatStore from "../store/useChatStore";

export const useShortcuts = () => {
  const { setToggle, toggle } = useChatStore();
  useHotkeys(SHORTCUTS.ASK, () => setToggle("ask", !toggle.ask), {
    preventDefault: true,
  });

  useHotkeys(SHORTCUTS.HIDE, () => setToggle("hide", !toggle.hide), {
    preventDefault: true,
  });

  return { setToggle, toggle };
};
