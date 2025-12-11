import { useEffect, useState, useCallback, useRef } from "react";
import { socketService, CheckinPayload } from "../services/socketService";

interface UseRealtimeCheckinOptions {
  eventId: string;
  onCheckin?: (payload: CheckinPayload) => void;
}

interface UseRealtimeCheckinReturn {
  isConnected: boolean;
  checkinCount: number;
  recentCheckins: CheckinPayload[];
  resetCheckinCount: () => void;
  clearRecentCheckins: () => void;
}

/**
 * Custom hook for realtime check-in updates via Socket.IO
 *
 * @example
 * ```tsx
 * const { isConnected, checkinCount, recentCheckins } = useRealtimeCheckin({
 *   eventId: "event-123",
 *   onCheckin: (payload) => console.log("New checkin:", payload),
 * });
 * ```
 */
export const useRealtimeCheckin = ({
  eventId,
  onCheckin,
}: UseRealtimeCheckinOptions): UseRealtimeCheckinReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [checkinCount, setCheckinCount] = useState(0);
  const [recentCheckins, setRecentCheckins] = useState<CheckinPayload[]>([]);

  // Keep track of the callback ref to avoid stale closures
  const onCheckinRef = useRef(onCheckin);
  onCheckinRef.current = onCheckin;

  const resetCheckinCount = useCallback(() => {
    setCheckinCount(0);
  }, []);

  const clearRecentCheckins = useCallback(() => {
    setRecentCheckins([]);
  }, []);

  useEffect(() => {
    if (!eventId) return;

    // Connect and join room
    socketService.connect();
    socketService.joinEventRoom(eventId);

    // Check connection status
    const checkConnection = setInterval(() => {
      setIsConnected(socketService.isConnected());
    }, 1000);

    // Subscribe to check-in events
    const unsubscribe = socketService.onCheckin((payload) => {
      // Only process events for our eventId
      if (payload.eventId !== eventId) return;

      // Update local state
      setCheckinCount((prev) => prev + 1);
      setRecentCheckins((prev) => [payload, ...prev].slice(0, 50)); // Keep last 50

      // Call external callback if provided
      onCheckinRef.current?.(payload);
    });

    // Cleanup
    return () => {
      clearInterval(checkConnection);
      unsubscribe();
      socketService.leaveEventRoom(eventId);
    };
  }, [eventId]);

  return {
    isConnected,
    checkinCount,
    recentCheckins,
    resetCheckinCount,
    clearRecentCheckins,
  };
};
