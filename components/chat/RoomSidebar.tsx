"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronDown,
  ChevronUp,
  X,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Link2,
  Mic,
  Copy,
  Check,
  Share2,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { extractAllLinksFromMessages, getDomain } from "@/lib/linkUtils";

interface RoomSidebarProps {
  roomData: any;
  participants: any[];
  messages?: any[];
  onClose?: () => void;
}

export default function RoomSidebar({
  roomData,
  participants,
  messages = [],
  onClose,
}: RoomSidebarProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    photos: true,
    videos: false,
    files: false,
    audio: false,
    links: false,
    voice: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const roomLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/c/${roomData.uniqueId}`
      : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(roomLink);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Room link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: roomData.name || "Join my chat",
          text: "Join this ephemeral chat room!",
          url: roomLink,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      handleCopyLink();
    }
  };

  // Extract links from text messages
  const extractedLinks = extractAllLinksFromMessages(messages);

  // Calculate real file statistics from messages
  // Count files from both "file" and "files" types
  let totalFiles = messages.filter((m) => m.type === "file").length;

  // Add files from "files" type messages
  messages
    .filter((m) => m.type === "files")
    .forEach((m) => {
      try {
        const parsed = JSON.parse(m.fileUrl);
        totalFiles += parsed.files?.length || 0;
      } catch (e) {
        // Ignore parse errors
      }
    });

  const fileStats = {
    photos: messages.filter((m) => m.type === "image").length,
    videos: messages.filter((m) => m.type === "video").length,
    files: totalFiles,
    audio: messages.filter((m) => m.type === "audio").length,
    links: extractedLinks.length,
    voice: messages.filter((m) => m.type === "voice").length,
  };

  // Get actual media for previews - sorted by latest first
  const photoMessages = messages
    .filter((m) => m.type === "image")
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 6);
  const videoMessages = messages
    .filter((m) => m.type === "video")
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  // Get file messages from both "file" and "files" types
  const singleFileMessages = messages.filter((m) => m.type === "file");
  const multiFileMessages = messages.filter((m) => m.type === "files");

  // Flatten multi-file messages into individual file objects
  const expandedFiles: any[] = [];
  singleFileMessages.forEach((m) => {
    expandedFiles.push({
      id: m.id,
      fileName: m.fileName,
      fileUrl: m.fileUrl,
      fileSize: m.fileSize,
      userName: m.user?.displayName,
      userId: m.user?.id,
      createdAt: m.createdAt,
    });
  });
  multiFileMessages.forEach((m) => {
    try {
      const parsed = JSON.parse(m.fileUrl);
      parsed.files?.forEach((file: any) => {
        expandedFiles.push({
          id: `${m.id}-${file.name}`,
          fileName: file.name,
          fileUrl: file.url,
          fileSize: file.size,
          userName: m.user?.displayName,
          userId: m.user?.id,
          createdAt: m.createdAt,
        });
      });
    } catch (e) {
      // Ignore parse errors
    }
  });

  // Sort files by latest first
  const fileMessages = expandedFiles.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const audioMessages = messages
    .filter((m) => m.type === "audio")
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  const voiceMessages = messages
    .filter((m) => m.type === "voice")
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  return (
    <div className="flex-shrink-0 w-full max-w-xs bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
        <h2 className="font-semibold text-gray-900">Group Info</h2>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        {/* Room Info Section */}
        <div className="p-4 border-b border-gray-200 overflow-hidden">
          <div className="text-center mb-4">
            <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-2xl text-white font-bold">
                {roomData.name?.[0]?.toUpperCase() || "C"}
              </span>
            </div>
            <h3 className="font-semibold text-base text-gray-900 mb-1 truncate px-2">
              {roomData.name || "Chat Room"}
            </h3>
            <p className="text-xs text-gray-500">
              Created {new Date(roomData.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Share Link */}
          <div className="space-y-2 mb-4">
            <label className="text-xs font-medium text-gray-700">
              Room Link
            </label>
            <div className="flex gap-1">
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="sm"
                className="flex-1 text-xs justify-start overflow-hidden"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 mr-1 flex-shrink-0 text-green-600" />
                    <span className="truncate">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="truncate">Copy Link</span>
                  </>
                )}
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                size="sm"
                className="flex-shrink-0"
              >
                <Share2 className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-50 rounded-lg p-2 text-center min-w-0">
              <p className="text-base font-bold text-gray-900">
                {participants.length}
              </p>
              <p className="text-xs text-gray-600 truncate">Members</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 text-center min-w-0">
              <p className="text-base font-bold text-gray-900">
                {messages.length}
              </p>
              <p className="text-xs text-gray-600 truncate">Messages</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 text-center min-w-0">
              <p className="text-base font-bold text-gray-900">
                {fileStats.photos + fileStats.videos + fileStats.files}
              </p>
              <p className="text-xs text-gray-600 truncate">Files</p>
            </div>
          </div>
        </div>

        {/* Files Section */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-sm text-gray-900 mb-3">
            Media & Files
          </h3>

          {/* Photos */}
          <div className="mb-2">
            <button
              onClick={() => toggleSection("photos")}
              className="w-full flex items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-2"
            >
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">
                  {fileStats.photos} photos
                </span>
              </div>
              {expandedSections.photos ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {expandedSections.photos && photoMessages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2 px-2">
                {photoMessages.map((msg) => (
                  <a
                    key={msg.id}
                    href={msg.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={msg.fileUrl}
                      alt="Shared photo"
                      className="w-full h-full object-cover"
                    />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Videos */}
          <div className="mb-2">
            <button
              onClick={() => toggleSection("videos")}
              className="w-full flex items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-2"
            >
              <div className="flex items-center space-x-2">
                <Video className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">
                  {fileStats.videos} videos
                </span>
              </div>
              {expandedSections.videos ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {expandedSections.videos && videoMessages.length > 0 && (
              <div className="mt-2 px-2 space-y-3">
                {videoMessages.map((msg) => (
                  <a
                    key={msg.id}
                    href={msg.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-gray-50 rounded-lg overflow-hidden hover:bg-gray-100 transition-colors"
                  >
                    {/* User info at top */}
                    {msg.user?.displayName && (
                      <div className="flex items-center space-x-2 p-2 pb-0">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                            {msg.user.displayName[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium text-gray-700">
                          {msg.user.displayName}
                        </span>
                      </div>
                    )}
                    <video
                      src={msg.fileUrl}
                      controls
                      className="w-full max-h-48 bg-black"
                    />
                    {msg.fileName && (
                      <div className="p-2">
                        <p className="text-xs text-gray-900 font-medium truncate">
                          {msg.fileName.length > 15
                            ? msg.fileName.substring(0, 15) + "..."
                            : msg.fileName}
                        </p>
                      </div>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Files */}
          <div className="mb-2">
            <button
              onClick={() => toggleSection("files")}
              className="w-full flex items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-2"
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">
                  {fileStats.files} files
                </span>
              </div>
              {expandedSections.files ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {expandedSections.files && fileMessages.length > 0 && (
              <div className="mt-2 px-2 space-y-3">
                {fileMessages.map((msg) => (
                  <a
                    key={msg.id}
                    href={msg.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group cursor-pointer"
                  >
                    {/* User info at top */}
                    {msg.userName && (
                      <div className="flex items-center space-x-2 mb-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                            {msg.userName[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium text-gray-700">
                          {msg.userName}
                        </span>
                      </div>
                    )}
                    {/* File info */}
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {msg.fileName
                            ? msg.fileName.length > 15
                              ? msg.fileName.substring(0, 14) + "..."
                              : msg.fileName
                            : "File"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {msg.fileSize
                            ? `${(msg.fileSize / 1024).toFixed(1)} KB`
                            : "Unknown size"}
                        </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.preventDefault();
                            const link = document.createElement("a");
                            link.href = msg.fileUrl;
                            link.download = msg.fileName || "file";
                            link.click();
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Audio */}
          <div className="mb-2">
            <button
              onClick={() => toggleSection("audio")}
              className="w-full flex items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-2"
            >
              <div className="flex items-center space-x-2">
                <Music className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">
                  {fileStats.audio} audio files
                </span>
              </div>
              {expandedSections.audio ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {expandedSections.audio && audioMessages.length > 0 && (
              <div className="mt-2 px-2 space-y-3">
                {audioMessages.map((msg) => (
                  <a
                    key={msg.id}
                    href={msg.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {/* User info at top */}
                    {msg.user?.displayName && (
                      <div className="flex items-center space-x-2 mb-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                            {msg.user.displayName[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium text-gray-700">
                          {msg.user.displayName}
                        </span>
                      </div>
                    )}
                    <audio src={msg.fileUrl} controls className="w-full mb-1" />
                    {msg.fileName && (
                      <p className="text-xs text-gray-900 font-medium truncate">
                        {msg.fileName.length > 15
                          ? msg.fileName.substring(0, 15) + "..."
                          : msg.fileName}
                      </p>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Shared Links */}
          <div className="mb-2">
            <button
              onClick={() => toggleSection("links")}
              className="w-full flex items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-2"
            >
              <div className="flex items-center space-x-2">
                <Link2 className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">
                  {fileStats.links} shared links
                </span>
              </div>
              {expandedSections.links ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {expandedSections.links && extractedLinks.length > 0 && (
              <div className="mt-2 px-2 space-y-2">
                {extractedLinks.slice(0, 10).map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-start space-x-2">
                      <Link2 className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-900 font-medium truncate">
                          {link.domain}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {link.url}
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Voice Messages */}
          <div className="mb-2">
            <button
              onClick={() => toggleSection("voice")}
              className="w-full flex items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-2"
            >
              <div className="flex items-center space-x-2">
                <Mic className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">
                  {fileStats.voice} voice messages
                </span>
              </div>
              {expandedSections.voice ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {expandedSections.voice && voiceMessages.length > 0 && (
              <div className="mt-2 px-2 space-y-3">
                {voiceMessages.map((msg) => (
                  <a
                    key={msg.id}
                    href={msg.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {/* User info at top */}
                    {msg.user?.displayName && (
                      <div className="flex items-center space-x-2 mb-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                            {msg.user.displayName[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium text-gray-700">
                          {msg.user.displayName}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 mb-2">
                      <Mic className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs text-gray-600">
                        {msg.duration ? `${msg.duration}s` : "Voice message"}
                      </span>
                    </div>
                    <audio src={msg.fileUrl} controls className="w-full" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Members Section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-gray-900">
              {participants.length} members
            </h3>
          </div>

          <div className="space-y-2">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={participant.avatar} />
                  <AvatarFallback className="bg-purple-100 text-purple-700">
                    {participant.displayName[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {participant.displayName}
                  </p>
                  {participant.isOnline && (
                    <p className="text-xs text-green-600">Online</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
