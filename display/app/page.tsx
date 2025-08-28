"use client";
import Navbar from "@/components/shared/Navbar";
import ResponseCard from "@/components/shared/ResponseCard";
import { useShortcuts } from "@/lib/hooks/useShortcuts";
import { cn } from "@/lib/utils";
import {
  motion,
  useAnimation,
  useDragControls,
  AnimatePresence,
} from "framer-motion";
import { useState } from "react";

const Page = () => {
  const { toggle } = useShortcuts();
  const controls = useAnimation();
  const dragControls = useDragControls();
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });

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
      drag
      dragMomentum={false}
      dragElastic={0.1}
      animate={controls}
      onDragEnd={handleDragEnd}
      // whileDrag={{ scale: 1.05 }}
      style={{ x: currentPosition.x, y: currentPosition.y }}
      dragControls={dragControls}
      dragListener={false}
      className={cn(
        "flex flex-col w-screen justify-center transition-all",
        toggle.hide ? "opacity-0 -translate-y-5" : "opacity-100 translate-y-0"
      )}
      // initial={{ opacity: 0, translateY: "20px", translateZ: "20px" }}
      // exit={{ opacity: 0, translateY: "20px", translateZ: "20px" }}
      // transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      <Navbar startDrag={startDrag} />
      <div className="flex items-center justify-center">
        <AnimatePresence mode="wait">
          {toggle.ask && <ResponseCard key="response-card" />}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Page;
