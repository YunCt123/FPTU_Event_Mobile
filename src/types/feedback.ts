import { Event } from "./event";

export interface feedback {
  rating: number;
  comment: string;
  eventId: string;
  ticketId: string;
  skipTimeValidation: boolean;
}

export interface myFeedback {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  eventId: string;
  userId: number;
  event: Event;
}
