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

export interface IncidentReport {
  id?: string;
  eventId: string;
  reporterId: number;
  reporterName: string;
  incidentType: IncidentType;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  status: "PENDING" | "RESOLVED" | "IN_PROGRESS";
  createdAt: string;
  resolvedAt?: string;
}

export type IncidentType =
  | "FACILITY_DAMAGE"
  | "AUDIO_FAILURE"
  | "TECHNICAL_ISSUE"
  | "SAFETY_CONCERN"
  | "CROWD_CONTROL"
  | "OTHER";

export interface CreateIncidentReportRequest {
  incidentType: IncidentType;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
}

export interface StaffAssignedEvent extends Event {
  assignedAt: string;
  role: "CHECK_IN_STAFF";
}
