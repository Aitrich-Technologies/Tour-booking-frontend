import { inject, Injectable, signal } from '@angular/core';
import { SignalrService } from './signalr.service';
import { AuthService } from '../../auth/services/auth.service';


export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: Date;
  link?: string;
}
@Injectable({
  providedIn: 'root'
})


export class NotificationService {

 private signalrService = inject(SignalrService);
  private authService = inject(AuthService);
  
  notifications = signal<Notification[]>([]);
  unreadCount = signal<number>(0);

  constructor() {
    // Subscribe to real-time notifications
    this.signalrService.notifications$.subscribe(message => {
      if (message) {
        // Add new notification to the beginning of the list
        const newNotification: Notification = {
          id: Date.now().toString(), // Temporary ID until refreshed from server
          title: 'New Notification',
          message: message,
          type: 'info',
          isRead: false,
          createdAt: new Date()
        };
        
        const current = this.notifications();
        this.notifications.set([newNotification, ...current]);
        this.updateUnreadCount();
      }
    });
  }

  loadNotifications(): void {
    const user = this.authService.currentUser();
    if (!user?.role) return;

    this.signalrService.getStoredNotifications(user.role).subscribe({
      next: (notifications) => {
        this.notifications.set(notifications);
        this.updateUnreadCount();
      },
      error: (err) => console.error('Failed to load notifications:', err)
    });
  }

  markAsRead(notificationId: string): void {
    this.signalrService.markAsRead(notificationId).subscribe({
      next: () => {
        const current = this.notifications();
        const updated = current.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        );
        this.notifications.set(updated);
        this.updateUnreadCount();
      },
      error: (err) => console.error('Failed to mark as read:', err)
    });
  }

  markAllAsRead(): void {
    const unreadIds = this.notifications().filter(n => !n.isRead).map(n => n.id);
    
    // Mark all unread notifications as read
    unreadIds.forEach(id => {
      this.signalrService.markAsRead(id).subscribe({
        error: (err) => console.error('Failed to mark notification as read:', err)
      });
    });

    // Update local state immediately
    const current = this.notifications();
    const updated = current.map(n => ({ ...n, isRead: true }));
    this.notifications.set(updated);
    this.updateUnreadCount();
  }

  deleteNotification(notificationId: string): void {
    // Update local state
    const current = this.notifications();
    const updated = current.filter(n => n.id !== notificationId);
    this.notifications.set(updated);
    this.updateUnreadCount();
  }

  private updateUnreadCount(): void {
    const count = this.notifications().filter(n => !n.isRead).length;
    this.unreadCount
}
}
