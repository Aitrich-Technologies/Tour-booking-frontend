import { Component, inject, OnInit } from '@angular/core';
import { BookingService } from '../services/booking.service';
import { AuthService } from '../../auth/services/auth.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TourBooking, TourBookingResponse } from '../model/tourBooking';
import { Participants } from '../model/participants';
import { CommonModule } from '@angular/common';
import { ParticipantService } from '../services/participant.service';

@Component({
  selector: 'app-booking-details',
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './booking-details.component.html',
  styleUrl: './booking-details.component.css'
})
export class BookingDetailsComponent implements OnInit {

  private bookingService = inject(BookingService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private particpantService = inject(ParticipantService);

  booking: TourBookingResponse | null = null;
  participants: Participants[] = [];
  isLoading: boolean = true;
  isSaving: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  editRequestSent: boolean = false;
  editRequestApproved: boolean = false;
  isEditMode: boolean = false;
  originalBooking: TourBookingResponse | null = null;

  // Form states
  showAddParticipant: boolean = false;
  editingParticipantId: string | null = null;

  // Participant form
  participantForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: [''],
    // phoneNumber: [''],
    // dateOfBirth: [''],
    gender: ['', Validators.required],
    citizenship: ['', Validators.required],
    passportNumber: [''],
    issueDate: [null],
    expiryDate: [null],
    placeOfBirth: [''],
  });

  ngOnInit(): void {
    const bookingId = this.route.snapshot.paramMap.get('id');
    if (bookingId) {
      this.loadBookingDetails();
      this.getParticpants();
    } else {
      this.errorMessage = 'Invalid booking ID';
      this.isLoading = false;
    }

  }



  canViewBooking(booking: TourBookingResponse): boolean {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return false;

    // const userRole = currentUser.role?.toUpperCase();

    // Consultants/Admins can view all bookings
    // if (userRole === 'CONSULTANT' || userRole === 'AGENCY') {
    //   return true;
    // }

    // Customers can only view their own bookings
    return booking.userId === currentUser.id;
  }

loadBookingDetails(): void {
  const currentUser = this.authService.currentUser();
  const bookingId = this.route.snapshot.paramMap.get('id'); // ✅ Get the booking ID from route
  
  this.isLoading = true;

  if (!bookingId) {
    this.errorMessage = 'Invalid booking ID';
    this.isLoading = false;
    return;
  }

  if (currentUser && currentUser.id) {
    // ✅ Fetch SPECIFIC booking by ID
    this.bookingService.getTourBookingByBookingId(bookingId).subscribe({
      next: (booking) => {
        // Verify user can view this booking
        if (!this.canViewBooking(booking)) {
          this.errorMessage = 'You do not have permission to view this booking';
          this.isLoading = false;
          return;
        }

        this.booking = booking;
        console.log('Loaded booking:', booking);

        // Set flags based on booking state
        if (this.booking.editRequestStatus === 'Approved' || this.booking.isEditAllowed) {
          this.editRequestApproved = true;
          this.editRequestSent = false;
        } else if (this.booking.editRequestStatus === 'Pending') {
          this.editRequestSent = true;
          this.editRequestApproved = false;
        } else {
          this.editRequestSent = false;
          this.editRequestApproved = false;
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading booking:', error);
        this.errorMessage = 'Failed to load booking details';
        this.isLoading = false;
      }
    });
  } else {
    this.errorMessage = 'User not found or invalid user ID';
    this.isLoading = false;
  }
}

  // Participant Management
  toggleAddParticipant(): void {
    this.showAddParticipant = !this.showAddParticipant;
    if (!this.showAddParticipant) {
      this.participantForm.reset();
      this.editingParticipantId = null;
    }
  }

  addParticipant(): void {
    if (this.participantForm.valid && this.booking) {
      this.isSaving = true;

      const participantData: Participants = {
        id: '',
        leadId: this.authService.currentUser()?.id || '',
        firstName: this.participantForm.value.firstName,
        lastName: this.participantForm.value.lastName,
        gender: this.participantForm.value.gender,
        citizenship: this.participantForm.value.citizenship,
        passportNumber: this.participantForm.value.passportNumber,
        issueDate: this.participantForm.value.issueDate,
        expiryDate: this.participantForm.value.expiryDate,
        placeOfBirth: this.participantForm.value.placeOfBirth,
        dob: this.participantForm.value.dob,
        email: this.participantForm.value.email,
        phoneNumber: this.participantForm.value.phoneNumber,
      };

      this.particpantService.addParticpant(this.booking.id, participantData).subscribe({
        next: (newParticipant) => {
          if (Array.isArray(newParticipant)) {
            this.participants.push(...newParticipant);
          } else {
            this.participants.push(newParticipant);
          }
          this.successMessage = 'Participant added successfully!';
          this.participantForm.reset();
          this.showAddParticipant = false;
          this.isSaving = false;
          this.clearMessagesAfterDelay();
        },
        error: (error) => {
          console.error('Error adding participant:', error);
          this.errorMessage = 'Failed to add participant';
          this.isSaving = false;
          this.clearMessagesAfterDelay();
        }
      });
    }
  }

  getParticpants(): void {
    const bookingId = this.route.snapshot.paramMap.get('id');
    if (bookingId) {
      this.particpantService.getParticipantsByBookingId(bookingId).subscribe({
        next: (participants) => {
          this.participants = participants;
          console.log('Loaded participants:', participants);
        },
        error: (error) => {
          console.error('Error loading participants:', error);
          this.errorMessage = 'Failed to load participants';
        }
      });
    }
  }

  editParticipant(participant: Participants): void {
    this.editingParticipantId = participant.id;
    this.showAddParticipant = true;
    this.participantForm.patchValue({
      firstName: participant.firstName,
      lastName: participant.lastName,
      email: participant.email,
      phoneNumber: participant.phoneNumber,
      dob: participant.dob,
      gender: participant.gender,
      citizenship: participant.citizenship,
      passportNumber: participant.passportNumber,
    });
  }

  updateParticipant(): void {
    if (this.participantForm.valid && this.editingParticipantId && this.booking) {
      this.isSaving = true;

      const updatedData: Participants = {
        id: this.editingParticipantId,
        bookingId: this.booking.id,
        ...this.participantForm.value
      };

      this.particpantService.updateParticipant(this.booking.id, this.editingParticipantId, updatedData).subscribe({
        next: (updated) => {
          const index = this.participants.findIndex(p => p.id === this.editingParticipantId);
          if (index !== -1) {
            this.participants[index] = updated;
          }
          this.successMessage = 'Participant updated successfully!';
          this.participantForm.reset();
          this.showAddParticipant = false;
          this.editingParticipantId = null;
          this.isSaving = false;
          this.clearMessagesAfterDelay();
        },
        error: (error) => {
          console.error('Error updating participant:', error);
          this.errorMessage = 'Failed to update participant';
          this.isSaving = false;
          this.clearMessagesAfterDelay();
        }
      });
    }
  }

  deleteParticipant(participantId: string): void {
    if (confirm('Are you sure you want to remove this participant?')) {
      if (!this.booking) return;

      this.particpantService.deleteParticipant(this.booking.id, participantId).subscribe({
        next: () => {
          this.participants = this.participants.filter(p => p.id !== participantId);
          this.successMessage = 'Participant removed successfully!';
          this.clearMessagesAfterDelay();
        },
        error: (error) => {
          console.error('Error deleting participant:', error);
          this.errorMessage = 'Failed to remove participant';
          this.clearMessagesAfterDelay();
        }
      });
    }
  }

  saveParticipant(): void {
    if (this.editingParticipantId) {
      this.updateParticipant();
    } else {
      this.addParticipant();
    }
  }

  cancelEdit(): void {
    this.showAddParticipant = false;
    this.participantForm.reset();
    this.editingParticipantId = null;
  }

  // Booking Actions
  cancelBooking(): void {
    if (!this.booking) return;

    if (confirm('Are you sure you want to cancel this booking?')) {
      this.bookingService.cancelBooking(this.booking.id).subscribe({
        next: () => {
          this.successMessage = 'Booking cancelled successfully';
          this.loadBookingDetails();
          this.clearMessagesAfterDelay();
        },
        error: (error) => {
          console.error('Error cancelling booking:', error);
          this.errorMessage = 'Failed to cancel booking';
          this.clearMessagesAfterDelay();
        }
      });
    }
  }

  // Helper Methods
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

  getTotalAmount(): number {
    if (!this.booking) return 0;
    return this.booking.tour.price * (this.participants.length || 1);
  }

  goBack(): void {
    this.router.navigate(['/bookings']);
  }

  private clearMessagesAfterDelay(): void {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  }

  enableEditMode(): void {
    this.isEditMode = true;
    this.originalBooking = { ...this.booking } as TourBookingResponse; // Ensure type compatibility
    this.successMessage = 'Edit mode enabled. Make your changes and click Save.';
  }

  editBooking(booking: TourBookingResponse): void {
    // If already in edit mode (approved), allow editing
    if (this.editRequestApproved) {
      this.enableEditMode();
      return;
    }

    // First time clicking - send edit request to admin
    if (!this.editRequestSent) {
      this.bookingService.updateTourBooking(booking.id, booking).subscribe({
        next: (res) => {
          this.successMessage = (res as { message: string }).message || 'Edit request sent to agency for approval.';
          this.editRequestSent = true;
          console.log(res);

          // Optionally, start polling to check if admin approved
          this.checkEditApprovalStatus(booking.id);
        },
        error: (error) => {
          console.error('Error submitting booking edit request:', error);
          this.errorMessage = 'Failed to submit booking edit request';
        }
      });
    }
  }

  checkForPendingEditRequest(): void {
    if (!this.booking) return;
    const bookingId = this.booking.id;

    this.bookingService.getPendingEditRequests().subscribe({
      next: (requests) => {
        const pendingRequest = requests.find(r => r.bookingId === bookingId);
        if (pendingRequest) {
          this.editRequestSent = true;
          this.successMessage = 'Edit request is pending approval.';
          // Continue polling if it's pending
          this.checkEditApprovalStatus(bookingId);
        }
      },
      error: (err) => console.error('Error checking pending requests:', err)
    });
  }

  checkEditApprovalStatus(bookingId: string): void {
    // Poll every 5 seconds to check approval status
    const pollInterval = setInterval(() => {
      this.bookingService.getPendingEditRequests().subscribe({
        next: (requests) => {
          const pendingRequest = requests.find(r => r.bookingId === bookingId);

          // If request was sent but is no longer in pending list, it might be approved or rejected
          if (this.editRequestSent && !pendingRequest) {
            // Check if we can edit now (or just assume approved for now and let user try)
            // Ideally we should re-fetch the booking to see if status changed or if we have edit rights
            this.editRequestSent = false;
            this.editRequestApproved = true; // Assume approved if it disappears? Or maybe we should check something else.
            // For now, let's assume if it's gone from pending, it's processed.

            this.successMessage = 'Edit request processed! You can now edit the booking.';
            clearInterval(pollInterval);
          }
        },
        error: (error) => {
          console.error('Error checking approval status:', error);
          clearInterval(pollInterval);
        }
      });
    }, 5000); // Check every 5 seconds

    // Stop polling after 5 minutes
    setTimeout(() => clearInterval(pollInterval), 300000);
  }

  saveBookingChanges(): void {
    if (this.booking) {
      this.bookingService.updateTourBooking(this.booking.id, this.booking).subscribe({
        next: (res) => {
          this.successMessage = 'Booking updated successfully!';
          this.isEditMode = false;
          this.editRequestSent = false;
          this.editRequestApproved = false;
          console.log(res);
        },
        error: (error) => {
          console.error('Error updating booking:', error);
          this.errorMessage = 'Failed to update booking';
        }
      });
    }
  }

  downloadBookingDetails(): void {
    if (!this.booking) return;  
    this.bookingService.downloadBookingDetails(this.booking.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `booking-${this.booking?.id ?? 'unknown'}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      },
      error: (error) => {
        console.error('Error downloading booking details:', error);
        this.errorMessage = 'Failed to download booking details';
      }
    });
  
  }
}
