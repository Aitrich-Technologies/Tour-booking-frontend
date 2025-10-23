import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Tour, TourResponse } from '../model/tour';
import { User } from '../../auth/model/user';
import { Notes } from '../model/notes';
import { Terms } from '../model/terms';


@Injectable({
  providedIn: 'root'
})

export class TourServiceService {

  protected API_URL = environment.API_URL;
  
  constructor(private http: HttpClient) { }

  addTour(data: Tour ){
    return this.http.post<Tour[]>(`${this.API_URL}/Tour`,data)
  }


  getAllTour(){
    return this.http.get<TourResponse[]>(`${this.API_URL}/Tour`);
  }

  getTourById(id: string){
    return this.http.get<TourResponse>(`${this.API_URL}/Tour/${id}`);
  }

  addTourTerms(tourId: string, term: Terms){
    return this.http.post<Terms[]>(`${this.API_URL}/Terms/${tourId}`, term );
  }

  updateTourStatus(id: string){
    return this.http.put<TourResponse>(`${this.API_URL}/Tour/UpdateStatus/${id}`, {});
  }

  getTourByCustomerId(customerId: string){
    return this.http.get<TourResponse[]>(`${this.API_URL}/Tour/customer/${customerId}`);
  }

  getTourTerms(tourId: string){
    return this.http.get<Terms[]>(`${this.API_URL}/Terms/tour/${tourId}`);
  }

  deleteTourTerm(id: string){
    return this.http.delete(`${this.API_URL}/Terms/${id}`);
  }

  addTourNotes( data: Notes){
    return this.http.post<Notes[]>(`${this.API_URL}/Notes`,  data );
  }

  getTourNotes(tourId: string){
    return this.http.get<Notes[]>(`${this.API_URL}/Notes/tour/${tourId}`);
  }

  deleteTourNote(id: string){
    return this.http.delete(`${this.API_URL}/Notes/${id}`);
  }

  getAllCustomers(){
    return this.http.get<User[]>(`${this.API_URL}/User/GetAllCustomers`);
  }

  getAllConsultants(){
    return this.http.get<User[]>(`${this.API_URL}/User`);
  }

  updateTour(id: string, tourData: TourResponse){
    return this.http.put<TourResponse>(`${this.API_URL}/Tour/${id}`, tourData)
  }
}
