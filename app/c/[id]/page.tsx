"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import JoinScreen from "@/components/chat/JoinScreen";
import ChatRoom from "@/components/chat/ChatRoom";
import ExpiredRoomModal from "@/components/chat/ExpiredRoomModal";
import NotFoundRoom from "@/components/chat/NotFoundRoom";
import { useToast } from "@/hooks/use-toast";

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [hasJoined, setHasJoined] = useState(false);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [roomData, setRoomData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [roomNotFound, setRoomNotFound] = useState(false);

  const roomId = params.id as string;

  useEffect(() => {
    // Check if user was already in this room
    const storedSession = localStorage.getItem(`vaporlink_session_${roomId}`);
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession);
        // Verify the session is still valid
        verifyAndRestoreSession(session);
      } catch (error) {
        console.error("Error parsing stored session:", error);
        localStorage.removeItem(`vaporlink_session_${roomId}`);
      }
    }
    fetchRoomData();
  }, [roomId]);

  const verifyAndRestoreSession = async (session: any) => {
    try {
      // Verify the participant still exists in the room
      const response = await fetch(`/api/rooms/${roomId}`);
      if (response.ok) {
        const data = await response.json();
        const participantExists = data.room.participants?.some(
          (p: any) => p.id === session.participantId
        );

        if (participantExists) {
          setParticipantId(session.participantId);
          setHasJoined(true);
        } else {
          // Participant no longer exists, clear session
          localStorage.removeItem(`vaporlink_session_${roomId}`);
        }
      }
    } catch (error) {
      console.error("Error verifying session:", error);
      localStorage.removeItem(`vaporlink_session_${roomId}`);
    }
  };

  const fetchRoomData = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}`);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          localStorage.removeItem(`vaporlink_session_${roomId}`);
          setRoomNotFound(true);
          setLoading(false);
          return;
        }

        if (response.status === 410) {
          localStorage.removeItem(`vaporlink_session_${roomId}`);
          setShowExpiredModal(true);
          setLoading(false);
          return;
        }

        throw new Error(data.error);
      }

      setRoomData(data.room);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load room",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (
    displayName: string,
    avatar: string,
    password?: string
  ) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          avatar,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to join room");
      }

      // Store session in localStorage
      const session = {
        participantId: data.participant.id,
        displayName: data.participant.displayName,
        avatar: data.participant.avatar,
        joinedAt: new Date().toISOString(),
      };
      localStorage.setItem(
        `vaporlink_session_${roomId}`,
        JSON.stringify(session)
      );

      // Refresh room data to get updated firstJoinAt and expiresAt
      await fetchRoomData();

      setParticipantId(data.participant.id);
      setHasJoined(true);
    } catch (error: any) {
      throw error;
    }
  };

  // Show 404 if room not found
  if (roomNotFound) {
    return <NotFoundRoom />;
  }

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/20 to-black flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-neon-pink/20 border-t-neon-pink rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading room...</p>
          </div>
        </div>
        <ExpiredRoomModal isOpen={showExpiredModal} />
      </>
    );
  }

  if (!hasJoined) {
    return (
      <>
        <JoinScreen roomData={roomData} onJoin={handleJoin} />
        <ExpiredRoomModal isOpen={showExpiredModal} />
      </>
    );
  }

  return (
    <>
      <ChatRoom
        roomId={roomId}
        participantId={participantId!}
        roomData={roomData}
      />
      <ExpiredRoomModal isOpen={showExpiredModal} />
    </>
  );
}
