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


  getTour(){
    return this.http.get<TourResponse[]>(`${this.API_URL}/Tour`);
  }

  getTourById(id: string){
    return this.http.get<TourResponse>(`${this.API_URL}/Tour/${id}`);
  }

  addTourTerms(tourId: string, term: Terms){
    return this.http.post(`${this.API_URL}/Terms/${tourId}`, { term });
  }

  getTourTerms(tourId: string){
    return this.http.get<any[]>(`${this.API_URL}/Terms/${tourId}`);
  }

  addTourNotes( data: Notes){
    return this.http.post<Notes[]>(`${this.API_URL}/Notes`, { data });
  }

  getTourNotes(tourId: string){
    return this.http.get<any[]>(`${this.API_URL}/Notes/${tourId}`);
  }

  getAllCustomers(){
    return this.http.get<User[]>(`${this.API_URL}/User/GetAllCustomers`);
  }

  getAllConsultants(){
    return this.http.get<User[]>(`${this.API_URL}/User`);
  }
}
