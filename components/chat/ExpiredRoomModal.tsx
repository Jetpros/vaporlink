"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Clock, Home, Plus } from "lucide-react";

interface ExpiredRoomModalProps {
  isOpen: boolean;
}

export default function ExpiredRoomModal({ isOpen }: ExpiredRoomModalProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, router]);

  const handleGoHome = () => {
    router.push("/");
  };

  const handleCreateNew = () => {
    router.push("/create");
  };

  return (
    <Dialog open={isOpen} modal>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-red-600" />
          </div>
          <DialogTitle className="text-center text-xl">
            Chat No Longer Available
          </DialogTitle>
          <DialogDescription className="text-center">
            This chat room has expired and all messages have been permanently
            deleted. Ephemeral chats are designed to disappear after their set
            duration.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Countdown */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Redirecting to home in</p>
            <p className="text-3xl font-bold text-gray-900 tabular-nums">
              {countdown}s
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleCreateNew}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Room
            </Button>
            <Button onClick={handleGoHome} variant="outline" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
