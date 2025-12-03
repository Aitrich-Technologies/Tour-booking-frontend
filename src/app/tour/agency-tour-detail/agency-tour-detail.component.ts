import { Component, inject, ViewChild, AfterViewInit, OnInit  } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TourServiceService } from '../services/tour-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { BookingService } from '../../booking/services/booking.service';
import { Notes } from '../model/notes';
import { Terms } from '../model/terms';
import { TourBooking } from '../../booking/model/tourBooking';
import { TourResponse } from '../model/tour';


@Component({
  selector: 'app-agency-tour-detail',
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './agency-tour-detail.component.html',
  styleUrl: './agency-tour-detail.component.css'
})
export class AgencyTourDetailComponent implements OnInit,AfterViewInit  {
 @ViewChild('tourNoteForm') form: any;
  // @ViewChild('editTourForm') editTourForm!: NgForm;

  tourId: string = '';
  tour!: TourResponse;
  terms: Terms[] = [];
  notes: Notes[] = [];
  bookings: TourBooking[] = [];
  loading: boolean = true;
  selectedStatus: string = 'SAVE';
  previousStatus: string = 'SAVE';
  pendingStatus: string = '';
  private modalElement: any;

  
  // For adding new terms/notes
  newTerm: string = '';
  tourNotes: string = '';
  showAddTerm: boolean = false;
  showAddNote: boolean = false;
  
  // For editing tour
  isEditMode: boolean = false;
  editedTour!: TourResponse;

  tourNotesData: Notes = {
    id: '',
    tourId: '',
    tourNotes: '',
    status: '',
  }

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tourService = inject(TourServiceService);
  private bookingService = inject(BookingService);

  ngOnInit(): void {
    this.tourId = this.route.snapshot.paramMap.get('id') || '';
    this.loadTourData();
      if (this.tour && this.tour.status) {
      this.selectedStatus = this.tour.status;
    }
  }

    ngAfterViewInit(): void {
    // Wait for view to initialize before getting modal element
    setTimeout(() => {
      this.modalElement = document.getElementById('statusChangeModal');
    }, 100);
  }

  loadTourData(): void {
    this.loading = true;
    
    this.tourService.getTourById(this.tourId).subscribe({
      next: (data) => {
        this.tour = data;
        this.editedTour = { ...data }; // Create a copy for editing
        this.loading = false;
      }
    });

    this.loadTermsAndNotes();
    this.loadBookings();
  }

  loadTermsAndNotes(): void {
    this.tourService.getTourTerms(this.tourId).subscribe({
      next: (terms) => this.terms = terms
    });

    this.tourService.getTourNotes(this.tourId).subscribe({
      next: (notes) => this.notes = notes
    });
  }

  loadBookings(): void {
    this.bookingService.getTourBookingByTourId(this.tourId).subscribe({
      next: (bookings) => this.bookings = bookings
    });
  }

  // Toggle edit mode
  editTour(): void {
    this.isEditMode = true;
    this.editedTour = { ...this.tour }; // Create fresh copy when entering edit mode
  }

  // Cancel edit mode
  cancelEdit(): void {
    this.isEditMode = false;
    this.editedTour = { ...this.tour }; // Reset to original values
  }

  // Save edited tour
  saveTour(): void {
    // if (this.editTourForm.valid) {
      this.loading = true;
      
      this.tourService.updateTour(this.tourId, this.editedTour).subscribe({
        next: (updatedTour) => {
          this.tour = updatedTour;
          this.editedTour = { ...updatedTour };
          this.isEditMode = false;
          this.loading = false;
          console.log('Tour updated successfully:', updatedTour);
          // Optionally show success message
        },
        error: (error) => {
          console.error('Error updating tour:', error);
          this.loading = false;
          // Optionally show error message
        }
      });
    // }
  }

  onStatusChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value;
    
    // If status hasn't changed, do nothing
    if (newStatus === this.selectedStatus) {
      return;
    }
    
    this.pendingStatus = newStatus;
    
    // Try to show modal
    try {
      if (this.modalElement) {
        const bootstrapModal = new (window as any).bootstrap.Modal(this.modalElement);
        bootstrapModal.show();
      } else {
        // Fallback: use native browser confirm
        if (confirm(`Are you sure you want to change status from ${this.selectedStatus} to ${newStatus}?`)) {
          this.selectedStatus = newStatus;
          this.updateStatus();
        } else {
          // Reset select to previous value
          (event.target as HTMLSelectElement).value = this.selectedStatus;
        }
      }
    } catch (error) {
      console.error('Modal error:', error);
      // Fallback: use native browser confirm
      if (confirm(`Are you sure you want to change status from ${this.selectedStatus} to ${newStatus}?`)) {
        this.selectedStatus = newStatus;
        this.updateStatus();
      } else {
        // Reset select to previous value
        (event.target as HTMLSelectElement).value = this.selectedStatus;
      }
    }
  }

  confirmStatusChange(): void {
    this.selectedStatus = this.pendingStatus;
    this.updateStatus();
  }

  updateStatus(): void {
    this.tourService.updateTourStatus(this.tourId, this.selectedStatus).subscribe({
      next: (updatedTour) => {
        this.tour = updatedTour;
        console.log('Tour status updated:', updatedTour);
        alert('✅ Status updated successfully!');
      },
      error: (error) => {
        console.error('Error updating tour status:', error);
        alert('❌ Failed to update status. Please try again.');
        // Note: We already changed selectedStatus, but API failed
        // You might want to fetch the current status again
      }
    });
  }

  cancelStatusChange(): void {
    // Reset the select dropdown to previous status
    const selectElement = document.getElementById('tourStatus') as HTMLSelectElement;
    if (selectElement) {
      selectElement.value = this.selectedStatus;
    }
    this.pendingStatus = '';
  }

  getStatusBadgeClass(status?: string): string {
    const currentStatus = status || this.selectedStatus;
    const badgeClasses: { [key: string]: string } = {
      'SAVE': 'bg-secondary',
      'SUBMIT': 'bg-info',
      'APPROVED': 'bg-success',
      'ONHOLD': 'bg-warning text-dark',
      'CLOSED': 'bg-dark',
      'CANCELLED': 'bg-danger'
    };
    return badgeClasses[currentStatus] || 'bg-secondary';
  }

  addTerm(): void {
    if (this.newTerm.trim()) {
      const termData = {
        tourId: this.tourId,
        id: '',
        terms: this.newTerm
      };

      this.tourService.addTourTerms(this.tourId, termData).subscribe({
        next: () => {
          this.newTerm = '';
          this.showAddTerm = false;
          this.loadTermsAndNotes();
        }
      });
    }
  }

  addNote(): void {
    if (this.form.valid) {
      const noteData = {
        id: '',
        tourId: this.tourId,
        tourNotes: this.tourNotesData.tourNotes,
        status: this.tourNotesData.status
      };

      this.tourService.addTourNotes(noteData).subscribe({
        next: () => {
          this.tourNotes = '';
          this.showAddNote = false;
          this.loadTermsAndNotes();
        }
      });
    }
  }

  deleteTerm(termId: string): void {
    this.tourService.deleteTourTerm(termId).subscribe({
      next: () => this.loadTermsAndNotes()
    });
  }

  deleteNote(id: string): void {
    this.tourService.deleteTourNote(id).subscribe({
      next: () => this.loadTermsAndNotes()
    });
  }

  goBack(): void {
    this.router.navigate(['/tours']); // Adjust route as needed
  }

}