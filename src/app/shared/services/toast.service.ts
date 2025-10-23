import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  delay?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {

   private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();
  private toastId = 0;

  show(message: string, type: Toast['type'] = 'info', delay: number = 5000) {
    const toast: Toast = {
      id: this.toastId++,
      message,
      type,
      delay
    };

    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, toast]);

    // Auto-remove toast after delay
    if (delay > 0) {
      setTimeout(() => this.remove(toast.id), delay);
    }
  }

  success(message: string, delay?: number) {
    this.show(message, 'success', delay);
  }

  error(message: string, delay?: number) {
    this.show(message, 'error', delay);
  }

  warning(message: string, delay?: number) {
    this.show(message, 'warning', delay);
  }

  info(message: string, delay?: number) {
    this.show(message, 'info', delay);
  }

  remove(id: number) {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter(t => t.id !== id));
  }
}
