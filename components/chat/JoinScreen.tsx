"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles, Users, Clock, Lock, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateGuestName, formatTimeLeft } from "@/lib/utils";
import { generateRandomAvatar } from "@/lib/avatars";

interface JoinScreenProps {
  roomData: any;
  onJoin: (
    displayName: string,
    avatar: string,
    password?: string
  ) => Promise<void>;
}

export default function JoinScreen({ roomData, onJoin }: JoinScreenProps) {
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(generateRandomAvatar());
  const [loading, setLoading] = useState(false);

  const handleRandomizeAvatar = () => {
    setAvatar(generateRandomAvatar());
  };

  const handleJoinClick = async () => {
    setLoading(true);

    try {
      const finalName = displayName.trim() || generateGuestName();
      await onJoin(finalName, avatar, password || undefined);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to join room",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const timeLeft = roomData?.firstJoinAt
    ? formatTimeLeft(roomData?.expiresAt, roomData?.firstJoinAt)
    : "24h 0m 0s";

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
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 text-gray-900">
              {roomData?.name || "Ephemeral Chat Room"}
            </h1>
            <p className="text-gray-600">
              Join the conversation before it vanishes
            </p>
          </div>

          {/* Room Info */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <Users className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {roomData?.participantCount}/{roomData?.maxUsers}
                </p>
                <p className="text-sm text-gray-600">Participants</p>
              </div>
              <div>
                <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {timeLeft !== "Expired" ? timeLeft.split(" ")[0] : "Expired"}
                </p>
                <p className="text-sm text-gray-600">Time Left</p>
              </div>
              <div>
                <Lock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {roomData?.hasPassword ? "Yes" : "No"}
                </p>
                <p className="text-sm text-gray-600">Protected</p>
              </div>
            </div>
          </div>

          {/* Join Form */}
          <Card className="bg-white border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900">
                Join Room
              </CardTitle>
              <CardDescription className="text-gray-600">
                Choose your display name and avatar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Preview */}
              <div className="space-y-2">
                <Label className="text-gray-700">Your Avatar</Label>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <img
                    src={avatar}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full bg-white border-2 border-gray-300"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-2">
                      Your unique Notionist avatar
                    </p>
                    <Button
                      type="button"
                      onClick={handleRandomizeAvatar}
                      variant="outline"
                      size="sm"
                      className="border-gray-300 hover:bg-gray-100"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Randomize
                    </Button>
                  </div>
                </div>
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-gray-700">
                  Display Name (Optional)
                </Label>
                <Input
                  id="displayName"
                  placeholder="Leave empty for auto-generated name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="border-gray-300 text-gray-900 placeholder:text-gray-400"
                />
              </div>

              {/* Password */}
              {roomData?.hasPassword && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter room password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-gray-300 text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              )}

              {/* Join Button */}
              <Button
                onClick={handleJoinClick}
                disabled={
                  loading || roomData?.participantCount >= roomData?.maxUsers
                }
                size="lg"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-lg py-6"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                    Joining...
                  </>
                ) : roomData?.participantCount >= roomData?.maxUsers ? (
                  "Room Full"
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Join Chat
                  </>
                )}
              </Button>

              {/* Info */}
              <p className="text-sm text-gray-400 text-center">
                By joining, you agree that all messages will be deleted after 24
                hours
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
