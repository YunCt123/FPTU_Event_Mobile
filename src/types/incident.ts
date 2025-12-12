export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH";
export type IncidentStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export interface Incident {
  id: string;
  eventId: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  reporterId: number;
  createdAt: string;
  updatedAt?: string;
}

export interface IncidentReportRequest {
  eventId: string;
  title: string;
  description: string;
  imageUrl: string;
  severity: IncidentSeverity;
}

export interface UpdateIncidentStatusRequest {
  status: IncidentStatus;
}
