import { api } from "../api/api";
import { STAFF_ENDPOINTS } from "../constants/apiEndpoints";
import {
  CheckInResponse,
  CreateIncidentReportRequest,
  IncidentReport,
  ManualCheckInRequest,
  StaffAssignedEvent,
  ValidateTicketRequest,
  ValidateTicketResponse,
} from "../types/staff";

export const staffService = {
  // Get events assigned to the current staff member
  getAssignedEvents: async (): Promise<StaffAssignedEvent[]> => {
    try {
      const response = await api.get<StaffAssignedEvent[]>(
        STAFF_ENDPOINTS.ASSIGNED_EVENTS
      );
      return response;
    } catch (error) {
      console.error("Error fetching assigned events:", error);
      throw error;
    }
  },

  // Validate ticket by QR code
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
      console.error("Error validating ticket:", error);
      throw error;
    }
  },

  // Check-in using QR code
  checkIn: async (eventId: string, qrCode: string): Promise<CheckInResponse> => {
    try {
      const response = await api.post<CheckInResponse>(
        STAFF_ENDPOINTS.CHECK_IN(eventId),
        { qrCode }
      );
      return response;
    } catch (error) {
      console.error("Error checking in:", error);
      throw error;
    }
  },

  // Manual check-in using Student ID or Email
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
      console.error("Error performing manual check-in:", error);
      throw error;
    }
  },

  // Submit incident report
  submitIncidentReport: async (
    eventId: string,
    reportData: CreateIncidentReportRequest
  ): Promise<IncidentReport> => {
    try {
      const response = await api.post<IncidentReport>(
        STAFF_ENDPOINTS.INCIDENT_REPORT(eventId),
        reportData
      );
      return response;
    } catch (error) {
      console.error("Error submitting incident report:", error);
      throw error;
    }
  },
};
