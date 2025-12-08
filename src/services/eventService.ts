import { api } from "../api/api";
import { EVENT_ENDPOINTS } from "../constants/apiEndpoints";
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

class EventService {
  async getEvents(params?: GetEventsParams): Promise<GetEventsResponse> {
    console.log(params);
    const data = await api.get<GetEventsResponse>(EVENT_ENDPOINTS.LIST, {
      params,
    });
    console.log(data);
    return data;
  }

  async getEventById(eventId: string): Promise<Event> {
    const data = await api.get<Event>(`${EVENT_ENDPOINTS.LIST}/${eventId}`);
    return data;
  }
}

export const eventService = new EventService();
