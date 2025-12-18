import { io, Socket } from "socket.io-client";
import { API_CONFIG } from "../constants/apiEndpoints";

// Types for check-in events
export interface CheckinUser {
  id: number;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface CheckinPayload {
  ticketId: string;
  eventId: string;
  user: CheckinUser;
  status: "USED";
  checkinTime: string;
  handledBy: number;
}

type CheckinCallback = (payload: CheckinPayload) => void;

class SocketService {
  private socket: Socket | null = null;
  private joinedRooms: Set<string> = new Set();
  private checkinCallbacks: Set<CheckinCallback> = new Set();

  /**
   * Connect to the check-in namespace
   */
  connect(): void {
    if (this.socket?.connected) {
      console.log("[Socket] Already connected");
      return;
    }

    // Get base URL and clean it up
    let baseUrl = API_CONFIG.BASE_URL || "";
    // Remove /api suffix if present
    baseUrl = baseUrl.replace(/\/api\/?$/, "");
    // Remove trailing slash
    baseUrl = baseUrl.replace(/\/+$/, "");

    const socketUrl = `${baseUrl}/checkin`;
    console.log("[Socket] Connecting to:", socketUrl);

    this.socket = io(socketUrl, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    this.socket.on("connect", () => {
      console.log("[Socket] Connected! Socket ID:", this.socket?.id);
      // Rejoin all rooms after reconnect
      this.joinedRooms.forEach((eventId) => {
        console.log("[Socket] Rejoining room:", eventId);
        this.socket?.emit("joinEvent", { eventId });
      });
    });

    this.socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.log("[Socket] Connection error:", error.message);
    });

    // Listen for check-in events
    this.socket.on("checkin", (payload: CheckinPayload) => {
      console.log("[Socket] ====== RECEIVED CHECKIN EVENT ======");
      console.log("[Socket] Payload:", JSON.stringify(payload, null, 2));
      console.log("[Socket] Active callbacks:", this.checkinCallbacks.size);
      console.log("[Socket] Joined rooms:", Array.from(this.joinedRooms));

      // Notify all callbacks
      this.checkinCallbacks.forEach((callback) => {
        try {
          console.log("[Socket] Calling callback...");
          callback(payload);
        } catch (e) {
          console.log("[Socket] Callback error:", e);
        }
      });
    });
  }

  /**
   * Join a specific event room to receive check-in updates
   * Supports joining multiple rooms simultaneously
   */
  joinEventRoom(eventId: string): void {
    if (!eventId) {
      console.log("[Socket] Cannot join room: eventId is empty");
      return;
    }

    if (this.joinedRooms.has(eventId)) {
      console.log("[Socket] Already in room:", eventId);
      return;
    }

    if (!this.socket?.connected) {
      console.log("[Socket] Not connected, will join room after connection");
      this.joinedRooms.add(eventId);
      this.connect();
      return;
    }

    console.log("[Socket] Joining event room:", eventId);
    this.socket.emit("joinEvent", { eventId });
    this.joinedRooms.add(eventId);
  }

  /**
   * Leave a specific event room
   */
  leaveEventRoom(eventId: string): void {
    if (!eventId || !this.joinedRooms.has(eventId)) return;

    console.log("[Socket] Leaving event room:", eventId);

    if (this.socket?.connected) {
      this.socket.emit("leaveEvent", { eventId });
    }

    this.joinedRooms.delete(eventId);
  }

  /**
   * Leave all rooms
   */
  leaveAllRooms(): void {
    console.log("[Socket] Leaving all rooms:", Array.from(this.joinedRooms));
    this.joinedRooms.forEach((eventId) => {
      if (this.socket?.connected) {
        this.socket.emit("leaveEvent", { eventId });
      }
    });
    this.joinedRooms.clear();
  }

  /**
   * Subscribe to check-in events
   */
  onCheckin(callback: CheckinCallback): () => void {
    this.checkinCallbacks.add(callback);
    console.log(
      "[Socket] Added callback, total callbacks:",
      this.checkinCallbacks.size
    );

    // Return unsubscribe function
    return () => {
      this.checkinCallbacks.delete(callback);
      console.log(
        "[Socket] Removed callback, remaining:",
        this.checkinCallbacks.size
      );
    };
  }

  /**
   * Disconnect from the socket
   */
  disconnect(): void {
    this.leaveAllRooms();
    this.checkinCallbacks.clear();

    if (this.socket) {
      this.socket.off("checkin");
      this.socket.disconnect();
      this.socket = null;
    }

    console.log("[Socket] Disconnected and cleaned up");
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Get all joined room IDs
   */
  getJoinedRooms(): string[] {
    return Array.from(this.joinedRooms);
  }
}

// Export singleton instance
export const socketService = new SocketService();
