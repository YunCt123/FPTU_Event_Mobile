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

export interface Speaker {
  id: number;
  name: string;
  bio: string;
  avatar: string | null;
  type: string;
  company: string;
}

export interface EventSpeaker {
  id: number;
  topic: string;
  speaker: Speaker;
}

export type EventStatus = "PUBLISHED" | "DRAFT" | "CANCELLED" | "PENDING";

export type RecurrenceType = "NONE" | "DAILY" | "WEEKLY" | "MONTHLY";

export interface Event {
  id: string;
  title: string;
  description: string;
  bannerUrl: string | null;
  startTimeRegister: string | null;
  endTimeRegister: string | null;
  startTime: string;
  endTime: string;
  category: string;
  status: EventStatus;
  maxCapacity: number | null;
  registeredCount: number;
  allowCheckIn: boolean;
  isGlobal: boolean;
  isOnline: boolean;
  onlineMeetingUrl: string | null;
  recurrenceType: RecurrenceType;
  recurrenceInterval: number | null;
  recurrenceEndDate: string | null;
  recurrenceCount: number | null;
  createdAt: string;
  hostId: number;
  organizerId: number;
  venueId: number | null;
  organizer: Organizer;
  venue: Venue | null;
  host: Host;
  eventSpeakers?: EventSpeaker[];
}
