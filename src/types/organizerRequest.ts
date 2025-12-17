export interface CreateOrganizerRequest {
  name: string;
  description: string;
  logoUrl: string;
  contactEmail: string;
  campusId: number;
  proofImageUrl: string;
  memberEmails: string[];
}

export interface OrganizerRequestResponse {
  id: number;
  name: string;
  description: string;
  logoUrl: string;
  contactEmail: string;
  campusId: number;
  proofImageUrl: string;
  memberEmails?: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}
