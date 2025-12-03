import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BookingService } from '../services/booking.service';
import { TourBookingResponse } from '../model/tourBooking';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-booking-info',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './booking-info.component.html',
  styleUrl: './booking-info.component.css'
})
export class BookingInfoComponent {
  booking: TourBookingResponse | null = null;
  loading: boolean = true;
  error: string | null = null;
  bookingId: string = '';
  expandedParticipant: string | null = null;
  
  // Edit mode properties
  editMode: boolean = false;
  editedBooking: any = null;
  saving: boolean = false;
  saveError: string | null = null;
  
  // Status management
  bookingStatuses = ['SUBMITTED', 'CONFIRMED', 'REJECTED', 'CLOSED'];
  selectedStatus: string = '';
  statusUpdateSuccess: string | null = null;

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

  // Status update methods
  updateBookingStatus(newStatus: string): void {
    if (!this.booking) return;

    // Don't allow changing if already closed
    if (this.booking.status?.toString().toUpperCase() === 'CLOSED') {
      this.saveError = 'Cannot change status of a closed booking';
      this.clearMessagesAfterDelay();
      return;
    }

    const statusMessages: { [key: string]: string } = {
      'SUBMITTED': 'submit',
      'CONFIRMED': 'confirm',
      'REJECTED': 'reject',
      'CLOSED': 'close'
    };

    const action = statusMessages[newStatus] || 'update';
    
    if (confirm(`Are you sure you want to ${action} this booking?`)) {
      this.saving = true;
      this.bookingService.updateBookingStatus(this.bookingId, newStatus).subscribe({
        next: () => {
          this.saving = false;
          this.statusUpdateSuccess = `Booking ${action}ed successfully`;
          // Update local booking status
          if (this.booking) {
            this.booking.status = newStatus;
          }
          this.selectedStatus = ''; // Reset dropdown
          this.clearMessagesAfterDelay();
        },
        error: (error) => {
          this.saving = false;
          console.error('Error updating booking:', error);
          this.saveError = `Failed to ${action} booking`;
          this.selectedStatus = ''; // Reset dropdown
          this.clearMessagesAfterDelay();
        }
      });
    } else {
      this.selectedStatus = ''; // Reset dropdown if cancelled
    }
  }

  onStatusChange(event: any): void {
    const newStatus = event.target.value;
    if (newStatus && newStatus !== this.booking?.status) {
      this.updateBookingStatus(newStatus);
    }
  }

  getAvailableStatuses(): string[] {
    if (!this.booking?.status) return this.bookingStatuses;
    
    const currentStatus = this.booking.status.toString().toUpperCase();
    
    // Don't show current status in dropdown
    return this.bookingStatuses.filter(status => status !== currentStatus);
  }

  clearMessagesAfterDelay(): void {
    setTimeout(() => {
      this.statusUpdateSuccess = null;
      this.saveError = null;
    }, 5000);
  }

  enableEditMode(): void {
    if (!this.booking) return;
    
    this.editMode = true;
    // Create a deep copy of the booking for editing
    this.editedBooking = {
      id: this.booking.id,
      tourId: this.booking.tour.id,
      firstName: this.booking.firstName,
      lastName: this.booking.lastName,
      gender: this.booking.gender,
      dob: this.formatDateForInput(this.booking.dob),
      citizenship: this.booking.citizenship,
      passportNumber: this.booking.passportNumber,
      issueDate: this.formatDateForInput(this.booking.issueDate),
      expiryDate: this.formatDateForInput(this.booking.expiryDate),
      placeOfBirth: this.booking.placeOfBirth,
      leadPassenger: this.booking.leadPassenger === 'true',
      participantType: this.booking.participantType,
      status: this.booking.status
    };
    this.saveError = null;
  }

  cancelEdit(): void {
    this.editMode = false;
    this.editedBooking = null;
    this.saveError = null;
  }

  saveBooking(): void {
    if (!this.editedBooking) return;
    
    this.saving = true;
    this.saveError = null;
    
    this.bookingService.updateTourBooking(this.bookingId, this.editedBooking).subscribe({
      next: (response) => {
        this.saving = false;
        this.editMode = false;
        this.editedBooking = null;
        this.statusUpdateSuccess = 'Booking updated successfully';
        // Reload the booking to get the updated data
        this.loadBookingDetail();
        this.clearMessagesAfterDelay();
      },
      error: (err) => {
        this.saving = false;
        this.saveError = 'Failed to update booking. Please try again.';
        console.error('Error updating booking:', err);
      }
    });
  }

  formatDateForInput(date: string): string {
    // Convert to YYYY-MM-DD format for input fields
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
    this.enableEditMode();
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
    const statusLower = status?.toString().toLowerCase() || '';
    
    const statusMap: { [key: string]: string } = {
      'submitted': 'bg-warning text-dark',
      'confirmed': 'bg-success',
      'rejected': 'bg-danger',
      'closed': 'bg-secondary',
      // Legacy statuses
      'save': 'bg-warning text-dark',
      'pending': 'bg-info',
      'cancelled': 'bg-danger'
    };
    return statusMap[statusLower] || 'bg-secondary';
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

  printBooking(): void {
    this.bookingService.printBooking(this.bookingId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `booking_${this.bookingId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    });
  }
}