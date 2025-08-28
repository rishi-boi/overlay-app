"use client";
import React from "react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Grip, SlidersHorizontal } from "lucide-react";
import { SHORTCUTS } from "@/constants/shortcuts";
import { navLinks } from "@/constants";
import Image from "next/image";
import useChatStore from "@/lib/store/useChatStore";
import { cn } from "@/lib/utils";

const Navbar = ({
  startDrag,
}: {
  startDrag: (event: React.PointerEvent) => void;
}) => {
  const { toggle } = useChatStore();
  // Shortcut

  return (
    <motion.nav
      initial={{ translateY: "-20px", translateZ: "-10px", opacity: 0 }}
      animate={{ translateY: "0px", translateZ: "0px", opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex items-center justify-center gap-2 mt-8"
    >
      <motion.div className="card-box">
        {/* Navigation Buttons */}
        {navLinks.map((link, index) => (
          <Tooltip key={index}>
            <TooltipTrigger
              className={cn(
                "relative flex justify-center items-center text-xs z-10 px-4 py-1 rounded-lg cursor-pointer duration-200 hover:text-white transition-all capitalize gap-1",
                link.name === "hear"
                  ? "bg-primary hover:bg-primary/70"
                  : "text-gray-300",
                toggle.ask && link.name === "ask" ? "text-white" : ""
              )}
            >
              <link.icon className="size-3" /> {link.name}
            </TooltipTrigger>
            <TooltipContent>
              <p>{link.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ))}
        {/* Controls */}
        <div className="flex gap-2 items-center justify-center">
          <Tooltip>
            <TooltipTrigger>
              <SlidersHorizontal className="size-3 cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{SHORTCUTS.CONTROLS}</p>
            </TooltipContent>
          </Tooltip>
          <Grip className="size-3 cursor-grab mr-2" onPointerDown={startDrag} />
        </div>
      </motion.div>
      {/* Profile Picture */}
      <Image
        className="rounded-full size-9 border-2 border-gray-800/40"
        src={"/profile.gif"}
        width={100}
        height={100}
        alt="profile"
      />
    </motion.nav>
  );
};

export default Navbar;
