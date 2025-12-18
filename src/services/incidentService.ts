import { api } from "../api/api";
import { INCIDENT_ENDPOINTS } from "../constants/apiEndpoints";
import { Incident, IncidentReportRequest } from "../types/incident";

export const incidentService = {
  /**
   * Tạo báo cáo sự cố mới
   * Endpoint: POST /incidents
   * Required role: staff
   */
  createIncident: async (data: IncidentReportRequest): Promise<Incident> => {
    try {
      const response = await api.post<Incident>(
        INCIDENT_ENDPOINTS.CREATE,
        data
      );
      return response;
    } catch (error) {
      console.log("Error creating incident:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách sự cố do staff hiện tại báo cáo
   * Endpoint: GET /incidents/my
   * Required role: staff
   */
  getMyIncidents: async (): Promise<Incident[]> => {
    try {
      const response = await api.get<Incident[]>(INCIDENT_ENDPOINTS.MY);
      return response;
    } catch (error) {
      console.log("Error fetching my incidents:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách sự cố của một sự kiện
   * Endpoint: GET /incidents/event/{eventId}
   * Required role: staff (phải được phân công), organizer owner, hoặc admin
   */
  getIncidentsByEvent: async (eventId: string): Promise<Incident[]> => {
    try {
      const response = await api.get<Incident[]>(
        INCIDENT_ENDPOINTS.BY_EVENT(eventId)
      );
      return response;
    } catch (error) {
      console.log("Error fetching incidents by event:", error);
      throw error;
    }
  },

  /**
   * Cập nhật trạng thái sự cố
   * Endpoint: PATCH /incidents/{id}/status
   * Required role: Admin, Organizer owner, hoặc chính Staff reporter
   */
  updateIncidentStatus: async (
    incidentId: string,
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED"
  ): Promise<Incident> => {
    try {
      const response = await api.patch<Incident>(
        INCIDENT_ENDPOINTS.UPDATE_STATUS(incidentId),
        { status }
      );
      return response;
    } catch (error) {
      console.log("Error updating incident status:", error);
      throw error;
    }
  },
};
