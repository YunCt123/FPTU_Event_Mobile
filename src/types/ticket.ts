import { Event } from "./event";
import { User } from "./user";

export type TicketStatus = 'VALID' | 'USED' | 'CANCELLED' | 'EXPIRED';
export type SeatType = 'standard'
export type EventStatus = "PUBLISHED" 

export interface Seat {
  id: string;
  rowLabel: string;
  colLabel: number;
  seatType: SeatType;
}

// Interface chính cho booking
export interface Ticket {
  id: string;
  qrCode: string;
  status: TicketStatus;
  bookingDate: string;
  checkinTime: string | null;
  event: Event;
  userId: number;
  seatId: Seat;
  user: User;
}

export interface CreateTicketRequest {
  eventId: string;
  seatId?: string;
}

export interface CreateTicketResponse {
  data: Ticket;
}
