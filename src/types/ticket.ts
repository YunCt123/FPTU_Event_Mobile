import { Event } from "./event";
import { User } from "./user";

export type TicketStatus = "VALID" | "USED" | "CANCELED" | "EXPIRED";
export type SeatType = "standard";
export type EventStatus = "PUBLISHED";

export interface Seat {
  id: number;
  rowLabel: string;
  colLabel: number;
  seatType: SeatType;
  isActive?: boolean;
  venueId?: number;
}

// Interface chính cho booking
export interface Ticket {
  id: string;
  qrCode: string;
  status: TicketStatus;
  bookingDate: string;
  checkinTime: string | null;
  event: Event;
  eventId: string;
  userId: number;
  seatId: number;
  seat?: Seat;
  user: User;
}

export interface CreateTicketRequest {
  eventId: string;
  seatId?: string;
}

export interface CreateTicketResponse {
  data: Ticket;
}

export interface ScanTicketRequest {
  qrCode: string;
  staffId: number;
}

export interface ScanTicketResponse {
  success: boolean;
  message: string;
  ticket: Ticket;
  user: User;
}

export interface ManualCheckinRequest {
  ticketId?: string;
  studentCode?: string;
  eventId?: string;
  staffId: number;
}

export interface ManualCheckinResponse {
  success: boolean;
  message: string;
  ticket: Ticket;
  user: User;
}
