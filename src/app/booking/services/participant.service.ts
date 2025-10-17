import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Participants } from '../model/participants';

@Injectable({
  providedIn: 'root'
})
export class ParticipantService {

  protected BASE_URL = environment.API_URL;

  constructor( private http: HttpClient) { }

  addParticpant(bookingId: any, data : any){
    return this.http.post<Participants[]>(`${this.BASE_URL}/Participant/${bookingId}`, data);
  }

  getParticipantsByBookingId(bookingId: string){
    return this.http.get<Participants[]>(`${this.BASE_URL}/Participant/${bookingId}`);
  }

  updateParticipant(bookingId: string,participantId: string, data: any){
    return this.http.put<Participants>(`${this.BASE_URL}/Participant/${bookingId}/${participantId}`, data);
  }

  deleteParticipant(bookingId: string, participantId: string){
    return this.http.delete(`${this.BASE_URL}/Participant/${bookingId}/${participantId}`);
  }
}
