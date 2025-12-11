import { api } from "../api/api";
import { EVENT_ENDPOINTS, TICKET_ENDPOINTS } from "../constants/apiEndpoints";
import { Event } from "../types/event";

interface GetEventsResponse {
  data: Event[];
}

interface GetEventsParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

interface RegisterEventParams {
  eventId: string;
  seatId: number;
}

class EventService {
  /**
   * Lấy danh sách sự kiện với phân trang và filter
   * Endpoint: GET /events
   */
  async getEvents(params?: GetEventsParams): Promise<GetEventsResponse> {
    try {
      const data = await api.get<GetEventsResponse>(EVENT_ENDPOINTS.LIST, {
        params,
      });
      return data;
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  }

  /**
   * Lấy thông tin chi tiết sự kiện theo ID
   * Endpoint: GET /events/{eventId}
   */
  async getEventById(eventId: string): Promise<Event> {
    try {
      const data = await api.get<Event>(`${EVENT_ENDPOINTS.LIST}/${eventId}`);
      return data;
    } catch (error) {
      console.error("Error fetching event by ID:", error);
      throw error;
    }
  }

  /**
   * Đăng ký tham gia sự kiện (tạo vé)
   * Endpoint: POST /tickets
   */
  async registerEvent(payload: RegisterEventParams): Promise<RegisterEventParams> {
    try {
      const res = await api.post<RegisterEventParams>(
        TICKET_ENDPOINTS.REGISTER,
        payload
      );
      return res;
    } catch (error) {
      console.error("Error registering event:", error);
      throw error;
    }
  }
}

export const eventService = new EventService();
