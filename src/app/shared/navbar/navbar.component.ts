import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, UserRole } from '../../auth/services/auth.service';
import { HasRoleDirective } from '../directives/has-role.directive';
import { SignalrService } from '../services/signalr.service';
import { NotificationService } from '../services/notification.service';

interface NavItem {
  label: string;
  route: string;
  roles: UserRole[]; // Empty array means visible to all (including non-authenticated)
  requiresAuth?: boolean; // If true, only shown when authenticated
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule, HasRoleDirective],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  private router = inject(Router);
  authService = inject(AuthService);
  notificationService = inject(NotificationService);
  private signalrService = inject(SignalrService);
  
  UserRole = UserRole;
  showNotifications = false;

  navItems: NavItem[] = [
    {
      label: 'Home',
      route: '/',
      roles: []
    },
    {
      label: 'Tours',
      route: '/tour/catalog',
      roles: [UserRole.CUSTOMER]
    },
    {
      label: 'Destinations',
      route: '/destinations',
      roles: []
    },
    {
      label: 'My Bookings',
      route: '/bookings',
      roles: [UserRole.CUSTOMER],
      requiresAuth: true
    },
    {
      label: 'Manage Tours',
      route: '/tour/manage',
      roles: [UserRole.CONSULTANT, UserRole.AGENCY],
      requiresAuth: true
    },
    {
      label: 'Booking Requests',
      route: '/bookings/manage',
      roles: [UserRole.CONSULTANT, UserRole.AGENCY],
      requiresAuth: true
    },
    {
      label: 'Manage Consultants',
      route: '/consultants',
      roles: [UserRole.AGENCY],
      requiresAuth: true
    },
    {
      label: 'Edit Requests',
      route: '/edit-requests',
      roles: [UserRole.AGENCY, UserRole.CONSULTANT],
      requiresAuth: true
    }
  ];

  ngOnInit(): void {
    if (this.authService.getToken() && !this.authService.currentUser()) {
      this.authService.getCurrentUser().subscribe({
        error: (err) => console.error('Failed to load user:', err)
      });
    }

    // Start SignalR connection and load notifications if authenticated
    if (this.authService.isAuthenticated()) {
      this.signalrService.startConnection();
      this.notificationService.loadNotifications();
    }
  }

  ngOnDestroy(): void {
    // Stop SignalR connection when component is destroyed
    this.signalrService.stopConnection();
  }

  // Close notifications dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.notification-dropdown, .notification-bell');
    
    if (!clickedInside && this.showNotifications) {
      this.showNotifications = false;
    }
  }

  toggleNotifications(event: Event): void {
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;
    
    // Reload notifications when opening
    if (this.showNotifications) {
      this.notificationService.loadNotifications();
    }
  }

  markAsRead(notificationId: string, event: Event): void {
    event.stopPropagation();
    this.notificationService.markAsRead(notificationId);
  }

  markAllAsRead(event: Event): void {
    event.stopPropagation();
    this.notificationService.markAllAsRead();
  }

  deleteNotification(notificationId: string, event: Event): void {
    event.stopPropagation();
    this.notificationService.deleteNotification(notificationId);
  }

  handleNotificationClick(notification: any): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id);
    }
    if (notification.link) {
      this.router.navigate([notification.link]);
      this.showNotifications = false;
    }
  }

  getNotificationIcon(type: string): string {
    switch(type) {
      case 'success': return 'bi-check-circle-fill text-success';
      case 'warning': return 'bi-exclamation-triangle-fill text-warning';
      case 'error': return 'bi-x-circle-fill text-danger';
      default: return 'bi-info-circle-fill text-primary';
    }
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const notificationDate = new Date(date);
    const diff = now.getTime() - notificationDate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }

  openSignupModal(): void {
    this.router.navigate(['/auth/signup']);
  }

  openLoginModal(): void {
    this.router.navigate(['/auth/login']);
  }

  logout(): void {
    this.signalrService.stopConnection();
    this.authService.logout();
  }

  shouldShowNavItem(item: NavItem): boolean {
    if (item.roles.length === 0 && !item.requiresAuth) {
      return true;
    }

    if (item.requiresAuth && !this.authService.isAuthenticated()) {
      return false;
    }

    if (item.roles.length > 0) {
      return this.authService.hasAnyRole(item.roles);
    }

    return true;
  }

  getUserInitials(): string {
    const user = this.authService.currentUser();
    if (!user) return '';
    return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
  }

  currentUserName(): string {
    const user = this.authService.currentUser();
    if (!user) return '';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim();
  }

  getUserRole(): string {
    const user = this.authService.currentUser();
    if (!user?.role) return '';
    
    switch(user.role) {
      case UserRole.CONSULTANT:
        return 'Tour Consultant';
      case UserRole.AGENCY:
        return 'Agency Admin';
      case UserRole.CUSTOMER:
        return 'Customer';
      default:
        return '';
    }
  }
}