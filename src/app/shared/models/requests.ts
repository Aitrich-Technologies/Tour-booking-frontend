export interface EditRequest {
  id: string;
  bookingId: string;
  booking: {
    id: string;
    customerName: string;
    tourName: string;
  };
  requestedByUserId: string;
  reason: string;
  status: string;
  requestedAt: string;
}


export interface CancelRequest {
  id: string;
  bookingId: string;
  booking: {
    id: string;
    customerName: string;
    tourName: string;
  };
  requestedByUserId: string;
  reason: string;
  status: string;
  requestedAt: string;
}
