"use client";
import { buttons } from "@/constants";
import { Disc, GripVertical, Home, SlidersHorizontal } from "lucide-react";
import React, { useEffect, useState } from "react";
import { motion, useAnimation, useDragControls } from "framer-motion";
import ResponseCard from "@/components/ResponseCard";
import { TooltipContent, TooltipTrigger } from "@radix-ui/react-tooltip";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ToggleProps {
  hear: boolean;
  ask: boolean;
  controls: boolean;
  dashboard: boolean;
}

const Page = () => {
  const controls = useAnimation();
  const dragControls = useDragControls();
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });
  const [toggle, setToggle] = useState<ToggleProps>({
    hear: false,
    ask: false,
    controls: false,
    dashboard: false,
  });

  // Shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey) {
        switch (event.key) {
          case "a":
            event.preventDefault();
            setToggle((prev) => ({ ...prev, ask: !prev.ask }));
            break;
          case "h":
            event.preventDefault();
            setToggle((prev) => ({ ...prev, hear: !prev.hear }));
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Define snap positions and snap range
  const getSnapPositions = () => {
    return {
      topCenter: { x: 0, y: 0 },
    };
  };

  // Define the snap range (distance within which snapping occurs)
  const SNAP_RANGE = 50; // pixels

  // Check if position is within snap range of top center
  const isWithinSnapRange = (currentPos: { x: number; y: number }) => {
    const snapPositions = getSnapPositions();
    const topCenterDistance = calculateDistance(
      currentPos,
      snapPositions.topCenter
    );
    return topCenterDistance <= SNAP_RANGE;
  };

  // Calculate distance between two points
  const calculateDistance = (
    point1: { x: number; y: number },
    point2: { x: number; y: number }
  ) => {
    return Math.sqrt(
      Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2)
    );
  };

  // Get the top center snap position
  const getTopCenterSnapPosition = () => {
    const snapPositions = getSnapPositions();
    return snapPositions.topCenter;
  };

  // Handle drag end - snap to top center only if within range
  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number; y: number } }
  ) => {
    const dragEndPosition = {
      x: currentPosition.x + info.offset.x,
      y: currentPosition.y + info.offset.y,
    };

    // Only snap if within the snap range of top center
    if (isWithinSnapRange(dragEndPosition)) {
      const snapPosition = getTopCenterSnapPosition();

      // Animate to the snap position
      controls.start({
        x: snapPosition.x,
        y: snapPosition.y,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 30,
        },
      });

      setCurrentPosition(snapPosition);
    } else {
      // Stay at the current drag position (free drag)
      controls.start({
        x: dragEndPosition.x,
        y: dragEndPosition.y,
        transition: {
          type: "spring",
          stiffness: 200,
          damping: 25,
        },
      });

      setCurrentPosition(dragEndPosition);
    }
  };

  // Handle drag start from the grip
  const startDrag = (event: React.PointerEvent) => {
    dragControls.start(event);
  };

  return (
    <motion.div
      className="relative h-screen flex flex-col items-center w-full mt-8 gap-3"
      drag
      dragMomentum={false}
      dragElastic={0.1}
      animate={controls}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05 }}
      style={{ x: currentPosition.x, y: currentPosition.y }}
      dragControls={dragControls}
      dragListener={false}
    >
      {/* Snap Zone Indicator (LATER) */}
      {/* <div className="absolute left-1/2 top-0 -translate-x-1/2 h-screen outline bg-primary outline-dashed opacity-70" /> */}

      {/* NAVIGATION */}
      <motion.nav className="flex items-center gap-2">
        <motion.div
          initial={{ scale: 0.6, y: -20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          className=" gap-2 flex relative box"
        >
          {buttons.map((button, index) => (
            <div
              onClick={() =>
                setToggle((prev) => ({
                  ...prev,
                  [button.name as keyof ToggleProps]:
                    !prev[button.name as keyof ToggleProps],
                }))
              }
              className={`relative flex justify-center items-center text-xs z-10 px-4 py-1 rounded-lg cursor-pointer duration-200 hover:text-white transition-all capitalize ${
                button.name === "hear"
                  ? "bg-primary hover:bg-primary/70"
                  : "text-gray-300"
              }`}
              key={index}
            >
              {button.icon &&
                (button.name == "hear" && toggle.hear ? (
                  <Disc className="mr-2 inline-block size-4 animate-pulse transition-all" />
                ) : (
                  <button.icon className="mr-2 inline-block size-4" />
                ))}
              {button.name === "hear" && toggle.hear
                ? "Listening..."
                : button.name}
            </div>
          ))}
          <div className="flex items-center justify-center gap-2 mx-2">
            <Tooltip>
              <TooltipTrigger>
                <SlidersHorizontal className="size-4 cursor-pointer text-gray-300 hover:text-white" />
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <div className="tooltip">controls</div>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <div
                  onPointerDown={startDrag}
                  className="size-4 cursor-grab text-gray-300 hover:text-white active:cursor-grabbing"
                  style={{ touchAction: "none" }}
                >
                  <GripVertical className="size-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <div className="tooltip">drag</div>
              </TooltipContent>
            </Tooltip>
          </div>
        </motion.div>
        <motion.div
          initial={{ scale: 0, y: -20 }}
          animate={{ scale: 1, y: 0 }}
          className="flex justify-center gap-2 rounded-2xl relative bg-background/40 p-1 border border-white/20"
        >
          <Tooltip>
            <TooltipTrigger>
              <div className="relative flex justify-center items-center text-xs z-10 px-4 py-1 rounded-lg cursor-pointer duration-200 hover:text-white transition-all">
                <Home className="size-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <div className="tooltip">home</div>
            </TooltipContent>
          </Tooltip>
        </motion.div>
      </motion.nav>
      <div>{toggle.ask && <ResponseCard />}</div>
    </motion.div>
  );
};

export default Page;
