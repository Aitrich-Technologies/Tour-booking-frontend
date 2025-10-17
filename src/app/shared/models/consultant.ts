export interface Consultant {
      id: string;
  firstName: string;
  lastName: string;
  email: string;
  telephoneNo: string;
  gender: string;
  dateOfBirth: string;
  userName: string;
  role: 'CONSULTANT';
  agencyId: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  assignedTours?: number;
  totalBookings?: number;
  createdAt: string;
}