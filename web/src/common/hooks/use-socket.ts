import { useEffect, useRef, useState, useCallback } from "react";
import { Socket } from "socket.io-client";
import socketService from "@/lib/socket";
import { useAuth } from "@/context/auth-context";

interface UseSocketOptions {
  autoConnect?: boolean;
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback?: (...args: any[]) => void) => void;
  once: (event: string, callback: (...args: any[]) => void) => void;
}

export function useSocket(options: UseSocketOptions = {}): UseSocketReturn {
  const { autoConnect = true } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const listenersRef = useRef<Map<string, (...args: any[]) => void>>(new Map());

  const { user } = useAuth();

  const connect = useCallback(() => {
    const socketInstance = socketService.connect();
    setSocket(socketInstance);

    if (user) {
      socketService.emit("join", {
        userId: user?.id,
      });
    }

    const updateConnectionStatus = () => {
      setIsConnected(socketService.getConnectionStatus());
    };

    socketInstance.on("connect", updateConnectionStatus);
    socketInstance.on("disconnect", updateConnectionStatus);

    updateConnectionStatus();
  }, [user]);

  const disconnect = useCallback(() => {
    listenersRef.current.forEach((callback, event) => {
      socketService.off(event, callback);
    });
    listenersRef.current.clear();

    socketService.disconnect();
    setSocket(null);
    setIsConnected(false);
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    socketService.emit(event, data);
  }, []);

  const on = useCallback(
    (event: string, callback: (...args: any[]) => void) => {
      if (listenersRef.current.has(event)) {
        return;
      }
      socketService.on(event, callback);
      listenersRef.current.set(event, callback);
    },
    []
  );

  const off = useCallback(
    (event: string, callback?: (...args: any[]) => void) => {
      socketService.off(event, callback);
      if (!callback) {
        listenersRef.current.delete(event);
      }
    },
    []
  );

  const once = useCallback(
    (event: string, callback: (...args: any[]) => void) => {
      socketService.once(event, callback);
    },
    []
  );

  useEffect(() => {
    if (autoConnect) {
      connect();
    }
  }, [autoConnect, connect]);

  return {
    socket,
    isConnected,
    connect,
    disconnect,
    emit,
    on,
    off,
    once,
  };
}
