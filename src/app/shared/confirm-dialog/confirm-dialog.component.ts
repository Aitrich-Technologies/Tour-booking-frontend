import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Toast, ToastService } from '../services/toast.service';
import { CommonModule } from '@angular/common';
import { SignalrService } from '../services/signalr.service';
import { Notifications } from '../models/notification';

@Component({
  selector: 'app-confirm-dialog',
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css'
})
export class ConfirmDialogComponent {

   toasts: Toast[] = [];
   notifications: Notifications[] = [];
   role = localStorage.getItem('role') ?? '';

  constructor(private toastService: ToastService, private signalrService: SignalrService) {}

  ngOnInit() {

  this.toastService.toasts$.subscribe(toasts => {
    this.toasts = toasts;
  });
  
  
this.signalrService.notifications$.subscribe((notification) => {
  if (notification) {
    console.log("=== NOTIFICATION RECEIVED ===");
    console.log("Full object:", notification);

    console.log("All keys:", Object.keys(notification));
    console.log("=========================");

  } 
});

  this.signalrService.getStoredNotifications(this.role).subscribe({
    next: (data) => (this.notifications = data),
    error: (err) => console.error('Error loading stored notifications', err)
  });
}
  

    markAsRead(id: string) {
      console.log("hi");
      
    this.signalrService.markAsRead(id).subscribe(() => {
      this.notifications = this.notifications.filter((n) => n.id !== id);
    });
  }

  getToastClass(type: Toast['type']): string {
    const classes: Record<Toast['type'], string> = {
      success: 'bg-success',
      error: 'bg-danger',
      warning: 'bg-warning',
      info: 'bg-info'
    };
    return classes[type];
  }

  removeToast(id: number) {
    this.toastService.remove(id);
  }
}


