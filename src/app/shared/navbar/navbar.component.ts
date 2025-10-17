import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, UserRole } from '../../auth/services/auth.service';
import { HasRoleDirective } from '../directives/has-role.directive';

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
  
  UserRole = UserRole;

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
    // Customer-specific
    {
      label: 'My Bookings',
      route: '/bookings',
      roles: [UserRole.CUSTOMER],
      requiresAuth: true
    },
    // Consultant/Agency-specific (combined since they're in same org)
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
  ];

  ngOnInit(): void {
    if (this.authService.getToken() && !this.authService.currentUser()) {
      this.authService.getCurrentUser().subscribe({
        error: (err) => console.error('Failed to load user:', err)
      });
    }
  }

  openSignupModal(): void {
    this.router.navigate(['/auth/signup']);
  }

  openLoginModal(): void {
    this.router.navigate(['/auth/login']);
  }

  logout(): void {
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