"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/features/auth/authStore";
import { Notification, Message } from "@/types";

interface WebSocketContextType {
  isConnected: boolean;
  latestMessage: Message | null;
  latestNotification: Notification | null;
}

const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  latestMessage: null,
  latestNotification: null,
});

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, accessToken } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [latestMessage, setLatestMessage] = useState<Message | null>(null);
  const [latestNotification, setLatestNotification] = useState<Notification | null>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!user || !accessToken) {
      if (ws.current) {
        ws.current.close();
      }
      return;
    }

    const connectWs = () => {
      // Create WebSocket URL from API URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const wsUrl = apiUrl.replace(/^http/, "ws") + `/ws?token=${accessToken}`;

      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        setIsConnected(true);
      };

      ws.current.onclose = () => {
        setIsConnected(false);
        // Only attempt to reconnect if user is still logged in
        if (useAuthStore.getState().user) {
          setTimeout(connectWs, 3000);
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "NEW_MESSAGE") {
            setLatestMessage(data.message);
          } else if (data.type === "NEW_NOTIFICATION") {
            setLatestNotification(data.notification);
          }
        } catch (e) {
          console.error("Failed to parse websocket message", e);
        }
      };
    };

    connectWs();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [user, accessToken]);

  return (
    <WebSocketContext.Provider value={{ isConnected, latestMessage, latestNotification }}>
      {children}
    </WebSocketContext.Provider>
  );
};
