"use client";

import { useEffect, useState } from "react";
import { Phone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CallIndicatorProps {
  isVisible: boolean;
  participantCount: number;
  isUserInCall: boolean;
  onJoinCall: () => void;
  callStartTime?: Date;
}

export default function CallIndicator({
  isVisible,
  participantCount,
  isUserInCall,
  onJoinCall,
  callStartTime,
}: CallIndicatorProps) {
  const [duration, setDuration] = useState("00:00");

  useEffect(() => {
    if (!callStartTime || !isVisible) return;

    const updateDuration = () => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - callStartTime.getTime()) / 1000);
      const minutes = Math.floor(diff / 60);
      const seconds = diff % 60;
      setDuration(
        `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    };

    updateDuration();
    const interval = setInterval(updateDuration, 1000);

    return () => clearInterval(interval);
  }, [callStartTime, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 shadow-lg animate-in slide-in-from-top">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Call Info */}
          <div className="flex items-center gap-3">
            {/* Pulsing Indicator */}
            <div className="relative flex items-center justify-center">
              <div className="absolute w-8 h-8 bg-white/30 rounded-full animate-ping" />
              <div className="relative w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <Phone className="w-3 h-3 text-purple-600" />
              </div>
            </div>

            {/* Text */}
            <div className="flex flex-col">
              <span className="text-white font-semibold text-sm">
                {isUserInCall ? "You're in a call" : "Call in progress"}
              </span>
              <div className="flex items-center gap-2 text-white/80 text-xs">
                <Users className="w-3 h-3" />
                <span>
                  {participantCount} {participantCount === 1 ? "participant" : "participants"}
                </span>
                {callStartTime && (
                  <>
                    <span>•</span>
                    <span>{duration}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Join Button (only show if user is not in call) */}
          {!isUserInCall && (
            <Button
              onClick={onJoinCall}
              size="sm"
              className="bg-white text-purple-600 hover:bg-gray-100 font-semibold shadow-lg"
            >
              <Phone className="w-4 h-4 mr-2" />
              Join Call
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
