import { Component, inject, ViewChild } from '@angular/core';
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
export class AgencyTourDetailComponent {
 @ViewChild('tourNoteForm') form: any;
  // @ViewChild('editTourForm') editTourForm!: NgForm;

  tourId: string = '';
  tour!: TourResponse;
  terms: Terms[] = [];
  notes: Notes[] = [];
  bookings: TourBooking[] = [];
  loading: boolean = true;
  
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

  changeStatus(data: string): void {
    this.tourService.updateTourStatus(this.tourId).subscribe({
      next: (updatedTour) => {
        this.tour = updatedTour;
        console.log('Tour status updated:', updatedTour);
      }
    });
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