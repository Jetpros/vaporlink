"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles, Lock, Copy, Check, QrCode, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QRCodeLib from "qrcode";

export default function CreatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [roomLink, setRoomLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [duration, setDuration] = useState(24); // Default 24 hours

  const handleCreate = async () => {
    if (usePassword && password.length < 4) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 4 characters",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/rooms/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: roomName || undefined,
          password: usePassword ? password : undefined,
          durationHours: duration,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create room");
      }

      const link = `${window.location.origin}/c/${data.room.uniqueId}`;
      setRoomLink(link);

      // Generate QR code
      const qr = await QRCodeLib.toDataURL(link, {
        width: 300,
        margin: 2,
        color: {
          dark: "#FF006E",
          light: "#000000",
        },
      });
      setQrCode(qr);

      setShowSuccess(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create room",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomLink);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
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
          title: "Join my VaporLink chat",
          text: "Join this ephemeral chat room!",
          url: roomLink,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="vapor-particle absolute w-64 h-64 bg-purple-200/30 rounded-full blur-3xl top-20 right-20" />
        <div className="vapor-particle absolute w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl bottom-20 left-20" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center space-x-2 w-fit">
            <Sparkles className="w-8 h-8 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-900">VaporLink</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 text-gray-900">
              Create Your Chat Room
            </h1>
            <p className="text-gray-600 text-lg">
              Set up your ephemeral chat. It vanishes in 24 hours.
            </p>
          </div>

          <Card className="bg-white border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900">
                Room Settings
              </CardTitle>
              <CardDescription className="text-gray-600">
                Customize your chat room. All fields are optional.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Room Name */}
              <div className="space-y-2">
                <Label htmlFor="roomName" className="text-gray-700">
                  Room Name (Optional)
                </Label>
                <Input
                  id="roomName"
                  placeholder="e.g., Project Sync, Study Group"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="border-gray-300 text-gray-900 placeholder:text-gray-400"
                />
              </div>

              {/* Password Toggle */}
              <div className="flex items-center justify-between space-x-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div className="flex items-center space-x-3">
                  <Lock className="w-5 h-5 text-indigo-600" />
                  <div>
                    <Label
                      htmlFor="usePassword"
                      className="text-gray-900 font-medium"
                    >
                      Password Protection
                    </Label>
                    <p className="text-sm text-gray-600">
                      Require a password to join
                    </p>
                  </div>
                </div>
                <Switch
                  id="usePassword"
                  checked={usePassword}
                  onCheckedChange={setUsePassword}
                />
              </div>

              {/* Password Input */}
              {usePassword && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">
                    Password (min 4 characters)
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-gray-300 text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              )}

              {/* Duration Selection */}
              <div className="space-y-3">
                <Label htmlFor="duration" className="text-gray-700 font-medium">
                  Room Duration
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {[0.5, 1, 6, 12, 24].map((hours) => (
                    <button
                      key={hours}
                      type="button"
                      onClick={() => setDuration(hours)}
                      className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                        duration === hours
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                          : "border-gray-200 bg-white text-gray-700 hover:border-indigo-300"
                      }`}
                    >
                      {hours < 1 ? `${hours * 60}m` : `${hours}h`}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Room expires{" "}
                  {duration < 1
                    ? `${duration * 60} minutes`
                    : `${duration} hours`}{" "}
                  after first join
                </p>
              </div>

              {/* Info Card */}
              <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200">
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>
                    ✓ Expires{" "}
                    {duration < 1
                      ? `${duration * 60} minutes`
                      : `${duration} hours`}{" "}
                    from first join
                  </li>
                  <li>✓ Maximum 10 participants</li>
                  <li>✓ No signup required to join</li>
                  <li>✓ All data automatically deleted</li>
                </ul>
              </div>

              {/* Create Button */}
              <Button
                onClick={handleCreate}
                disabled={loading}
                size="lg"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-lg py-6"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Link
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="bg-white border-gray-200 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl text-gray-900">
              Room Created! 🎉
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Share this link with others to start chatting
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Link */}
            <div className="space-y-2">
              <Label className="text-gray-700">Your Room Link</Label>
              <div className="flex gap-2">
                <Input
                  value={roomLink}
                  readOnly
                  className="bg-gray-50 border-gray-300 text-gray-900 font-mono"
                />
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-100"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* QR Code */}
            {qrCode && (
              <div className="flex justify-center p-6 bg-white rounded-lg">
                <img src={qrCode} alt="QR Code" className="w-64 h-64" />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleShare}
                variant="outline"
                className="flex-1 border-gray-300 hover:bg-gray-100"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                onClick={() => router.push(`/c/${roomLink.split("/").pop()}`)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                Join Room
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
