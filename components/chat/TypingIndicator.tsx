"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TypingUser {
  id: string;
  displayName: string;
  avatar: string;
}

interface TypingIndicatorProps {
  users: TypingUser[];
}

export default function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  return (
    <div className="flex items-center gap-3 px-2 py-2 animate-fade-in">
      {/* Avatars */}
      <div className="flex items-center -space-x-3">
        {users.slice(0, 3).map((user, index) => (
          <div
            key={user.id}
            className="relative transition-all duration-300 ease-out"
            style={{
              zIndex: 10 + (users.length - index),
              animationDelay: `${index * 100}ms`,
            }}
          >
            <div className="relative">
              <Avatar className="w-9 h-9 ring-3 ring-white shadow-md hover:scale-110 transition-transform duration-200">
                <AvatarImage src={user.avatar} alt={user.displayName} />
                <AvatarFallback className="bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-700 text-xs font-semibold">
                  {user.displayName?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {/* Pulsing ring effect - multiple layers */}
              <div className="absolute inset-0 rounded-full bg-indigo-400/30 animate-ping-slow" />
              <div
                className="absolute inset-0 rounded-full bg-indigo-300/20 animate-ping-slower"
                style={{ animationDelay: "0.5s" }}
              />
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white shadow-sm">
                <div className="absolute inset-0 bg-green-400 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        ))}
        {users.length > 3 && (
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 text-xs font-bold ring-3 ring-white shadow-md">
            +{users.length - 3}
          </div>
        )}
      </div>

      {/* Animated typing dots */}
      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-md hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center space-x-1.5">
          <div
            className="w-2.5 h-2.5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full animate-typing-bounce shadow-sm"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-2.5 h-2.5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full animate-typing-bounce shadow-sm"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-2.5 h-2.5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full animate-typing-bounce shadow-sm"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.15;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }

        @keyframes ping-slower {
          0% {
            transform: scale(1);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.1;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }

        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .animate-ping-slower {
          animation: ping-slower 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        @keyframes typing-bounce {
          0%,
          60%,
          100% {
            transform: translateY(0);
            opacity: 1;
          }
          30% {
            transform: translateY(-8px);
            opacity: 0.8;
          }
        }

        .animate-typing-bounce {
          animation: typing-bounce 1.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
