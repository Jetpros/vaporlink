"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Image, Video, FileText, Music, Paperclip } from "lucide-react";

interface MediaUploadSelectorProps {
  onFileSelect: (
    file: File,
    type: "image" | "video" | "file" | "audio",
  ) => void;
}

export default function MediaUploadSelector({
  onFileSelect,
}: MediaUploadSelectorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "video" | "file" | "audio",
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file, type);
      // Reset input
      e.target.value = "";
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-700 rounded-full"
          >
            <Paperclip className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem onClick={() => imageInputRef.current?.click()}>
            <Image className="w-4 h-4 mr-2 text-blue-600" />
            <div className="flex flex-col">
              <span className="font-medium">Photo</span>
              <span className="text-xs text-gray-500">Send inline</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => videoInputRef.current?.click()}>
            <Video className="w-4 h-4 mr-2 text-purple-600" />
            <div className="flex flex-col">
              <span className="font-medium">Video</span>
              <span className="text-xs text-gray-500">Send inline</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => audioInputRef.current?.click()}>
            <Music className="w-4 h-4 mr-2 text-green-600" />
            <div className="flex flex-col">
              <span className="font-medium">Audio</span>
              <span className="text-xs text-gray-500">Send inline</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
            <FileText className="w-4 h-4 mr-2 text-gray-600" />
            <div className="flex flex-col">
              <span className="font-medium">File</span>
              <span className="text-xs text-gray-500">Send as attachment</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(e, "image")}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={(e) => handleFileChange(e, "video")}
        className="hidden"
      />
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        onChange={(e) => handleFileChange(e, "audio")}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        onChange={(e) => handleFileChange(e, "file")}
        className="hidden"
      />
    </>
  );
}
