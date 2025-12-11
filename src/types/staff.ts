import { Event } from "./event";

export type TicketStatus = "VALID" | "FAKE" | "USED" | "WRONG_EVENT";

export interface CheckInResponse {
  success: boolean;
  status: TicketStatus;
  message: string;
  ticketInfo?: {
    id: string;
    studentId: string;
    studentName: string;
    email: string;
    checkInTime?: string;
  };
}

export interface ManualCheckInRequest {
  searchQuery: string; // Student ID or Email
}

export interface ValidateTicketRequest {
  qrCode: string;
}

export interface ValidateTicketResponse {
  isValid: boolean;
  status: TicketStatus;
  message: string;
  ticketInfo?: {
    id: string;
    studentId: string;
    studentName: string;
    email: string;
    eventTitle: string;
  };
}


export interface StaffAssignedEvent extends Event {
  assignedAt: string;
  role: "staff";
}
