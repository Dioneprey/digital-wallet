import { env } from "@/env";
import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  private readonly socketConfig = {
    transports: ["websocket", "polling"],
    upgrade: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    maxReconnectionAttempts: this.maxReconnectAttempts,
    timeout: 10000,
    forceNew: false,
  };

  connect(token?: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    const serverUrl = env.NEXT_PUBLIC_API_URL;

    this.socket = io(serverUrl, {
      ...this.socketConfig,
    });

    this.setupEventListeners();

    return this.socket;
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", () => {
      this.isConnected = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("🔴 Erro de conexão:", error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("Max tentativas de reconexão atingidas");
        this.disconnect();
      }
    });

    this.socket.on("reconnect", (attemptNumber) => {
      this.reconnectAttempts = 0;
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  getConnectionStatus(): boolean {
    return this.isConnected && (this.socket?.connected ?? false);
  }

  emit(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn("Socket não conectado. Evento não enviado:", event);
    }
  }

  on(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    } else {
      console.warn(
        `Socket não conectado. Não foi possível registrar listener para: ${event}`
      );
    }
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  once(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.once(event, callback);
    }
  }
}

export const socketService = new SocketService();
export default socketService;
