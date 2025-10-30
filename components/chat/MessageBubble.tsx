"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getRelativeTime } from "@/lib/utils";
import { File, Eye, Reply, Smile } from "lucide-react";
import VoiceMessage from "./VoiceMessage";
import MessageReactions from "./MessageReactions";
import LinkifiedText from "./LinkifiedText";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏", "👏", "🔥"];

interface MessageBubbleProps {
  message: any;
  isOwn: boolean;
  showAvatar?: boolean;
  showName?: boolean;
  isLastInGroup?: boolean;
  currentUserId: string;
  onReact?: (messageId: string, emoji: string) => void;
  onReply?: (messageId: string) => void;
  onReplyClick?: (messageId: string) => void;
  isHighlighted?: boolean;
}

export default function MessageBubble({
  message,
  isOwn,
  showAvatar = true,
  showName = true,
  isLastInGroup = true,
  currentUserId,
  onReact,
  onReply,
  onReplyClick,
  isHighlighted = false,
}: MessageBubbleProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderContent = () => {
    const isUploading = message.status === "uploading";
    const blurClass = isUploading ? "blur-sm" : "";
    const transitionClass = "transition-all duration-300 ease-in-out";

    // Calculate display dimensions while maintaining aspect ratio and max constraints
    const calculateDisplayDimensions = (width?: number, height?: number) => {
      if (!width || !height) return {};

      const maxWidth = 384; // max-w-sm = 384px
      const maxHeight = 320; // max-h-80 = 320px

      let displayWidth = width;
      let displayHeight = height;

      // Scale down if exceeds max width
      if (displayWidth > maxWidth) {
        const ratio = maxWidth / displayWidth;
        displayWidth = maxWidth;
        displayHeight = displayHeight * ratio;
      }

      // Scale down if exceeds max height
      if (displayHeight > maxHeight) {
        const ratio = maxHeight / displayHeight;
        displayHeight = maxHeight;
        displayWidth = displayWidth * ratio;
      }

      return {
        width: `${Math.round(displayWidth)}px`,
        height: `${Math.round(displayHeight)}px`,
      };
    };

    switch (message.type) {
      case "image":
        const imageDimensions = calculateDisplayDimensions(
          message.mediaWidth,
          message.mediaHeight
        );
        const hasExplicitDimensions = message.mediaWidth && message.mediaHeight;

        // Debug logging
        if (message.type === "image") {
          console.log(`📐 Image dimensions for message ${message.id}:`, {
            mediaWidth: message.mediaWidth,
            mediaHeight: message.mediaHeight,
            hasExplicitDimensions,
            calculatedDimensions: imageDimensions,
          });
        }

        return (
          <div className="space-y-2">
            <div
              className={`relative group cursor-pointer`}
              onClick={() =>
                !isUploading ? setImagePreview(message.fileUrl) : undefined
              }
              style={hasExplicitDimensions ? imageDimensions : undefined}
            >
              <img
                src={message.fileUrl}
                alt="Shared image"
                className={`rounded-lg ${
                  hasExplicitDimensions ? "w-full h-full" : "max-w-sm max-h-80"
                } object-cover ${blurClass} ${transitionClass}`}
                style={hasExplicitDimensions ? imageDimensions : undefined}
              />

              {/* Loading spinner overlay */}
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                  <div className="flex flex-col items-center gap-2">
                    <svg
                      className="w-8 h-8 text-white animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </div>
                </div>
              )}

              {message.viewCount > 0 && (
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{message.viewCount}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
            </div>
            {message.content && (
              <p
                className="text-sm break-words whitespace-pre-wrap"
                style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
              >
                {message.content}
              </p>
            )}
          </div>
        );

      case "video":
        const videoDimensions = calculateDisplayDimensions(
          message.mediaWidth,
          message.mediaHeight
        );
        const hasExplicitVideoDimensions =
          message.mediaWidth && message.mediaHeight;
        return (
          <div className="space-y-2">
            <div
              className="relative"
              style={hasExplicitVideoDimensions ? videoDimensions : undefined}
            >
              <video
                src={message.fileUrl}
                controls
                className={`rounded-lg ${
                  hasExplicitVideoDimensions
                    ? "w-full h-full"
                    : "max-w-sm max-h-80"
                } ${blurClass} ${transitionClass}`}
                style={hasExplicitVideoDimensions ? videoDimensions : undefined}
              />

              {/* Loading spinner overlay */}
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg pointer-events-none">
                  <div className="flex flex-col items-center gap-2">
                    <svg
                      className="w-8 h-8 text-white animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {message.viewCount > 0 && (
              <div className="flex items-center space-x-1 text-xs opacity-70">
                <Eye className="w-3 h-3" />
                <span>{message.viewCount}</span>
              </div>
            )}
            {message.content && (
              <p
                className="text-sm break-words"
                style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
              >
                {message.content}
              </p>
            )}
          </div>
        );

      case "audio":
      case "voice":
        return (
          <div className="space-y-2">
            <div className={`relative ${transitionClass}`}>
              <div className={`${blurClass} ${transitionClass}`}>
                <VoiceMessage
                  audioUrl={message.fileUrl}
                  duration={message.duration || 0}
                  isOwn={isOwn}
                />
              </div>

              {/* Loading spinner overlay */}
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                  <div className="flex flex-col items-center gap-2">
                    <svg
                      className="w-6 h-6 text-white animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>
            {message.content && (
              <p
                className="text-sm mt-2 break-words whitespace-pre-wrap"
                style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
              >
                {message.content}
              </p>
            )}
          </div>
        );

      case "files":
        // Multiple files in one message
        let filesData = [];
        try {
          const parsed = JSON.parse(message.fileUrl);
          filesData = parsed.files || [];
        } catch (e) {
          console.error("Error parsing files data:", e);
        }

        return (
          <div className="space-y-2">
            <div
              className={`grid gap-2 ${
                filesData.length === 1 ? "grid-cols-1" : "grid-cols-2"
              } max-w-sm`}
            >
              {filesData.map((file: any, index: number) => (
                <a
                  key={index}
                  href={file.url}
                  download={file.name}
                  className={`flex p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors ${
                    filesData.length === 1
                      ? "items-center space-x-3"
                      : "flex-col items-center"
                  }`}
                >
                  <File
                    className={`${
                      filesData.length === 1 ? "w-8 h-8" : "w-10 h-10 mb-2"
                    } ${isOwn ? "text-white" : "text-indigo-600"}`}
                  />
                  <div
                    className={`${
                      filesData.length === 1 ? "flex-1 min-w-0" : "w-full"
                    }`}
                  >
                    <p
                      className={`font-medium text-xs truncate ${
                        filesData.length === 1 ? "text-left" : "text-center"
                      }`}
                    >
                      {file.name}
                    </p>
                    <p
                      className={`text-xs opacity-70 ${
                        filesData.length === 1 ? "text-left" : "text-center"
                      }`}
                    >
                      {file.size ? `${(file.size / 1024).toFixed(1)} KB` : ""}
                    </p>
                  </div>
                </a>
              ))}
            </div>
            {message.content && (
              <p
                className="text-sm break-words"
                style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
              >
                {message.content}
              </p>
            )}
          </div>
        );

      case "file":
        return (
          <div className="space-y-2">
            <a
              href={message.fileUrl}
              download={message.fileName}
              className="flex items-center space-x-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <File
                className={`w-8 h-8 ${
                  isOwn ? "text-white" : "text-indigo-600"
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {message.fileName}
                </p>
                <p className="text-xs opacity-70">
                  {message.fileSize
                    ? `${(message.fileSize / 1024).toFixed(1)} KB`
                    : "File"}
                </p>
              </div>
            </a>
            {message.content && (
              <p
                className="text-sm break-words"
                style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
              >
                {message.content}
              </p>
            )}
          </div>
        );

      default:
        return (
          <p
            className="whitespace-pre-wrap break-words"
            style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
          >
            <LinkifiedText text={message.content} />
          </p>
        );
    }
  };

  return (
    <>
      <div
        className={`flex items-end gap-2 group hover:bg-gray-50/50 px-2 rounded-lg transition-colors ${
          isOwn ? "flex-row-reverse" : ""
        } ${showAvatar ? "mb-2" : "mb-0.5"}`}
      >
        {/* Left avatar slot (for others' messages when not isOwn) */}
        {showAvatar ? (
          <Avatar className="w-9 h-9 flex-shrink-0">
            <AvatarImage src={message.user?.avatar} />
            <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
              {message.user?.displayName?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-9 flex-shrink-0" />
        )}

        <div
          className={`flex flex-col ${
            isOwn ? "items-end" : "items-start"
          } max-w-[70%] min-w-0`}
        >
          {/* Show name only if showName is true */}
          {!isOwn && showName && (
            <p className="text-sm font-semibold text-gray-700 mb-1 px-1">
              {message.user?.displayName}
            </p>
          )}

          {/* Reply preview outside bubble */}
          {message.replyTo && (
            <div className="mb-2 max-w-full">
              <div
                onClick={() => onReplyClick && onReplyClick(message.replyTo.id)}
                className={`px-3 py-2 rounded-lg border-l-2 cursor-pointer transition-all hover:scale-[1.02] ${
                  isOwn
                    ? "bg-indigo-50 border-indigo-400 hover:bg-indigo-100"
                    : "bg-gray-50 border-gray-400 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Reply
                    className={`w-3 h-3 ${
                      isOwn ? "text-indigo-600" : "text-gray-500"
                    }`}
                  />
                  <p
                    className={`text-xs font-semibold ${
                      isOwn ? "text-indigo-700" : "text-gray-700"
                    }`}
                  >
                    {message.replyTo.user?.displayName}
                  </p>
                </div>
                <p
                  className={`text-xs ${
                    isOwn ? "text-indigo-600" : "text-gray-600"
                  } line-clamp-2`}
                >
                  {message.replyTo.content || `[${message.replyTo.type}]`}
                </p>
              </div>
            </div>
          )}

          <div className="relative group/message">
            <div
              className={`inline-block px-4 py-2.5 transition-all duration-500 break-words overflow-wrap-anywhere ${
                isOwn
                  ? `${
                      isHighlighted
                        ? "bg-indigo-50 text-indigo-700 shadow-xl"
                        : "bg-indigo-500 text-white"
                    } ${
                      isLastInGroup
                        ? "rounded-[14px] rounded-br-[4px]"
                        : "rounded-[14px]"
                    }`
                  : `${
                      isHighlighted ? "bg-indigo-100 shadow-lg" : "bg-gray-100"
                    } text-gray-900 ${
                      isLastInGroup
                        ? "rounded-[14px] rounded-bl-[4px]"
                        : "rounded-[14px]"
                    }`
              }`}
              style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
            >
              <div className="text-[15px] leading-relaxed max-w-full">
                {renderContent()}
              </div>
              {/* Reactions outside bubble on the left */}
              {onReact && message.reactions && message.reactions.length > 0 && (
                <div
                  className={`absolute bottom-1 ${
                    isOwn ? "right-full mr-2" : "left-full ml-2"
                  } z-10`}
                >
                  <MessageReactions
                    messageId={message.id}
                    reactions={message.reactions || []}
                    currentUserId={currentUserId}
                    onReact={(emoji) => {
                      onReact(message.id, emoji);
                      setShowReactionPicker(false);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Hover actions */}
            <div
              className={`absolute top-0 ${
                isOwn ? "left-0 -translate-x-full" : "right-0 translate-x-full"
              } opacity-0 group-hover/message:opacity-100 transition-opacity flex items-center gap-1 px-2`}
            >
              {onReact && (
                <Popover
                  open={showReactionPicker}
                  onOpenChange={setShowReactionPicker}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 rounded-full bg-white shadow-sm hover:bg-gray-100"
                    >
                      <Smile className="w-4 h-4 text-gray-600" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2" align="start">
                    <div className="grid grid-cols-4 gap-1">
                      {QUICK_REACTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            onReact(message.id, emoji);
                            setShowReactionPicker(false);
                          }}
                          className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 rounded transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
              {onReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-full bg-white shadow-sm hover:bg-gray-100"
                  onClick={() => onReply(message.id)}
                >
                  <Reply className="w-4 h-4 text-gray-600" />
                </Button>
              )}
            </div>
          </div>

          {/* Timestamp below bubble - elegant and minimal */}
          <div
            className={`flex items-center gap-1.5 mt-1 px-1 ${
              isOwn ? "justify-end" : "justify-start"
            }`}
          >
            <span className="text-[10px] text-gray-400">
              {formatTime(new Date(message.createdAt))}
            </span>
            {isOwn && (
              <>
                {/* Status indicator for uploading messages */}
                {message.status === "uploading" && (
                  <div className="flex items-center gap-1">
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                        style={{ width: `${message.uploadProgress || 0}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-gray-400 font-medium">
                      {message.uploadProgress || 0}%
                    </span>
                  </div>
                )}
                {/* Status indicator for sent messages */}
                {message.status === "pending" && (
                  <svg
                    className="w-3 h-3 text-gray-400 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                )}
                {message.status === "sent" && (
                  <svg
                    className="w-2.5 h-2.5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {message.status === "failed" && (
                  <svg
                    className="w-2.5 h-2.5 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {/* Fallback checkmark for old messages without status */}
                {!message.status && (
                  <svg
                    className="w-2.5 h-2.5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
        <DialogContent className="max-w-4xl bg-black/95 border-0">
          <img
            src={imagePreview || ""}
            alt="Preview"
            className="w-full h-auto rounded-lg"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
