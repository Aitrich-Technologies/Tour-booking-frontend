import { inject, Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment.development';
import { AuthService } from '../../auth/services/auth.service';
import { BehaviorSubject } from 'rxjs';
import { ToastService } from './toast.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  protected API_BASE_URL = environment.API_URL;
  private hubConnection!: signalR.HubConnection;
  private notificationSource = new BehaviorSubject<string | null>(null);
  notifications$ = this.notificationSource.asObservable();
  private toastService = inject(ToastService);
  private http = inject(HttpClient);

  constructor(private authService: AuthService) { }

  startConnection() {
    const token = this.authService.getToken();
    if (!token) return;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(environment.hubUrl, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()
      .then(() => {
        console.log('SignalR connected');
        // this.toastService.success('Connected to notifications');
      })
      .catch(err => {
        console.error('SignalR error', err);
        // this.toastService.error('Failed to connect to notifications');
      });

    this.hubConnection.on('ReceiveNotification', (message: string) => {
      console.log('Notification received:', message);
      this.notificationSource.next(message);
      // Show toast notification
      this.toastService.info(message, 8000);
    });
  }

  stopConnection() {
    this.hubConnection?.stop()
      .then(() => console.log('SignalR disconnected'))
      .catch(err => console.error(err));
  }

getStoredNotifications(role: string) {
  return this.http.get<any[]>(`${this.API_BASE_URL}/Notification/role/${role}`);
}

markAsRead(id: string) {
  return this.http.put(`${this.API_BASE_URL}/Notification/${id}/read`, {});
}
}
