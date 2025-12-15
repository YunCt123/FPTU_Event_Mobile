export interface CreateOrganizerRequest {
  name: string;
  description: string;
  logoUrl: string;
  contactEmail: string;
  campusId: number;
  proofImageUrl: string;
}

export interface OrganizerRequestResponse {
  id: number;
  name: string;
  description: string;
  logoUrl: string;
  contactEmail: string;
  campusId: number;
  proofImageUrl: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
