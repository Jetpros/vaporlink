"use client";

import { useState, useEffect } from "react";
import { formatTimeLeft } from "@/lib/utils";

interface CountdownTimerProps {
  expiresAt: Date;
  firstJoinAt: Date | null;
}

export default function CountdownTimer({
  expiresAt,
  firstJoinAt,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(() => {
    // Start countdown immediately using firstJoinAt or current time
    const startTime = firstJoinAt || new Date();
    return formatTimeLeft(expiresAt, startTime);
  });

  useEffect(() => {
    // Use firstJoinAt if available, otherwise use current time to start countdown immediately
    const startTime = firstJoinAt || new Date();
    
    // Update immediately
    setTimeLeft(formatTimeLeft(expiresAt, startTime));

    const interval = setInterval(() => {
      const newTimeLeft = formatTimeLeft(expiresAt, startTime);
      setTimeLeft(newTimeLeft);

      if (newTimeLeft === "Expired") {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, firstJoinAt]);

  // Check if less than 30 minutes (no hours and minutes < 30)
  const isExpiringSoon =
    timeLeft !== "Expired" &&
    !timeLeft.includes("h") &&
    parseInt(timeLeft.split("m")[0]) < 30;

  return (
    <div
      className={`px-4 py-2 rounded-full border transition-all ${
        isExpiringSoon
          ? "bg-red-50 border-red-300 text-red-700"
          : "bg-gray-50 border-gray-200 text-gray-700"
      }`}
    >
      <span className="text-sm font-medium tabular-nums">{timeLeft}</span>
    </div>
  );
}
