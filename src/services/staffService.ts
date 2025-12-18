import { api } from "../api/api";
import { STAFF_ENDPOINTS } from "../constants/apiEndpoints";
import {
  CheckInResponse,
  ManualCheckInRequest,
  StaffAssignedEvent,
  ValidateTicketRequest,
  ValidateTicketResponse,
} from "../types/staff";

export const staffService = {
  /**
   * Lấy danh sách sự kiện được phân công cho staff hiện tại
   * Endpoint: GET /events/assigned
   * Required role: staff
   */
  getAssignedEvents: async (): Promise<StaffAssignedEvent[]> => {
    try {
      const response = await api.get<StaffAssignedEvent[]>(
        STAFF_ENDPOINTS.ASSIGNED_EVENTS
      );
      return response;
    } catch (error) {
      console.log("Error fetching assigned events:", error);
      throw error;
    }
  },

  /**
   * Xác thực vé bằng QR code (không check-in)
   * Endpoint: POST /events/{eventId}/validate-ticket
   * Required role: staff
   */
  validateTicket: async (
    eventId: string,
    qrCode: string
  ): Promise<ValidateTicketResponse> => {
    try {
      const response = await api.post<ValidateTicketResponse>(
        STAFF_ENDPOINTS.VALIDATE_TICKET(eventId),
        { qrCode } as ValidateTicketRequest
      );
      return response;
    } catch (error) {
      console.log("Error validating ticket:", error);
      throw error;
    }
  },

  /**
   * Check-in bằng QR code
   * Endpoint: POST /events/{eventId}/check-in
   * Required role: staff
   */
  checkIn: async (eventId: string, qrCode: string): Promise<CheckInResponse> => {
    try {
      const response = await api.post<CheckInResponse>(
        STAFF_ENDPOINTS.CHECK_IN(eventId),
        { qrCode }
      );
      return response;
    } catch (error) {
      console.log("Error checking in:", error);
      throw error;
    }
  },

  /**
   * Check-in thủ công bằng Student ID hoặc Email
   * Endpoint: POST /events/{eventId}/manual-check-in
   * Required role: staff
   */
  manualCheckIn: async (
    eventId: string,
    searchQuery: string
  ): Promise<CheckInResponse> => {
    try {
      const response = await api.post<CheckInResponse>(
        STAFF_ENDPOINTS.MANUAL_CHECK_IN(eventId),
        { searchQuery } as ManualCheckInRequest
      );
      return response;
    } catch (error) {
      console.log("Error performing manual check-in:", error);
      throw error;
    }
  },
};
