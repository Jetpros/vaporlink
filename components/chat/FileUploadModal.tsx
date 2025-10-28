"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  X,
  Send,
  Plus,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
} from "lucide-react";

interface FilePreview {
  file: File;
  type: "image" | "video" | "file" | "audio";
  url: string;
  caption: string;
}

interface FileUploadModalProps {
  isOpen: boolean;
  files: FilePreview[];
  onClose: () => void;
  onSend: (files: FilePreview[]) => void;
  onAddMore: () => void;
  onFilesChange?: (files: FilePreview[]) => void;
}

export default function FileUploadModal({
  isOpen,
  files: initialFiles,
  onClose,
  onSend,
  onAddMore,
  onFilesChange,
}: FileUploadModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset current index when modal opens or files change
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
    }
  }, [isOpen]);

  // Adjust current index if it's out of bounds
  useEffect(() => {
    if (currentIndex >= initialFiles.length && initialFiles.length > 0) {
      setCurrentIndex(initialFiles.length - 1);
    }
  }, [initialFiles.length, currentIndex]);

  if (!isOpen || initialFiles.length === 0) return null;

  // Safety check: ensure currentIndex is valid
  const safeIndex = Math.min(currentIndex, initialFiles.length - 1);
  const currentFile = initialFiles[safeIndex];

  // Additional safety check
  if (!currentFile) return null;

  const handleCaptionChange = (caption: string) => {
    // Update caption for all files (shared caption)
    const updated = initialFiles.map((f) => ({ ...f, caption }));
    if (onFilesChange) {
      onFilesChange(updated);
    }
  };

  const handleRemoveFile = (index: number) => {
    const updated = initialFiles.filter((_, i) => i !== index);

    if (updated.length === 0) {
      onClose();
    } else {
      if (onFilesChange) {
        onFilesChange(updated);
      }
      if (currentIndex >= updated.length) {
        setCurrentIndex(updated.length - 1);
      }
    }
  };

  const handleSend = () => {
    onSend(initialFiles);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="w-6 h-6" />;
      case "video":
        return <Video className="w-6 h-6" />;
      case "audio":
        return <Music className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      {/* Modal Container */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center gap-3">
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:bg-white/80 rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {initialFiles.length === 1
                  ? "Send File"
                  : `Send ${initialFiles.length} Files`}
              </h2>
              {initialFiles.length > 1 && (
                <p className="text-xs text-gray-500">
                  Viewing {currentIndex + 1} of {initialFiles.length}
                </p>
              )}
            </div>
          </div>
          <Button
            onClick={handleSend}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
          >
            <Send className="w-4 h-4 mr-2" />
            Send {initialFiles.length > 1 ? "All" : ""}
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Preview Area */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
            {/* File Preview */}
            <div className="w-full mb-4">
              {currentFile.type === "image" && (
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                  <img
                    src={currentFile.url}
                    alt={currentFile.file.name}
                    className="w-full max-h-[50vh] object-contain rounded-lg"
                  />
                </div>
              )}
              {currentFile.type === "video" && (
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                  <video
                    src={currentFile.url}
                    controls
                    className="w-full max-h-[50vh] rounded-lg"
                  />
                </div>
              )}
              {currentFile.type === "audio" && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
                      <Music className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 font-semibold truncate mb-1">
                        {currentFile.file.name}
                      </p>
                      <p className="text-gray-500 text-sm">
                        Audio • {(currentFile.file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <audio src={currentFile.url} controls className="w-full" />
                </div>
              )}
              {currentFile.type === "file" && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 font-semibold truncate mb-1">
                        {currentFile.file.name}
                      </p>
                      <p className="text-gray-500 text-sm">
                        Document • {(currentFile.file.size / 1024).toFixed(1)}{" "}
                        KB
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Caption Input */}
            <div className="w-full">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <label className="text-xs font-semibold text-gray-700 mb-2 block">
                  Caption {initialFiles.length > 1 && "(shared for all files)"}
                </label>
                <Textarea
                  value={currentFile.caption}
                  onChange={(e) => handleCaptionChange(e.target.value)}
                  placeholder="Add a caption to your file(s)..."
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 resize-none focus:border-indigo-500 focus:ring-indigo-500 rounded-lg text-sm"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Bottom File Carousel - Only show if multiple files */}
          {initialFiles.length > 1 && (
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex items-center gap-3 overflow-x-auto p-4">
                {initialFiles.map((file, index) => (
                  <div
                    key={index}
                    className={`relative flex-shrink-0 cursor-pointer transition-all rounded-lg ${
                      index === currentIndex
                        ? "ring-2 ring-indigo-500 shadow-md scale-105"
                        : "opacity-70 hover:opacity-100 hover:scale-105"
                    }`}
                    onClick={() => setCurrentIndex(index)}
                  >
                    {file.type === "image" ? (
                      <img
                        src={file.url}
                        alt={file.file.name}
                        className="w-20 h-20 object-cover rounded-lg border-2 border-white"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center border-2 border-white">
                        <div className="text-indigo-600">
                          {getFileIcon(file.type)}
                        </div>
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(index);
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={onAddMore}
                  className="flex-shrink-0 w-20 h-20 bg-white hover:bg-gray-100 rounded-lg flex flex-col items-center justify-center gap-1 transition-all border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:scale-105"
                >
                  <Plus className="w-6 h-6 text-gray-500" />
                  <span className="text-xs font-medium text-gray-600">Add</span>
                </button>
              </div>
            </div>
          )}

          {/* Add More Button - Show if single file */}
          {initialFiles.length === 1 && (
            <div className="flex justify-center p-4 border-t border-gray-200 bg-gray-50">
              <Button
                onClick={onAddMore}
                variant="outline"
                className="bg-white shadow-sm border-gray-300 hover:bg-gray-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add More Files
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
