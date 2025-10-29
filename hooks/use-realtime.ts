"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface Message {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  type: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  duration?: number;
  createdAt: string;
  replyToId?: string;
  user?: any;
  reactions?: any[];
  replyTo?: any;
}

interface Participant {
  id: string;
  roomId: string;
  displayName: string;
  avatar: string;
  isOnline: boolean;
  lastSeenAt: string;
}

interface RealtimeCallbacks {
  onNewMessage?: (message: Message) => void;
  onMessageUpdate?: (message: Message) => void;
  onMessageDelete?: (messageId: string) => void;
  onParticipantJoin?: (participant: Participant) => void;
  onParticipantLeave?: (participantId: string) => void;
  onParticipantUpdate?: (participant: Participant) => void;
  onTyping?: (
    participantId: string,
    displayName: string,
    avatar: string,
  ) => void;
  onStopTyping?: (participantId: string) => void;
  onReaction?: (data: {
    messageId: string;
    userId: string;
    emoji: string;
  }) => void;
}

interface UseRealtimeOptions {
  roomId: string;
  participantId: string;
  callbacks?: RealtimeCallbacks;
  enabled?: boolean;
}

export function useRealtime({
  roomId,
  participantId,
  callbacks = {},
  enabled = true,
}: UseRealtimeOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const callbacksRef = useRef(callbacks);

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  // Check if Supabase is configured
  useEffect(() => {
    setIsSupported(isSupabaseConfigured());
  }, []);

  // Broadcast typing indicator
  const broadcastTyping = useCallback(
    (isTyping: boolean, displayName?: string, avatar?: string) => {
      if (!channelRef.current || !isSupported) return;

      channelRef.current.send({
        type: "broadcast",
        event: isTyping ? "typing" : "stop-typing",
        payload: {
          participantId,
          displayName,
          avatar,
          timestamp: new Date().toISOString(),
        },
      });
    },
    [participantId, isSupported],
  );

  // Broadcast custom event
  const broadcast = useCallback(
    (event: string, payload: any) => {
      if (!channelRef.current || !isSupported) return;

      channelRef.current.send({
        type: "broadcast",
        event,
        payload: {
          ...payload,
          participantId,
          timestamp: new Date().toISOString(),
        },
      });
    },
    [participantId, isSupported],
  );

  // Setup realtime subscription
  useEffect(() => {
    if (!enabled || !isSupported || !roomId || !participantId) {
      return;
    }

    console.log(
      "🔌 Setting up Supabase realtime subscription for room:",
      roomId,
    );
    console.log("🔌 Participant ID:", participantId);

    // Create channel for this room
    const channel = supabase.channel(`room:${roomId}`, {
      config: {
        broadcast: { self: false }, // Don't receive own broadcasts
        presence: { key: participantId },
      },
    });

    // Subscribe to database changes for messages
    console.log("🔍 Setting up Message table subscription with filter: roomId=eq." + roomId);
    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
          filter: `roomId=eq.${roomId}`,
        },
        (payload) => {
          console.log("🚨🚨🚨 NEW MESSAGE EVENT from Supabase! 🚨🚨🚨");
          console.log("📋 Event type:", payload.eventType);
          console.log("📋 Schema:", payload.schema);
          console.log("📋 Table:", payload.table);
          console.log("📋 New data:", JSON.stringify(payload.new, null, 2));
          console.log("📋 Old data:", payload.old);
          console.log("📋 Errors:", payload.errors);
          
          if (callbacksRef.current.onNewMessage) {
            console.log("✅ Calling onNewMessage callback with data:", payload.new);
            callbacksRef.current.onNewMessage(payload.new as Message);
          } else {
            console.log("⚠️⚠️⚠️ No onNewMessage callback defined!");
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Message",
          filter: `roomId=eq.${roomId}`,
        },
        (payload) => {
          console.log("📝 MESSAGE UPDATED from Supabase:", payload);
          if (callbacksRef.current.onMessageUpdate) {
            callbacksRef.current.onMessageUpdate(payload.new as Message);
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "Message",
          filter: `roomId=eq.${roomId}`,
        },
        (payload) => {
          console.log("🗑️ MESSAGE DELETED from Supabase:", payload);
          if (callbacksRef.current.onMessageDelete) {
            callbacksRef.current.onMessageDelete(payload.old.id);
          }
        },
      );

    // Subscribe to participant changes
    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Participant",
          filter: `roomId=eq.${roomId}`,
        },
        (payload) => {
          console.log("👤 PARTICIPANT JOINED from Supabase:", payload);
          if (callbacksRef.current.onParticipantJoin) {
            callbacksRef.current.onParticipantJoin(payload.new as Participant);
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Participant",
          filter: `roomId=eq.${roomId}`,
        },
        (payload) => {
          console.log("👤 PARTICIPANT UPDATED from Supabase:", payload);
          if (callbacksRef.current.onParticipantUpdate) {
            callbacksRef.current.onParticipantUpdate(
              payload.new as Participant,
            );
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "Participant",
          filter: `roomId=eq.${roomId}`,
        },
        (payload) => {
          console.log("👤 PARTICIPANT LEFT from Supabase:", payload);
          if (callbacksRef.current.onParticipantLeave) {
            callbacksRef.current.onParticipantLeave(payload.old.id);
          }
        },
      );

    // Subscribe to reaction changes
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "Reaction",
      },
      (payload) => {
        console.log("💖 REACTION EVENT from Supabase:", payload);
        if (callbacksRef.current.onReaction && payload.new) {
          const newData = payload.new as any;
          callbacksRef.current.onReaction({
            messageId: newData.messageId,
            userId: newData.userId,
            emoji: newData.emoji,
          });
        }
      },
    );

    // Subscribe to broadcast events (typing, custom events)
    channel
      .on("broadcast", { event: "typing" }, (payload) => {
        console.log("⌨️ TYPING BROADCAST:", payload.payload.displayName);
        if (
          callbacksRef.current.onTyping &&
          payload.payload.participantId !== participantId
        ) {
          callbacksRef.current.onTyping(
            payload.payload.participantId,
            payload.payload.displayName || "Someone",
            payload.payload.avatar || "",
          );
        }
      })
      .on("broadcast", { event: "stop-typing" }, (payload) => {
        console.log("⌨️ STOP TYPING BROADCAST:", payload.payload.displayName);
        if (
          callbacksRef.current.onStopTyping &&
          payload.payload.participantId !== participantId
        ) {
          callbacksRef.current.onStopTyping(payload.payload.participantId);
        }
      });

    // Subscribe to presence (online/offline status)
    channel
      .on("presence", { event: "sync" }, () => {
        const presenceState = channel.presenceState();
        console.log(
          "👥 PRESENCE SYNCED:",
          Object.keys(presenceState).length,
          "users",
        );
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("👥 PRESENCE JOIN:", key);
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        console.log("👥 PRESENCE LEAVE:", key);
      });

    // Subscribe to the channel
    channel.subscribe((status, err) => {
      console.log("🔔 SUPABASE REALTIME STATUS:", status);
      if (err) {
        console.error("❌ SUBSCRIPTION ERROR:", err);
      }
      
      if (status === "SUBSCRIBED") {
        setIsConnected(true);
        console.log("✅✅✅ Successfully connected to Supabase realtime! ✅✅✅");
        console.log("🔍 Room ID:", roomId);
        console.log("🔍 Participant ID:", participantId);
        console.log("🔍 Channel name:", `room:${roomId}`);
        console.log(
          "✅ Listening for Message table changes (INSERT/UPDATE/DELETE) with filter: roomId=eq." + roomId,
        );
        console.log("✅ Listening for Participant table changes");
        console.log("✅ Listening for Reaction table changes");
        console.log("✅ Listening for broadcast events (typing)");
        console.log(
          "⚠️⚠️⚠️ IMPORTANT: Message events require REPLICATION to be enabled in Supabase Dashboard!",
        );
        console.log(
          "👉 Go to: Database > Replication > Enable 'Message' table",
        );

        // Track presence
        channel.track({
          participantId,
          online_at: new Date().toISOString(),
        });
      } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
        setIsConnected(false);
        console.error("❌ Realtime connection closed or error:", status);
      }
    });

    channelRef.current = channel;

    // Cleanup on unmount
    return () => {
      console.log("🧹 Cleaning up Supabase realtime subscription");
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setIsConnected(false);
    };
  }, [enabled, isSupported, roomId, participantId]);

  return {
    isConnected,
    isSupported,
    broadcastTyping,
    broadcast,
  };
}
