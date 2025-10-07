import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, UserRole } from '../services/auth.service';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    
    // Check if user is authenticated
    if (!authService.isLoggedIn()) {
      router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: state.url }
      });
      return false;
    }
    
    // Check if user has required role
    if (authService.hasAnyRole(allowedRoles)) {
      return true;
    }
    
    // User doesn't have required role - redirect to appropriate page
    const user = authService.currentUser();
    
    // Redirect to role-specific home page
    switch(user?.role) {
      case UserRole.AGENCY:
        router.navigate(['/agency/dashboard']);
        break;
      case UserRole.CONSULTANT:
        router.navigate(['/consultant/dashboard']);
        break;
      case UserRole.CUSTOMER:
        router.navigate(['/']);
        break;
      default:
        router.navigate(['/unauthorized']);
    }
    
    return false;
  };
};

