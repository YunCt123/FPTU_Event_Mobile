import { api } from "../api/api";
import { ORGANIZER_REQUEST_ENDPOINTS } from "../constants";
import {
  CreateOrganizerRequest,
  OrganizerRequestResponse,
} from "../types/organizerRequest";

class OrganizerRequestService {
  async createOrganizerRequest(
    params: CreateOrganizerRequest
  ): Promise<OrganizerRequestResponse> {
    const response = await api.post<OrganizerRequestResponse>(
      ORGANIZER_REQUEST_ENDPOINTS.CREATE,
      params
    );
    return response;
  }
}

export const organizerRequestService = new OrganizerRequestService();
