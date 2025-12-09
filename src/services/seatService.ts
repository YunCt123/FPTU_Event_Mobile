import { api } from "../api/api";
import { SEAT_ENDPOINTS } from "../constants";

export interface Seat {
  id: number;
  rowLabel: string;
  colLabel: number;
  seatType: string;
  isActive: boolean;
  isBooked: boolean;
}

class SeatService {
  async getSeatsByVenueId(venueId: number): Promise<Seat[]> {
    const data = await api.get<Seat[]>(
      `${SEAT_ENDPOINTS.GET}/venue/${venueId}`
    );
    console.log(data);
    return Array.isArray(data) ? data : [];
  }
}

export const seatService = new SeatService();
