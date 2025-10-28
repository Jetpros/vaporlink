"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, Plus, Search } from "lucide-react";
import Link from "next/link";

export default function NotFoundRoom() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="vapor-particle absolute w-64 h-64 bg-purple-200/30 rounded-full blur-3xl top-20 right-20" />
        <div className="vapor-particle absolute w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl bottom-20 left-20" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-md w-full text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="mx-auto w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Search className="w-16 h-16 text-gray-400" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Room Not Found
          </h2>
          <p className="text-gray-600">
            This chat room doesn't exist or the link is incorrect.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => router.push("/create")}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Room
          </Button>
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <Home className="w-5 h-5 mr-2" />
            Go to Home
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
          <p className="text-sm text-blue-900 font-medium mb-2">
            💡 Common reasons:
          </p>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• The room link was typed incorrectly</li>
            <li>• The room was never created</li>
            <li>• The room ID is invalid</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
