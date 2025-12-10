export interface Organizer {
  id: number;
  name: string;
  description: string;
  contactEmail: string;
  logoUrl: string | null;
}

export interface Venue {
  id: number;
  name: string;
  location: string;
  hasSeats: boolean;
}

export interface Host {
  id: number;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
}

export type EventStatus = "PUBLISHED" | "DRAFT" | "CANCELLED" | "PENDING";

export interface Event {
  id: string;
  title: string;
  description: string;
  bannerUrl: string | null;
  startTimeRegister: string;
  endTimeRegister: string;
  startTime: string;
  endTime: string;
  category: string;
  status: EventStatus;
  maxCapacity: number;
  registeredCount: number;
  allowCheckIn: boolean;
  isGlobal: boolean;
  createdAt: string;
  hostId: number;
  organizerId: number;
  venueId: number;
  organizer: Organizer;
  venue: Venue;
  host: Host;
}
