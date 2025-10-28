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
    // Only calculate countdown if room has been started (firstJoinAt exists)
    if (!firstJoinAt) {
      return "Waiting to start...";
    }
    return formatTimeLeft(expiresAt, firstJoinAt);
  });

  useEffect(() => {
    // If room hasn't started, don't run the interval
    if (!firstJoinAt) {
      setTimeLeft("Waiting to start...");
      return;
    }

    // Update immediately when firstJoinAt changes
    setTimeLeft(formatTimeLeft(expiresAt, firstJoinAt));

    const interval = setInterval(() => {
      const newTimeLeft = formatTimeLeft(expiresAt, firstJoinAt);
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
    timeLeft !== "Waiting to start..." &&
    !timeLeft.includes("h") &&
    parseInt(timeLeft.split("m")[0]) < 30;

  // Check if waiting to start
  const isWaiting = timeLeft === "Waiting to start...";

  return (
    <div
      className={`px-4 py-2 rounded-full border transition-all ${
        isWaiting
          ? "bg-blue-50 border-blue-300 text-blue-700"
          : isExpiringSoon
            ? "bg-red-50 border-red-300 text-red-700"
            : "bg-gray-50 border-gray-200 text-gray-700"
      }`}
    >
      <span className="text-sm font-medium tabular-nums">{timeLeft}</span>
    </div>
  );
}
