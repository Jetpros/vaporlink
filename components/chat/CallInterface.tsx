"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DailyIframe, { DailyCall } from "@daily-co/daily-js";

// Global flag to prevent duplicate Daily instances
let dailyInitialized = false;

interface CallInterfaceProps {
  roomUrl?: string;
  currentParticipantId: string;
  onLeaveCall: () => void;
  onToggleAudio: (isMuted: boolean) => void;
  onToggleVideo: (isVideoEnabled: boolean) => void;
}

export default function CallInterface({
  roomUrl,
  currentParticipantId,
  onLeaveCall,
  onToggleAudio,
  onToggleVideo,
}: CallInterfaceProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const callFrameRef = useRef<DailyCall | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!roomUrl) {
      setError("No room URL provided");
      setIsLoading(false);
      return;
    }

    // Prevent multiple initializations globally
    if (dailyInitialized) {
      console.log("⚠️ Daily already initialized globally, reusing existing frame");
      // Try to use existing frame
      const existingFrame = DailyIframe.getCallInstance();
      if (existingFrame) {
        callFrameRef.current = existingFrame;
        setIsLoading(false);
        return;
      }
    }

    console.log("📞 CallInterface: Joining Daily room:", roomUrl);

    // Destroy any existing Daily frames first
    try {
      const existingFrame = DailyIframe.getCallInstance();
      if (existingFrame) {
        console.log("🧹 Destroying existing Daily frame");
        existingFrame.destroy();
      }
    } catch (e) {
      // Ignore errors if no frame exists
    }

    // Create Daily call frame with error handling
    let callFrame;
    try {
      callFrame = DailyIframe.createFrame(containerRef.current!, {
        showLeaveButton: false,
        showFullscreenButton: true,
        iframeStyle: {
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          border: '0',
        },
      });
      dailyInitialized = true;
    } catch (error: any) {
      console.error("❌ Failed to create Daily frame:", error);
      // If duplicate instance error, try to reuse existing frame
      if (error.message?.includes("Duplicate DailyIframe instances")) {
        const existingFrame = DailyIframe.getCallInstance();
        if (existingFrame) {
          console.log("🔄 Reusing existing Daily frame");
          callFrame = existingFrame;
          callFrameRef.current = callFrame;
          setIsLoading(false);
          return;
        }
      }
      setError("Failed to initialize video call");
      setIsLoading(false);
      return;
    }

    callFrameRef.current = callFrame;

    // Event listeners
    callFrame
      .on("joined-meeting", () => {
        console.log("✅ Joined Daily meeting");
        setIsLoading(false);
      })
      .on("left-meeting", () => {
        console.log("👋 Left Daily meeting");
      })
      .on("error", (error) => {
        console.error("❌ Daily error:", error);
        setError(error.errorMsg || "Failed to join call");
        setIsLoading(false);
      });

    // Join the call
    callFrame
      .join({ url: roomUrl })
      .catch((error) => {
        console.error("❌ Failed to join Daily call:", error);
        setError("Failed to join call");
        setIsLoading(false);
      });

    // Cleanup
    return () => {
      console.log("🧹 Cleaning up Daily call frame");
      if (callFrameRef.current) {
        callFrameRef.current.destroy();
        callFrameRef.current = null;
        dailyInitialized = true;
      }
    };
  }, [roomUrl]);

  const handleToggleAudio = async () => {
    if (!callFrameRef.current) return;
    
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    await callFrameRef.current.setLocalAudio(!newMutedState);
    onToggleAudio(newMutedState);
  };

  const handleToggleVideo = async () => {
    if (!callFrameRef.current) return;
    
    const newVideoState = !isVideoEnabled;
    setIsVideoEnabled(newVideoState);
    await callFrameRef.current.setLocalVideo(newVideoState);
    onToggleVideo(newVideoState);
  };

  const handleLeaveCall = async () => {
    if (callFrameRef.current) {
      await callFrameRef.current.leave();
    }
    onLeaveCall();
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
      {/* Daily.co Video Container */}
      <div className="flex-1 relative" ref={containerRef}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
              <p className="text-white text-lg">Joining call...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
            <div className="text-center">
              <p className="text-red-500 text-lg mb-4">{error}</p>
              <Button onClick={onLeaveCall} variant="outline">
                Return to Chat
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="bg-gray-800 p-4 flex items-center justify-center gap-4">
        <Button
          onClick={handleToggleAudio}
          size="lg"
          variant={isMuted ? "destructive" : "secondary"}
          className="rounded-full w-14 h-14"
          disabled={isLoading || !!error}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </Button>

        <Button
          onClick={handleToggleVideo}
          size="lg"
          variant={isVideoEnabled ? "secondary" : "destructive"}
          className="rounded-full w-14 h-14"
          disabled={isLoading || !!error}
        >
          {isVideoEnabled ? (
            <Video className="w-6 h-6" />
          ) : (
            <VideoOff className="w-6 h-6" />
          )}
        </Button>

        <Button
          onClick={handleLeaveCall}
          size="lg"
          variant="destructive"
          className="rounded-full w-14 h-14"
        >
          <PhoneOff className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
