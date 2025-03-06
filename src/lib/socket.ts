/* eslint-disable @typescript-eslint/no-explicit-any */
import socketIOClient from 'socket.io-client';
import { SocketEvent } from '@/types';

// Define a custom socket type
type MySocket = ReturnType<typeof socketIOClient>;

let socket: MySocket | null = null;

/**
 * Get the socket instance, creating it if it doesn't exist
 */
export function getSocket(): MySocket {
  if (!socket) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://typer99-api.mewo.gay';

    socket = socketIOClient(socketUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    // Socket event logging for development
    if (process.env.NODE_ENV !== 'production') {
      (socket as any).onAny((event: string, ...args: unknown[]) => {
        console.log(`[Socket Received] ${event}`, args);
      });

      const originalEmit = socket.emit;
      socket.emit = function (this: MySocket, event: string, ...args: unknown[]) {
        console.log(`[Socket Sent] ${event}`, args);
        return originalEmit.apply(this, [event, ...args]);
      } as any;
    }
  }

  return socket;
}

/**
 * Disconnect the socket and clean up the instance
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Check if the socket is currently connected
 */
export function isSocketConnected(): boolean {
  return socket?.connected || false;
}

/**
 * Reconnect the socket if it's disconnected
 */
export function reconnectSocket(): void {
  if (socket && !socket.connected) {
    socket.connect();
  } else if (!socket) {
    getSocket();
  }
}

/**
 * Helper function to emit events with proper typing
 */
export function emitEvent<T extends keyof SocketEvent>(
  event: T,
  ...args: Parameters<SocketEvent[T]>
): void {
  const currentSocket = getSocket();
  if (currentSocket) {
    currentSocket.emit(event, ...args);
  } else {
    console.error(`Failed to emit ${String(event)}: Socket not initialized`);
  }
}
