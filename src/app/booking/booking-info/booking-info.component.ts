import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BookingService } from '../services/booking.service';
import { TourBookingResponse } from '../model/tourBooking';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-booking-info',
  imports: [CommonModule, RouterModule],
  templateUrl: './booking-info.component.html',
  styleUrl: './booking-info.component.css'
})
export class BookingInfoComponent {
  booking: TourBookingResponse | null = null;
  loading: boolean = true;
  error: string | null = null;
  bookingId: string = '';
  expandedParticipant: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService
  ) { }

  ngOnInit(): void {
    this.bookingId = this.route.snapshot.paramMap.get('id') || '';
    if (this.bookingId) {
      this.loadBookingDetail();
    } else {
      this.error = 'No booking ID provided';
      this.loading = false;
    }
  }

  loadBookingDetail(): void {
    this.loading = true;
    // Assuming you'll add this method to your service
    this.bookingService.getTourBookingByBookingId(this.bookingId).subscribe({
      next: (data) => {
        this.booking = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load booking details';
        this.loading = false;
        console.error('Error fetching booking:', err);
      }
    });
  }

  getTotalParticipants(): number {
    return this.booking?.participants?.length || 0;
  }

  calculateTotalPrice(): number {
    if (!this.booking) return 0;
    const basePrice = this.booking.tour.price;
    const participants = this.getTotalParticipants();
    return basePrice * participants;
  }

  goBack(): void {
    this.router.navigate(['/bookings']);
  }

  editBooking(): void {
    this.router.navigate(['/bookings/edit', this.bookingId]);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  calculateAge(dob: string): number {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  getStatusBadgeClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'SAVE': 'bg-warning text-dark',
      'CONFIRMED': 'bg-success',
      'PENDING': 'bg-info',
      'CANCELLED': 'bg-danger'
    };
    return statusMap[status] || 'bg-secondary';
  }

  isPassportExpiringSoon(expiryDate: string): boolean {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(today.getMonth() + 6);
    return expiry <= sixMonthsFromNow;
  }

  toggleParticipant(participantId: string): void {
    this.expandedParticipant = this.expandedParticipant === participantId ? null : participantId;
  }
}
