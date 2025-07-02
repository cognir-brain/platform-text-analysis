"use client";;
import React, { useState, useEffect } from "react";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function HoverBorderGradient({
  children,
  containerClassName,
  className,
  as: Tag = "button",
  duration = 1,
  clockwise = true,
  ...props
}) {
  const [hovered, setHovered] = useState(false);
  const [direction, setDirection] = useState("TOP");

  const rotateDirection = currentDirection => {
    const directions = ["TOP", "LEFT", "BOTTOM", "RIGHT"];
    const currentIndex = directions.indexOf(currentDirection);
    const nextIndex = clockwise
      ? (currentIndex - 1 + directions.length) % directions.length
      : (currentIndex + 1) % directions.length;
    return directions[nextIndex];
  };

  const movingMap = {
    TOP: "radial-gradient(50% 100% at 50% 0%, hsl(240, 100%, 25%) 0%, hsl(180, 100%, 50%) 50%, rgba(0, 255, 255, 0) 100%)", // Navy to Cyan
    LEFT: "radial-gradient(40% 80% at 0% 50%, hsl(240, 100%, 25%) 0%, hsl(180, 100%, 50%) 50%, rgba(0, 255, 255, 0) 100%)", // Navy to Cyan
    BOTTOM: "radial-gradient(50% 100% at 50% 100%, hsl(240, 100%, 25%) 0%, hsl(180, 100%, 50%) 50%, rgba(0, 255, 255, 0) 100%)", // Navy to Cyan
    RIGHT: "radial-gradient(40% 80% at 100% 50%, hsl(240, 100%, 25%) 0%, hsl(180, 100%, 50%) 50%, rgba(0, 255, 255, 0) 100%)", // Navy to Cyan
  };

  const highlight = "radial-gradient(100% 250% at 50% 50%, hsl(240, 100%, 25%) 0%, hsl(180, 100%, 50%) 50%, rgba(0, 255, 255, 0) 100%)";
  useEffect(() => {
    if (!hovered) {
      const interval = setInterval(() => {
        setDirection((prevState) => rotateDirection(prevState));
      }, duration * 1000);
      return () => clearInterval(interval);
    }
  }, [hovered]);
  return (
    (<Tag
      onMouseEnter={(event) => {
        setHovered(true);
      }}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative flex rounded-full content-center transition duration-500 dark:bg-white/20 items-center flex-col flex-nowrap gap-10 h-min justify-center overflow-visible p-px decoration-clone w-fit",
        containerClassName
      )}
      {...props}>
      <div
        className={cn("w-auto text-white z-10 bg-black px-4 py-2 rounded-[inherit]", className)}>
        {children}
      </div>
      <motion.div
        className={cn("inset-0 overflow-hidden absolute z-0 rounded-[inherit]")}
        style={{
          filter: "blur(2px)",
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
        initial={{ background: movingMap[direction] }}
        animate={{
          background: hovered
            ? [movingMap[direction], highlight]
            : movingMap[direction],
        }}
        transition={{ ease: "linear", duration: duration ?? 1 }} />
      <div className=" absolute z-1 flex-none inset-[2px] rounded-[100px]" />
    </Tag>)
  );
}
