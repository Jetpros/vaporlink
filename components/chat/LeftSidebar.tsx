"use client";

import { MessageSquare, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LeftSidebarProps {
  onLeave?: () => void;
}

export default function LeftSidebar({ onLeave }: LeftSidebarProps = {}) {
  return (
    <div className="w-20 flex flex-col items-center py-6 space-y-8 relative overflow-hidden">
      {/* Animated Vapor Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Multiple vapor layers for depth */}
        <div className="vapor-container">
          <div className="vapor vapor-1"></div>
          <div className="vapor vapor-2"></div>
          <div className="vapor vapor-3"></div>
          <div className="vapor vapor-4"></div>
          <div className="vapor vapor-5"></div>
          <div className="vapor vapor-6"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full h-full">
        {/* Logo */}
        <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg backdrop-blur-sm">
          <MessageSquare className="w-6 h-6 text-white" />
        </div>

        {/* Logout */}
        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/80 backdrop-blur-sm absolute bottom-6"
          onClick={onLeave}
          title="Leave room"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>

      <style jsx>{`
        .vapor-container {
          position: absolute;
          width: 100%;
          height: 100%;
          inset: 0;
        }

        .vapor {
          position: absolute;
          bottom: -50%;
          left: 50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(
            circle at center,
            rgba(139, 92, 246, 0.4) 0%,
            rgba(167, 139, 250, 0.3) 20%,
            rgba(196, 181, 253, 0.2) 40%,
            rgba(221, 214, 254, 0.1) 60%,
            transparent 80%
          );
          filter: blur(40px);
          opacity: 0;
          transform: translateX(-50%) translateY(0) scale(0.5);
          animation: vaporRise 15s ease-in-out infinite;
        }

        .vapor-1 {
          animation-delay: 0s;
          animation-duration: 12s;
        }

        .vapor-2 {
          animation-delay: 2s;
          animation-duration: 14s;
          background: radial-gradient(
            circle at center,
            rgba(124, 58, 237, 0.35) 0%,
            rgba(139, 92, 246, 0.25) 20%,
            rgba(167, 139, 250, 0.15) 40%,
            transparent 70%
          );
        }

        .vapor-3 {
          animation-delay: 4s;
          animation-duration: 16s;
          background: radial-gradient(
            circle at center,
            rgba(147, 51, 234, 0.4) 0%,
            rgba(168, 85, 247, 0.3) 20%,
            rgba(192, 132, 252, 0.2) 40%,
            transparent 75%
          );
        }

        .vapor-4 {
          animation-delay: 6s;
          animation-duration: 13s;
          background: radial-gradient(
            circle at center,
            rgba(126, 34, 206, 0.35) 0%,
            rgba(147, 51, 234, 0.25) 20%,
            rgba(167, 139, 250, 0.15) 40%,
            transparent 70%
          );
        }

        .vapor-5 {
          animation-delay: 8s;
          animation-duration: 15s;
          background: radial-gradient(
            circle at center,
            rgba(109, 40, 217, 0.4) 0%,
            rgba(139, 92, 246, 0.3) 20%,
            rgba(196, 181, 253, 0.2) 40%,
            transparent 75%
          );
        }

        .vapor-6 {
          animation-delay: 10s;
          animation-duration: 17s;
          background: radial-gradient(
            circle at center,
            rgba(139, 92, 246, 0.45) 0%,
            rgba(167, 139, 250, 0.35) 20%,
            rgba(216, 180, 254, 0.25) 40%,
            transparent 80%
          );
        }

        @keyframes vaporRise {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(0) scale(0.5) rotate(0deg);
          }
          10% {
            opacity: 0.6;
          }
          50% {
            opacity: 0.8;
            transform: translateX(-45%) translateY(-100%) scale(1.2)
              rotate(15deg);
          }
          70% {
            opacity: 0.5;
          }
          100% {
            opacity: 0;
            transform: translateX(-40%) translateY(-200%) scale(1.5)
              rotate(30deg);
          }
        }

        /* Add pulsing glow effect */
        @keyframes pulseGlow {
          0%,
          100% {
            filter: blur(40px) brightness(1);
          }
          50% {
            filter: blur(50px) brightness(1.3);
          }
        }

        .vapor-1,
        .vapor-3,
        .vapor-5 {
          animation:
            vaporRise 12s ease-in-out infinite,
            pulseGlow 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
