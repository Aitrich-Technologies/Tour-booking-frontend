import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Consultant } from '../models/consultant';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  protected API_URL = environment.API_URL;

  constructor(private http: HttpClient) { }


  addConsultant(data: Consultant){
    return this.http.post<Consultant[]>(`${this.API_URL}/User/AddConsultant`,data)
  }

  getAllUsers(){
    return this.http.get<Consultant[]>(`${this.API_URL}/User`);
  }

  deleteUser(id: string){
    return this.http.delete(`${this.API_URL}/User/${id}`);
  }

  editUser(id: string, data: Consultant){
    return this.http.put<Consultant[]>(`${this.API_URL}/User/${id}`,data)
  }
}
