import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { TourBooking, TourBookingResponse } from '../model/tourBooking';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  protected API_URL = environment.API_URL;
  
  constructor(private http: HttpClient) { }

    bookTour(data: any){
    return this.http.post<TourBooking[]>(`${this.API_URL}/TourBooking`,data)
   }

   getAllBookings(){
    return this.http.get<TourBookingResponse[]>(`${this.API_URL}/TourBooking`);
   }

   getTourBookingByBookingId(id: string){
    return this.http.get<TourBookingResponse>(`${this.API_URL}/TourBooking/booking/${id}`);
   }

   getTourBookingByUserId(userId: string){
    return this.http.get<TourBookingResponse[]>(`${this.API_URL}/TourBooking/user/${userId}`);
   }

   getTourByTourId(id: string){
    return this.http.get<TourBooking[]>(`${this.API_URL}/Tour/${id}`);
   }

    getTourBookingByTourId(tourId: string){
    return this.http.get<any[]>(`${this.API_URL}/TourBooking/tour/${tourId}`);
    }



}
