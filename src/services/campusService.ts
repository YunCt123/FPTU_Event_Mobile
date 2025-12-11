import { api } from "../api/api";
import { CAMPUS_ENDPOINTS } from "../constants";
import { Campus } from "../types/user";

class CampusService {
  async getAllCampuses(): Promise<Campus[]> {
    const data = await api.get<Campus[]>(CAMPUS_ENDPOINTS.LIST);
    return data;
  }
}

export const campusService = new CampusService();


