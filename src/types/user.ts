export interface Campus {
  id: number;
  name: string;
  code: string;
  address: string;
}

export interface User {
  id: number;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
  phoneNumber: string;
  gender: boolean;
  address: string;
  roleName: string;
  isActive: boolean;
  createdAt: string;
  campus: Campus;
}

export interface UpdateUserProfileRequest{
  userName: string;
  firstName: string;
  lastName: string;
  phoneNumber: string
  address: string;
  avatar: string;
}
