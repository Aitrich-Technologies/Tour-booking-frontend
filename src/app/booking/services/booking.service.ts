import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { TourBooking, TourBookingResponse } from '../model/tourBooking';
import { Observable } from 'rxjs';
import { CancelRequest, EditRequest } from '../../shared/models/requests';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  protected API_URL = environment.API_URL;

  constructor(private http: HttpClient) { }

  bookTour(data: any) {
    return this.http.post<TourBooking[]>(`${this.API_URL}/TourBooking`, data)
  }

  getAllBookings() {
    return this.http.get<TourBookingResponse[]>(`${this.API_URL}/TourBooking`);
  }

  getTourBookingByBookingId(id: string) {
    return this.http.get<TourBookingResponse>(`${this.API_URL}/TourBooking/booking/${id}`);
  }

  getTourBookingByUserId(userId: string) {
    return this.http.get<TourBookingResponse[]>(`${this.API_URL}/TourBooking/user/${userId}`);
  }

  getTourByTourId(id: string) {
    return this.http.get<TourBooking[]>(`${this.API_URL}/Tour/${id}`);
  }

  getTourBookingByTourId(tourId: string) {
    return this.http.get<any[]>(`${this.API_URL}/TourBooking/tour/${tourId}`);
  }

  updateTourBooking(id: string, data: TourBookingResponse) {
    return this.http.put(`${this.API_URL}/TourBooking/${id}`, data)
  }

  updateBookingStatus(id: string, status: string) {
    return this.http.patch(`${this.API_URL}/TourBooking/${id}`, { status })
  }

  approveEditRequest(bookingId: string): Observable<any> {
    return this.http.patch(`${this.API_URL}/TourBooking/${bookingId}/Approve-edit`, {});
  }

  getPendingEditRequests(): Observable<EditRequest[]> {
    return this.http.get<EditRequest[]>(`${this.API_URL}/TourBooking/Pending-edits`);
  }

  downloadBookingDetails(id: string): Observable<Blob> {
    return this.http.get(`${this.API_URL}/TourBooking/booking/${id}/document`, { responseType: 'blob' });
  }

  printBooking(id: string): Observable<Blob> {
    return this.http.post(`${this.API_URL}/TourBooking/booking/${id}/send-document`, {}, { responseType: 'blob' });
  }

  cancelBooking(id: string): Observable<any> {
    return this.http.patch(`${this.API_URL}/TourBooking/${id}/cancel`, { reason: 'Cancelled by user' });
  }

  getCancelledBookings(): Observable<CancelRequest[]> {
    return this.http.get<CancelRequest[]>(`${this.API_URL}/TourBooking/cancelled`);
  }



}
