import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { BookingService } from '../services/booking.service';
import { TourServiceService } from '../../tour/services/tour-service.service';
import { TourBookingResponse } from '../model/tourBooking';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-agency-bookings',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './agency-bookings.component.html',
  styleUrl: './agency-bookings.component.css'
})
export class AgencyBookingsComponent implements OnInit {

  bookings: TourBookingResponse[] = [];
  filteredBookings: TourBookingResponse[] = [];
  loading: boolean = true;
  error: string | null = null;
  searchTerm: string = '';
  selectedStatus: string = 'all';

  private bookingService = inject(BookingService)
  private router = inject(Router)

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading = true;
    this.bookingService.getAllBookings().subscribe({
      next: (data) => {
        this.bookings = data;
        this.filteredBookings = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load bookings';
        this.loading = false;
        console.error('Error fetching bookings:', err);
      }
    });
  }

  filterBookings(): void {
    this.filteredBookings = this.bookings.filter(booking => {
      const matchesSearch = 
        booking.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        booking.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        booking.tour.tourName.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = this.selectedStatus === 'all' || booking.status === this.selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  viewBookingDetails(bookingId: string): void {
    this.router.navigate(['/bookings/booking-info/', bookingId]);
  }

  getStatusBadgeClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'SAVE': 'bg-warning',
      'CONFIRMED': 'bg-success',
      'PENDING': 'bg-info',
      'CANCELLED': 'bg-danger'
    };
    return statusMap[status] || 'bg-secondary';
  }
  
}