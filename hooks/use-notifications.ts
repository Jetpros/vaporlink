"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: any;
}

export function useNotifications() {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);
  const isTabVisible = useRef(true);

  useEffect(() => {
    // Check if notifications are supported
    if (typeof window !== "undefined" && "Notification" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }

    // Track tab visibility
    const handleVisibilityChange = () => {
      isTabVisible.current = document.visibilityState === "visible";
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      console.warn("Notifications are not supported in this browser");
      return false;
    }

    if (permission === "granted") {
      return true;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }, [isSupported, permission]);

  const showNotification = useCallback(
    async (options: NotificationOptions) => {
      // Don't show notification if tab is visible
      if (isTabVisible.current) {
        return null;
      }

      if (!isSupported) {
        console.warn("Notifications are not supported");
        return null;
      }

      if (permission !== "granted") {
        const granted = await requestPermission();
        if (!granted) {
          return null;
        }
      }

      try {
        const notification = new Notification(options.title, {
          body: options.body,
          icon: options.icon || "/icon.svg",
          tag: options.tag,
          data: options.data,
          badge: "/icon.svg",
          requireInteraction: false,
          silent: false,
        });

        // Auto-close after 5 seconds
        setTimeout(() => {
          notification.close();
        }, 5000);

        // Focus window when notification is clicked
        notification.onclick = (event) => {
          event.preventDefault();
          window.focus();
          notification.close();
        };

        return notification;
      } catch (error) {
        console.error("Error showing notification:", error);
        return null;
      }
    },
    [isSupported, permission, requestPermission],
  );

  const showMessageNotification = useCallback(
    async (
      senderName: string,
      messageContent: string,
      messageType: string = "text",
    ) => {
      let body = messageContent;

      // Customize body based on message type
      switch (messageType) {
        case "image":
          body = messageContent || "📷 Sent an image";
          break;
        case "video":
          body = messageContent || "🎥 Sent a video";
          break;
        case "audio":
        case "voice":
          body = messageContent || "🎵 Sent a voice message";
          break;
        case "file":
          body = messageContent || "📎 Sent a file";
          break;
        case "files":
          body = messageContent || "📎 Sent multiple files";
          break;
        default:
          body = messageContent || "Sent a message";
      }

      // Truncate long messages
      if (body.length > 100) {
        body = body.substring(0, 97) + "...";
      }

      return showNotification({
        title: senderName,
        body: body,
        icon: "/icon.svg",
        tag: `message-${Date.now()}`,
      });
    },
    [showNotification],
  );

  return {
    permission,
    isSupported,
    requestPermission,
    showNotification,
    showMessageNotification,
  };
}
