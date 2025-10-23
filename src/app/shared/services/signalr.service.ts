import { inject, Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment.development';
import { AuthService } from '../../auth/services/auth.service';
import { BehaviorSubject } from 'rxjs';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  private hubConnection!: signalR.HubConnection;
  private notificationSource = new BehaviorSubject<string | null>(null);
  notifications$ = this.notificationSource.asObservable();
  private toastService = inject(ToastService);

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
        this.toastService.success('Connected to notifications');
      })
      .catch(err => {
        console.error('SignalR error', err);
        this.toastService.error('Failed to connect to notifications');
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
}
