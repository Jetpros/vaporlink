"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Phone,
  Search,
  MoreVertical,
  Mic,
  X,
  Reply,
  ArrowDown,
  FileText,
  Bell,
  BellOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/use-notifications";
import { formatTimeLeft } from "@/lib/utils";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import LeftSidebar from "./LeftSidebar";
import RoomSidebar from "./RoomSidebar";
import MediaUploadSelector from "./MediaUploadSelector";
import VoiceRecorder from "./VoiceRecorder";
import CountdownTimer from "./CountdownTimer";
import ExpiredRoomModal from "./ExpiredRoomModal";
import FileUploadModal from "./FileUploadModal";

interface ChatRoomProps {
  roomId: string;
  participantId: string;
  roomData: any;
}

export default function ChatRoom({
  roomId,
  participantId,
  roomData,
}: ChatRoomProps) {
  const router = useRouter();
  const { toast } = useToast();
  const {
    permission,
    isSupported,
    requestPermission,
    showMessageNotification,
  } = useNotifications();
  const [messages, setMessages] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>(
    roomData.participants || [],
  );
  const [message, setMessage] = useState("");
  const [typing, setTyping] = useState<string[]>([]);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [replyingTo, setReplyingTo] = useState<any | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [userScrolled, setUserScrolled] = useState(false);
  const [filePreviews, setFilePreviews] = useState<
    Array<{
      file: File;
      type: "image" | "video" | "file" | "audio";
      url: string;
      caption: string;
    }>
  >([]);
  const [showFileModal, setShowFileModal] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<
    string | null
  >(null);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const shouldAutoScrollRef = useRef(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previousMessagesRef = useRef<any[]>([]);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  // Auto-resize textarea based on message content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        144,
      )}px`;
    }
  }, [message]);

  // Check if room has expired
  useEffect(() => {
    const checkExpiration = () => {
      const now = new Date();
      const expiresAt = new Date(roomData.expiresAt);
      if (now > expiresAt) {
        setShowExpiredModal(true);
      }
    };

    // Check immediately
    checkExpiration();

    // Check every 10 seconds
    const interval = setInterval(checkExpiration, 10000);

    return () => clearInterval(interval);
  }, [roomData.expiresAt]);

  // Request notification permission on mount
  useEffect(() => {
    const checkNotificationPermission = async () => {
      if (isSupported && permission === "default") {
        // Show prompt after 3 seconds
        setTimeout(() => {
          setShowNotificationPrompt(true);
        }, 3000);
      }
    };

    checkNotificationPermission();
  }, [isSupported, permission]);

  // Detect new messages and show notifications
  useEffect(() => {
    if (messages.length === 0) {
      previousMessagesRef.current = messages;
      return;
    }

    // Find new messages
    const previousIds = new Set(previousMessagesRef.current.map((m) => m.id));
    const newMessages = messages.filter((m) => !previousIds.has(m.id));

    // Show notification for new messages from others
    newMessages.forEach((msg) => {
      if (msg.userId !== participantId) {
        showMessageNotification(
          msg.user?.displayName || "Someone",
          msg.content || "",
          msg.type,
        );
      }
    });

    previousMessagesRef.current = messages;
  }, [messages, participantId, showMessageNotification]);

  useEffect(() => {
    // Load initial messages
    fetchMessages();

    // TODO: Setup Socket.io connection
    // For now, we'll poll for messages every 2 seconds
    const interval = setInterval(() => {
      fetchMessages();
    }, 2000);

    // Cleanup on unmount or room change
    return () => {
      clearInterval(interval);
    };
  }, [roomId]);

  // Update participant's last seen on activity
  useEffect(() => {
    const updateLastSeen = async () => {
      try {
        await fetch(`/api/participants/${participantId}/seen`, {
          method: "POST",
        });
      } catch (error) {
        console.error("Error updating last seen:", error);
      }
    };

    // Update last seen every 30 seconds
    const lastSeenInterval = setInterval(updateLastSeen, 30000);

    return () => clearInterval(lastSeenInterval);
  }, [participantId]);

  // Smart scroll: only auto-scroll when explicitly triggered (user sends message)
  useEffect(() => {
    if (shouldAutoScrollRef.current && scrollContainerRef.current) {
      const scrollToBottom = () => {
        const container = scrollContainerRef.current;
        if (container) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: "smooth",
          });
        }
        shouldAutoScrollRef.current = false; // Reset after scrolling
      };

      const timer = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  // Detect when user scrolls
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

      console.log("Scroll detected:", {
        scrollTop,
        scrollHeight,
        clientHeight,
        isNearBottom,
      });
      setShowScrollButton(!isNearBottom);
      setUserScrolled(!isNearBottom);
    };

    // Check initial state
    handleScroll();

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages?roomId=${roomId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async (
    content?: string,
    type: string = "text",
    fileData?: any,
  ) => {
    const messageContent = content || message.trim();
    if (!messageContent && !fileData) return;

    try {
      const payload: any = {
        roomId,
        participantId,
        content: messageContent,
        type,
        replyToId: replyingTo?.id,
      };

      if (fileData) {
        // Handle multiple files
        if (fileData.files) {
          payload.fileUrl = JSON.stringify(fileData);
        } else {
          // Single file
          payload.fileUrl = fileData.url;
          payload.fileName = fileData.name;
          payload.fileSize = fileData.size;
          if (type === "voice") {
            payload.duration = fileData.duration;
          }
        }
      }

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setMessage("");
      setReplyingTo(null);

      // Always scroll to bottom when user sends a message
      shouldAutoScrollRef.current = true;
      setUserScrolled(false);

      fetchMessages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = async (
    file: File,
    type: "image" | "video" | "file" | "audio",
  ) => {
    const url = URL.createObjectURL(file);
    setFilePreviews([{ file, type, url, caption: "" }]);
    setShowFileModal(true);
  };

  const handleAddMoreFiles = () => {
    // Trigger file input
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = "image/*,video/*,audio/*,application/*";
    input.onchange = (e: any) => {
      const files = Array.from(e.target.files || []) as File[];
      const newPreviews = files.map((file) => {
        const url = URL.createObjectURL(file);
        let type: "image" | "video" | "file" | "audio" = "file";
        if (file.type.startsWith("image/")) type = "image";
        else if (file.type.startsWith("video/")) type = "video";
        else if (file.type.startsWith("audio/")) type = "audio";
        return { file, type, url, caption: "" };
      });
      setFilePreviews((prev) => [...prev, ...newPreviews]);
    };
    input.click();
  };

  const handleSendFiles = async (files: typeof filePreviews) => {
    setUploadingFile(true);
    setShowFileModal(false);

    try {
      // Get the first file's caption (shared caption for all files)
      const sharedCaption = files[0]?.caption || "";

      // Convert all files to base64
      const fileDataArray = await Promise.all(
        files.map(async (filePreview) => ({
          url: await fileToBase64(filePreview.file),
          name: filePreview.file.name,
          size: filePreview.file.size,
          type: filePreview.type,
        })),
      );

      // Send as a single message with multiple files
      await handleSendMessage(sharedCaption, "files", {
        files: fileDataArray,
        fileCount: files.length,
      });

      // Clean up
      files.forEach((f) => URL.revokeObjectURL(f.url));
      setFilePreviews([]);

      toast({
        title: "Success",
        description: `${files.length} file(s) uploaded successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload files",
        variant: "destructive",
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleCloseFileModal = () => {
    filePreviews.forEach((f) => URL.revokeObjectURL(f.url));
    setFilePreviews([]);
    setShowFileModal(false);
  };

  const handleVoiceRecording = async (audioBlob: Blob, duration: number) => {
    setIsRecordingVoice(false);
    setUploadingFile(true);

    try {
      // Convert blob to base64
      const base64 = await blobToBase64(audioBlob);

      await handleSendMessage("", "voice", {
        url: base64,
        name: `voice-${Date.now()}.webm`,
        size: audioBlob.size,
        duration,
      });

      toast({
        title: "Success",
        description: "Voice message sent",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send voice message",
        variant: "destructive",
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId,
          emoji,
        }),
      });

      if (response.ok) {
        fetchMessages();
      }
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  };

  // Helper functions
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Group consecutive messages from the same user
  const groupedMessages = messages.reduce((groups: any[], msg, index) => {
    const prevMsg = messages[index - 1];
    const nextMsg = messages[index + 1];

    const isFirstInGroup = !prevMsg || prevMsg.userId !== msg.userId;
    const isLastInGroup = !nextMsg || nextMsg.userId !== msg.userId;

    groups.push({
      ...msg,
      showAvatar: isLastInGroup,
      showName: isFirstInGroup,
      isLastInGroup,
    });

    return groups;
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLeave = () => {
    // Clear the session from localStorage
    localStorage.removeItem(`vaporlink_session_${roomId}`);
    router.push("/");
  };

  const scrollToMessage = (messageId: string) => {
    const messageElement = messageRefs.current[messageId];
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: "smooth", block: "center" });

      // Highlight the message
      setHighlightedMessageId(messageId);

      // Remove highlight after 1 second
      setTimeout(() => {
        setHighlightedMessageId(null);
      }, 1000);
    }
  };

  // Check if room is approaching expiration (within 30 minutes)
  const isApproachingExpiration = () => {
    const now = new Date();
    const expiresAt = new Date(roomData.expiresAt);
    const timeLeft = expiresAt.getTime() - now.getTime();
    const thirtyMinutes = 30 * 60 * 1000;
    return timeLeft > 0 && timeLeft <= thirtyMinutes;
  };

  const onlineParticipants = participants.filter((p) => p.isOnline);

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left Sidebar */}
      <LeftSidebar onLeave={handleLeave} />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Top Bar */}
        <header
          className={`border-b border-gray-200 bg-white ${
            isApproachingExpiration() ? "animate-pulse-red" : ""
          }`}
        >
          <div className="px-6 py-3 grid grid-cols-3 items-center">
            {/* Left: Room Info */}
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {roomData.name || "Chat Room"}
                </h1>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{participants.length} members</span>
                  <span className="text-gray-300">•</span>
                  <span>{onlineParticipants.length} online</span>
                </div>
              </div>
            </div>

            {/* Center: Countdown Timer */}
            <div className="flex justify-center">
              <CountdownTimer
                expiresAt={new Date(roomData.expiresAt)}
                firstJoinAt={
                  roomData.firstJoinAt ? new Date(roomData.firstJoinAt) : null
                }
              />
            </div>

            {/* Right: Actions */}
            <div className="flex items-center justify-end space-x-2">
              {/* Notification Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full relative"
                onClick={async () => {
                  if (permission === "granted") {
                    toast({
                      title: "Notifications Enabled",
                      description:
                        "You'll receive notifications for new messages",
                    });
                  } else {
                    const granted = await requestPermission();
                    if (granted) {
                      toast({
                        title: "Notifications Enabled",
                        description:
                          "You'll receive notifications for new messages",
                      });
                    } else {
                      toast({
                        title: "Notifications Blocked",
                        description:
                          "Please enable notifications in your browser settings",
                        variant: "destructive",
                      });
                    }
                  }
                }}
                title={
                  permission === "granted"
                    ? "Notifications enabled"
                    : "Enable notifications"
                }
              >
                {permission === "granted" ? (
                  <>
                    <Bell className="w-5 h-5 text-green-600" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  </>
                ) : (
                  <BellOff className="w-5 h-5 text-gray-400" />
                )}
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Search className="w-5 h-5 text-gray-600" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Phone className="w-5 h-5 text-gray-600" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </Button>
            </div>
          </div>
        </header>

        {/* Notification Permission Prompt */}
        {showNotificationPrompt && permission === "default" && (
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">Enable Desktop Notifications</p>
                <p className="text-sm text-white/90">
                  Get notified when you receive new messages
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={async () => {
                  await requestPermission();
                  setShowNotificationPrompt(false);
                }}
                size="sm"
                className="bg-white text-purple-600 hover:bg-white/90"
              >
                Enable
              </Button>
              <Button
                onClick={() => setShowNotificationPrompt(false)}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 relative overflow-hidden bg-white">
          {/* Animated Dots Background */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 100 }).map((_, i) => {
              const directions = [
                "translate(30px, -30px)",
                "translate(-30px, 30px)",
                "translate(30px, 30px)",
                "translate(-30px, -30px)",
                "translate(40px, 0)",
                "translate(-40px, 0)",
                "translate(0, 40px)",
                "translate(0, -40px)",
              ];
              const direction = directions[i % directions.length];

              return (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-black rounded-full"
                  style={
                    {
                      left: `${(i * 7.3) % 100}%`,
                      top: `${(i * 11.7) % 100}%`,
                      opacity: 0,
                      animation: `dot-fade-move ${
                        12 + (i % 6)
                      }s ease-in-out infinite`,
                      animationDelay: `${(i * 0.7) % 15}s`,
                      "--dot-transform": direction,
                    } as React.CSSProperties & { "--dot-transform": string }
                  }
                />
              );
            })}
          </div>

          <div
            ref={scrollContainerRef}
            className="h-full overflow-y-auto px-6 py-4 relative z-10"
          >
            <div ref={scrollRef} className="space-y-1 max-w-3xl mx-auto">
              {/* Expiration Info Banner */}
              <div className="mb-6 flex justify-center">
                <div
                  className={`inline-flex items-center rounded-full px-4 py-2 text-xs ${
                    isApproachingExpiration()
                      ? "bg-red-50 border border-red-200 text-red-700"
                      : "bg-amber-50 border border-amber-200 text-amber-700"
                  }`}
                >
                  <span className="font-medium">
                    {isApproachingExpiration()
                      ? "Chat expires soon"
                      : "Ephemeral chat"}
                  </span>
                </div>
              </div>

              {messages.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400">
                    No messages yet. Start the conversation!
                  </p>
                </div>
              )}

              {groupedMessages.map((msg) => (
                <div
                  key={msg.id}
                  ref={(el) => {
                    if (el) messageRefs.current[msg.id] = el;
                  }}
                >
                  <MessageBubble
                    message={msg}
                    isOwn={msg.userId === participantId}
                    showAvatar={msg.showAvatar}
                    showName={msg.showName}
                    isLastInGroup={msg.isLastInGroup}
                    currentUserId={participantId}
                    onReact={handleReaction}
                    onReply={(messageId) => {
                      const replyMsg = messages.find((m) => m.id === messageId);
                      if (replyMsg) setReplyingTo(replyMsg);
                    }}
                    onReplyClick={scrollToMessage}
                    isHighlighted={highlightedMessageId === msg.id}
                  />
                </div>
              ))}

              {typing.length > 0 && <TypingIndicator users={typing} />}

              {/* Invisible element to scroll to */}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Scroll to bottom button - always visible for testing */}
          <div
            className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-50 transition-opacity duration-300 ${
              showScrollButton ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <Button
              onClick={() => {
                shouldAutoScrollRef.current = true;
                setUserScrolled(false);
                if (scrollContainerRef.current) {
                  scrollContainerRef.current.scrollTo({
                    top: scrollContainerRef.current.scrollHeight,
                    behavior: "smooth",
                  });
                }
              }}
              className="rounded-full h-12 w-12 p-0 shadow-xl bg-indigo-500 hover:bg-indigo-600 text-white"
            >
              <ArrowDown className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Input Bar */}
        <div className="border-t border-gray-200 bg-white">
          {/* Reply Bar */}
          {replyingTo && (
            <div className="px-6 pt-4 pb-2 bg-gradient-to-b from-gray-50 to-white">
              <div className="max-w-3xl mx-auto">
                <div className="bg-white border border-indigo-200 rounded-xl px-4 py-3 shadow-sm flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-1 h-10 bg-indigo-500 rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Reply className="w-3.5 h-3.5 text-indigo-600" />
                      <p className="text-xs font-semibold text-indigo-700">
                        Replying to {replyingTo.user?.displayName}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {replyingTo.content || `[${replyingTo.type}]`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(null)}
                    className="h-7 w-7 p-0 rounded-full hover:bg-gray-100 flex-shrink-0"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isRecordingVoice ? (
            <div className="p-4">
              <div className="max-w-3xl mx-auto">
                <VoiceRecorder
                  onRecordingComplete={handleVoiceRecording}
                  onCancel={() => setIsRecordingVoice(false)}
                />
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className="max-w-3xl mx-auto flex items-center space-x-3">
                <MediaUploadSelector onFileSelect={handleFileSelect} />

                <div className="flex-1 bg-gray-100 rounded-3xl px-4 py-2.5">
                  <Textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Your message"
                    className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-900 placeholder:text-gray-500 p-0 resize-none min-h-[24px] max-h-[144px] overflow-y-auto"
                    disabled={uploadingFile}
                    rows={1}
                  />
                </div>

                {!message.trim() ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsRecordingVoice(true)}
                    className="text-gray-500 hover:text-gray-700 rounded-full"
                    disabled={uploadingFile}
                  >
                    <Mic className="w-5 h-5" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={uploadingFile}
                    size="icon"
                    className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-full disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <RoomSidebar
        roomData={roomData}
        participants={participants}
        messages={messages}
      />

      {/* Expired Room Modal */}
      <ExpiredRoomModal isOpen={showExpiredModal} />

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={showFileModal}
        files={filePreviews}
        onClose={handleCloseFileModal}
        onSend={handleSendFiles}
        onAddMore={handleAddMoreFiles}
        onFilesChange={setFilePreviews}
      />
    </div>
  );
}
