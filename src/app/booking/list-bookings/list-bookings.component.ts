import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../services/booking.service';
import { AuthService } from '../../auth/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { TourBooking, TourBookingResponse } from '../model/tourBooking';


@Component({
  selector: 'app-list-bookings',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './list-bookings.component.html',
  styleUrl: './list-bookings.component.css'
})
export class ListBookingsComponent {
  private bookingService = inject(BookingService);
  private authService = inject(AuthService);
  private router = inject(Router);

  bookings: TourBookingResponse[] = [];
  filteredBookings: TourBookingResponse[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  // Filter options
  statusFilter: string = 'all';
  searchTerm: string = '';

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    const currentUser = this.authService.currentUser();
    const userRole = currentUser?.role?.toUpperCase();

    if (userRole === 'CONSULTANT' || userRole === 'ADMIN') {
      // Admins/Consultants see ALL bookings
      this.bookingService.getAllBookings().subscribe({
        next: (data) => {
          this.bookings = data;
          this.filteredBookings = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = 'Error loading bookings';
          this.isLoading = false;
        }
      });
    } else {
      // Customers see ONLY their bookings
      if (currentUser && currentUser.id) {
        this.bookingService.getTourBookingByUserId(currentUser.id).subscribe({
          next: (data) => {
            this.bookings = data;
            this.filteredBookings = data;
            this.isLoading = false;
          },
          error: (err) => {
            this.errorMessage = 'Error loading bookings';
            this.isLoading = false;
          }
        });
      } else {
        this.errorMessage = 'User not found or invalid user ID';
        this.isLoading = false;
      }
    }
  }

  /**
   * Check if current user can view this booking
   */
  canViewBooking(booking: TourBooking, userId: string): boolean {
    const userRole = this.authService.currentUser()?.role?.toUpperCase();

    // Consultants/Admins can see all bookings
    if (userRole === 'CONSULTANT' || userRole === 'ADMIN') {
      return true;
    }

    // Customers can only see their own bookings
    return booking.id === userId;
  }

  /**
   * Navigate to booking details page
   */
  viewBookingDetails(bookingId: string): void {
    this.router.navigate(['/bookings', bookingId]);
  }

  /**
   * Filter bookings by status
   */
  filterByStatus(status: string): void {
    this.statusFilter = status;
    this.applyFilters();
  }

  /**
   * Search bookings
   */
  onSearch(): void {
    this.applyFilters();
  }

  /**
   * Apply all filters
   */
  applyFilters(): void {
    let filtered = [...this.bookings];

    // Status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(b =>
        String(b.status)?.toLowerCase() === this.statusFilter.toLowerCase()
      );
    }

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(b =>
        b.id?.toLowerCase().includes(term) ||
        b.firstName?.toLowerCase().includes(term) ||
        b.tour.tourName?.toLowerCase().includes(term)
      );
    }

    this.filteredBookings = filtered;
  }

  /**
   * Reset all filters
   */
  resetFilters(): void {
    this.statusFilter = 'all';
    this.searchTerm = '';
    this.filteredBookings = [...this.bookings];
  }

  /**
   * Get status badge class
   */
  getStatusBadgeClass(status: string): string {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'confirmed':
        return 'bg-success';
      case 'pending':
        return 'bg-warning text-dark';
      case 'cancelled':
        return 'bg-danger';
      case 'completed':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  }

  /**
   * Navigate to create booking
   */
  createNewBooking(): void {
    this.router.navigate(['/tours']); // or wherever your tour catalog is
  }

}
