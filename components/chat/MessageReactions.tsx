"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Reaction {
  id: string;
  emoji: string;
  userId: string;
  messageId: string;
  createdAt: Date;
  user?: {
    displayName: string;
    avatar: string;
  };
}

interface MessageReactionsProps {
  messageId: string;
  reactions: Reaction[];
  currentUserId: string;
  onReact: (emoji: string) => void;
}

export default function MessageReactions({
  messageId,
  reactions,
  currentUserId,
  onReact,
}: MessageReactionsProps) {
  const [showAllReactions, setShowAllReactions] = useState(false);

  // Check if user already reacted to this message
  const userReaction = reactions.find((r) => r.userId === currentUserId);

  const handleRemoveReaction = () => {
    if (userReaction) {
      // Send the same emoji to toggle it off
      onReact(userReaction.emoji);
      setShowAllReactions(false);
    }
  };

  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = { count: 0, userIds: [], users: [] };
    }
    acc[reaction.emoji].count += 1;
    acc[reaction.emoji].userIds.push(reaction.userId);
    if (reaction.user) {
      acc[reaction.emoji].users.push(reaction.user);
    }
    return acc;
  }, {} as Record<string, { count: number; userIds: string[]; users: any[] }>);

  const reactionEntries = Object.entries(groupedReactions);

  if (reactionEntries.length === 0) {
    return null;
  }

  const visibleReactions = reactionEntries.slice(0, 2);
  const remainingCount = reactionEntries.length - 2;

  return (
    <div className="flex items-center gap-1">
      <Popover open={showAllReactions} onOpenChange={setShowAllReactions}>
        <div className="flex items-center gap-1">
          {visibleReactions.map(([emoji, data]) => {
            const userReacted = data.userIds.includes(currentUserId);
            return (
              <PopoverTrigger key={emoji} asChild>
                <button
                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs transition-all shadow-sm ${
                    userReacted
                      ? "bg-white border border-indigo-300 text-indigo-700"
                      : "bg-white border border-gray-200 text-gray-700 hover:border-indigo-200"
                  }`}
                >
                  <span className="text-xs">{emoji}</span>
                  <span className="font-medium text-[9px]">{data.count}</span>
                </button>
              </PopoverTrigger>
            );
          })}

          {remainingCount > 0 && (
            <PopoverTrigger asChild>
              <button className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs transition-all shadow-sm bg-white border border-gray-200 text-gray-600 hover:border-indigo-200">
                <span className="font-medium text-[9px]">
                  +{remainingCount}
                </span>
              </button>
            </PopoverTrigger>
          )}
        </div>

        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-700 mb-2">
              Reactions
            </p>
            {reactionEntries.map(([emoji, data]) => (
              <div key={emoji} className="space-y-1.5">
                {data.users.map((user, index) => {
                  const isCurrentUser = user.id === currentUserId;
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{emoji}</span>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-white ${
                            isCurrentUser
                              ? "bg-gradient-to-br from-indigo-500 to-purple-500"
                              : "bg-gradient-to-br from-indigo-400 to-purple-400"
                          }`}
                        >
                          <span className="text-[10px] font-medium">
                            {user.displayName?.[0]?.toUpperCase()}
                          </span>
                        </div>
                        <span
                          className={`text-xs ${
                            isCurrentUser
                              ? "text-indigo-700 font-medium"
                              : "text-gray-600"
                          }`}
                        >
                          {isCurrentUser ? "You" : user.displayName}
                        </span>
                      </div>
                      {isCurrentUser && (
                        <button
                          onClick={handleRemoveReaction}
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
