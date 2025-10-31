"use client";

import { useEffect, useState } from "react";
import { Phone, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface IncomingCallModalProps {
  isOpen: boolean;
  callerName: string;
  callerAvatar: string;
  onAccept: () => void;
  onDecline: () => void;
  autoDeclineTimeout?: number; // in seconds
}

export default function IncomingCallModal({
  isOpen,
  callerName,
  callerAvatar,
  onAccept,
  onDecline,
  autoDeclineTimeout = 30,
}: IncomingCallModalProps) {
  const [timeLeft, setTimeLeft] = useState(autoDeclineTimeout);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(autoDeclineTimeout);
      return;
    }

    // Play ringing sound (you can add audio element here)
    // const audio = new Audio('/sounds/ringtone.mp3');
    // audio.loop = true;
    // audio.play();

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onDecline(); // Auto-decline when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      // audio.pause();
      // audio.currentTime = 0;
    };
  }, [isOpen, autoDeclineTimeout, onDecline]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onDecline()}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border-purple-500/30">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl text-white">
            Incoming Call
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            {callerName} is calling you
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 py-6">
          {/* Caller Avatar with Pulse Animation */}
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500/30 rounded-full animate-ping" />
            <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-pulse" />
            <Avatar className="w-32 h-32 border-4 border-purple-500/50 relative z-10">
              <AvatarImage src={callerAvatar} alt={callerName} />
              <AvatarFallback className="text-3xl bg-purple-600">
                {callerName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Caller Name */}
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white">{callerName}</h3>
            <p className="text-sm text-gray-400 mt-1">
              Ringing... ({timeLeft}s)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-6 mt-4">
            {/* Decline Button */}
            <Button
              onClick={onDecline}
              size="lg"
              className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/50"
            >
              <PhoneOff className="w-6 h-6" />
            </Button>

            {/* Accept Button */}
            <Button
              onClick={onAccept}
              size="lg"
              className="rounded-full w-16 h-16 bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/50 animate-pulse"
            >
              <Phone className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Visual Indicator */}
        <div className="flex justify-center gap-2 pb-4">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
