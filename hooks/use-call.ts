"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Socket } from "socket.io-client";

export interface CallParticipant {
  id: string;
  displayName: string;
  avatar: string;
  isMuted?: boolean;
  isVideoEnabled?: boolean;
}

export interface CallState {
  callId: string | null;
  status: 'idle' | 'ringing' | 'joining' | 'active' | 'ended';
  initiator: CallParticipant | null;
  participants: CallParticipant[];
  roomUrl?: string;
}

interface UseCallOptions {
  socket: Socket | null;
  roomId: string;
  participantId: string;
  currentParticipant: {
    displayName: string;
    avatar: string;
  };
  onIncomingCall?: (callId: string, initiator: CallParticipant) => void;
  onCallEnded?: () => void;
}

export function useCall({
  socket,
  roomId,
  participantId,
  currentParticipant,
  onIncomingCall,
  onCallEnded,
}: UseCallOptions) {
  const [callState, setCallState] = useState<CallState>({
    callId: null,
    status: 'idle',
    initiator: null,
    participants: [],
  });

  const callStateRef = useRef(callState);

  // Keep ref in sync
  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  // Start a call
  const startCall = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    console.log("📞 useCall: startCall called");
    console.log("📞 useCall: socket exists?", !!socket);
    console.log("📞 useCall: callState.status", callState.status);
    
    if (!socket) {
      console.log("❌ useCall: Socket not connected");
      return { success: false, error: "Socket not connected" };
    }

    if (callState.status !== 'idle') {
      console.log("❌ useCall: Call already in progress");
      return { success: false, error: "Call already in progress" };
    }

    console.log("📞 useCall: Emitting call:start event", { roomId, participantId });
    
    return new Promise((resolve) => {
      let timeoutId: NodeJS.Timeout;
      let responded = false;
      
      // Set timeout to detect if server doesn't respond
      timeoutId = setTimeout(() => {
        if (!responded) {
          console.log("❌ useCall: Server did not respond within 5 seconds");
          resolve({ success: false, error: "Server timeout - no response" });
        }
      }, 5000);
      
      socket.emit("call:start", { roomId, participantId }, (response: any) => {
        responded = true;
        clearTimeout(timeoutId);
        console.log("📞 useCall: Received response from server:", response);
        
        if (response && response.success) {
          console.log("✅ useCall: Call started successfully, updating state");
          console.log("📞 Daily room URL:", response.roomUrl);
          setCallState({
            callId: response.callId,
            status: 'active',
            roomUrl: response.roomUrl,
            initiator: {
              id: participantId,
              displayName: currentParticipant.displayName,
              avatar: currentParticipant.avatar,
            },
            participants: [
              {
                id: participantId,
                displayName: currentParticipant.displayName,
                avatar: currentParticipant.avatar,
                isMuted: false,
                isVideoEnabled: true,
              },
            ],
          });
          resolve({ success: true });
        } else {
          console.log("❌ useCall: Call start failed:", response?.error || "Unknown error");
          resolve({ success: false, error: response?.error || "Unknown error" });
        }
      });
    });
  }, [socket, roomId, participantId, currentParticipant, callState.status]);

  // Accept incoming call
  const acceptCall = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!socket || !callState.callId) {
      return { success: false, error: "No active call to accept" };
    }

    return new Promise((resolve) => {
      socket.emit(
        "call:accept",
        { callId: callState.callId, participantId },
        (response: any) => {
          if (response.success) {
            setCallState((prev) => ({
              ...prev,
              status: 'active',
              roomUrl: response.roomUrl,
              participants: [
                ...prev.participants,
                {
                  id: participantId,
                  displayName: currentParticipant.displayName,
                  avatar: currentParticipant.avatar,
                },
              ],
            }));
            resolve({ success: true });
          } else {
            resolve({ success: false, error: response.error });
          }
        }
      );
    });
  }, [socket, callState.callId, participantId, currentParticipant]);

  // Decline incoming call
  const declineCall = useCallback(() => {
    if (!socket || !callState.callId) return;

    socket.emit("call:decline", { callId: callState.callId, participantId });
    
    // Keep call info but change status to show indicator
    setCallState((prev) => ({
      ...prev,
      status: 'idle', // User declined, but call is still active for others
    }));
  }, [socket, callState.callId, participantId]);

  // Join an ongoing call
  const joinCall = useCallback(async (callId: string): Promise<{ success: boolean; error?: string }> => {
    if (!socket) {
      return { success: false, error: "Socket not connected" };
    }

    return new Promise((resolve) => {
      socket.emit("call:join", { callId, participantId }, (response: any) => {
        if (response.success) {
          setCallState((prev) => ({
            ...prev,
            callId,
            status: 'active',
            roomUrl: response.roomUrl,
            participants: [
              ...prev.participants,
              {
                id: participantId,
                displayName: currentParticipant.displayName,
                avatar: currentParticipant.avatar,
              },
            ],
          }));
          resolve({ success: true });
        } else {
          resolve({ success: false, error: response.error });
        }
      });
    });
  }, [socket, participantId, currentParticipant]);

  // Leave call
  const leaveCall = useCallback(() => {
    if (!socket || !callState.callId) return;

    socket.emit("call:leave", { callId: callState.callId, participantId });
    
    setCallState({
      callId: null,
      status: 'idle',
      initiator: null,
      participants: [],
    });
  }, [socket, callState.callId, participantId]);

  // Toggle audio
  const toggleAudio = useCallback((isMuted: boolean) => {
    if (!socket || !callState.callId) return;

    socket.emit("call:toggle-audio", {
      callId: callState.callId,
      participantId,
      isMuted,
    });
  }, [socket, callState.callId, participantId]);

  // Toggle video
  const toggleVideo = useCallback((isVideoEnabled: boolean) => {
    if (!socket || !callState.callId) return;

    socket.emit("call:toggle-video", {
      callId: callState.callId,
      participantId,
      isVideoEnabled,
    });
  }, [socket, callState.callId, participantId]);

  // Listen to socket events
  useEffect(() => {
    if (!socket) return;

    // Incoming call
    const handleIncomingCall = (data: {
      callId: string;
      initiator: CallParticipant;
    }) => {
      console.log("📞 Incoming call from:", data.initiator.displayName);
      
      setCallState({
        callId: data.callId,
        status: 'ringing',
        initiator: data.initiator,
        participants: [data.initiator],
      });

      if (onIncomingCall) {
        onIncomingCall(data.callId, data.initiator);
      }
    };

    // Participant joined
    const handleParticipantJoined = (data: {
      callId: string;
      participant: CallParticipant;
    }) => {
      console.log("📞 Participant joined call:", data.participant.displayName);
      
      setCallState((prev) => {
        // Don't add if already in list
        if (prev.participants.some((p) => p.id === data.participant.id)) {
          return prev;
        }
        
        return {
          ...prev,
          participants: [...prev.participants, data.participant],
        };
      });
    };

    // Participant left
    const handleParticipantLeft = (data: {
      callId: string;
      participantId: string;
    }) => {
      console.log("📞 Participant left call:", data.participantId);
      
      setCallState((prev) => ({
        ...prev,
        participants: prev.participants.filter((p) => p.id !== data.participantId),
      }));
    };

    // Participant updated (mute/video)
    const handleParticipantUpdated = (data: {
      callId: string;
      participantId: string;
      isMuted?: boolean;
      isVideoEnabled?: boolean;
    }) => {
      console.log("📞 Participant updated:", data.participantId);
      
      setCallState((prev) => ({
        ...prev,
        participants: prev.participants.map((p) =>
          p.id === data.participantId
            ? {
                ...p,
                isMuted: data.isMuted ?? p.isMuted,
                isVideoEnabled: data.isVideoEnabled ?? p.isVideoEnabled,
              }
            : p
        ),
      }));
    };

    // Call ended
    const handleCallEnded = (data: { callId: string }) => {
      console.log("📞 Call ended:", data.callId);
      
      setCallState({
        callId: null,
        status: 'ended',
        initiator: null,
        participants: [],
      });

      if (onCallEnded) {
        onCallEnded();
      }

      // Reset to idle after a short delay
      setTimeout(() => {
        setCallState((prev) => 
          prev.status === 'ended' 
            ? { ...prev, status: 'idle' }
            : prev
        );
      }, 3000);
    };

    socket.on("call:incoming", handleIncomingCall);
    socket.on("call:participant-joined", handleParticipantJoined);
    socket.on("call:participant-left", handleParticipantLeft);
    socket.on("call:participant-updated", handleParticipantUpdated);
    socket.on("call:ended", handleCallEnded);

    return () => {
      socket.off("call:incoming", handleIncomingCall);
      socket.off("call:participant-joined", handleParticipantJoined);
      socket.off("call:participant-left", handleParticipantLeft);
      socket.off("call:participant-updated", handleParticipantUpdated);
      socket.off("call:ended", handleCallEnded);
    };
  }, [socket, onIncomingCall, onCallEnded]);

  return {
    callState,
    startCall,
    acceptCall,
    declineCall,
    joinCall,
    leaveCall,
    toggleAudio,
    toggleVideo,
  };
}
