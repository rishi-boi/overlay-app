import { icons } from "lucide-react";
import { SHORTCUTS } from "./shortcuts";

export const navLinks = [
  {
    name: "hear",
    tooltip: SHORTCUTS.HEAR,
    icon: icons.AudioLines,
  },
  {
    name: "ask",
    tooltip: SHORTCUTS.ASK,
    icon: icons.Type,
  },
];

export const responseCardActions = [
  {
    icon: icons.Copy,
    tooltip: "copy",
  },
  {
    icon: icons.X,
    tooltip: "remove",
  },
];
