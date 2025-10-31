"use client";

import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CallButtonProps {
  onStartCall: () => void;
  disabled?: boolean;
  isCallActive?: boolean;
}

export default function CallButton({
  onStartCall,
  disabled = false,
  isCallActive = false,
}: CallButtonProps) {
  const handleClick = () => {
    console.log("🔘 CallButton clicked!");
    console.log("🔘 Disabled:", disabled);
    console.log("🔘 isCallActive:", isCallActive);
    if (!disabled && !isCallActive) {
      onStartCall();
    } else {
      console.log("🔘 Button is disabled, not calling onStartCall");
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleClick}
            disabled={disabled || isCallActive}
            size="icon"
            variant="ghost"
            className={`relative ${
              isCallActive
                ? "text-green-500 hover:text-green-600"
                : disabled
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Phone className="w-5 h-5" />
            {isCallActive && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {disabled
              ? "Connecting to server..."
              : isCallActive
              ? "Call in progress"
              : "Start voice/video call"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
