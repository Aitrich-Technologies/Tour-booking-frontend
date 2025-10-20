import { Component, computed, inject, signal } from '@angular/core';
import { ListTourComponent } from '../../tour/list-tour/list-tour.component';
import { AuthService } from '../../auth/services/auth.service';
import { TourCatalogComponent } from '../../tour/tour-catalog/tour-catalog.component';

@Component({
  selector: 'app-home',
  imports: [TourCatalogComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
     private authService = inject(AuthService);
  
  // Signals for reactive state
  user = this.authService.currentUser;
  isLoading = this.authService.isLoading;
  isRefreshing = this.authService.isLoading;
  errorMessage = signal<string | null>(null);
  
  // Computed properties
  isAdmin = computed(() => {
    return this.user()?.role?.toLowerCase() === 'agency';
  });

  ngOnInit() {
    // Refresh user data on component init
    this.loadUserProfile();
  }

  /**
   * Load user profile from backend
   */
  loadUserProfile() {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        console.log('User profile loaded:', user);
      },
      error: (error) => {
        this.errorMessage.set('Failed to load profile. Please try again.');
        console.error('Error loading profile:', error);
      }
    });
  }

  /**
   * Refresh profile data
   */
  refreshProfile() {
    this.errorMessage.set(null);
    this.authService.refreshCurrentUser().subscribe({
      next: (user) => {
        console.log('Profile refreshed:', user);
        // Could show a success toast here
      },
      error: (error) => {
        this.errorMessage.set('Failed to refresh profile.');
        console.error('Error refreshing profile:', error);
      }
    });
  }

  /**
   * Logout user
   */
  logout() {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
    }
  }

}
