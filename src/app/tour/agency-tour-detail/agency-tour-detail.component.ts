import { Component, inject, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TourServiceService } from '../services/tour-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { BookingService } from '../../booking/services/booking.service';
import { Notes } from '../model/notes';
import { Terms } from '../model/terms';
import { TourBooking } from '../../booking/model/tourBooking';

@Component({
  selector: 'app-agency-tour-detail',
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './agency-tour-detail.component.html',
  styleUrl: './agency-tour-detail.component.css'
})
export class AgencyTourDetailComponent {
goBack: any;


  @ViewChild('tourNoteForm') form: any;
getDestinationName(arg0: any) {
throw new Error('Method not implemented.');
}
onImageError($event: ErrorEvent) {
throw new Error('Method not implemented.');
}

   tourId: string = '';
  tour: any;
  terms: Terms[] = [];
  notes: Notes[] = [];
  bookings: TourBooking[] = [];
  loading: boolean = true;
  tourNoteForm!: NgForm;
  
  // For adding new terms/notes
  newTerm: string = '';
  tourNotes: string = '';
  showAddTerm: boolean = false;
  showAddNote: boolean = false;

  tourNotesData: Notes = {
    id: '',
    tourId: '',
    tourNotes: '',
    status: '',
  }




    private route = inject( ActivatedRoute);
    private router = inject( Router);
    private tourService = inject( TourServiceService);
    private bookingService = inject(BookingService);



  ngOnInit(): void {
    this.tourId = this.route.snapshot.paramMap.get('id') || '';
    this.loadTourData();
    console.log("Loaded tour ID:", this.tourId);
    console.log("This is detail component ");
    console.log("this is test");
    
  }

  loadTourData(): void {
    this.loading = true;
    
    this.tourService.getTourById(this.tourId).subscribe({
      next: (data) => {
        this.tour = data;
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
      console.log('Adding term:', termData);

      this.tourService.addTourTerms(this.tourId,termData).subscribe({
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
      console.log('Adding note:', noteData);
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
    this.tourService.deleteTourTerm( termId).subscribe({
      next: () => this.loadTermsAndNotes()
    });
  }

  deleteNote(id: string): void {
    this.tourService.deleteTourNote(id).subscribe({
      next: () => this.loadTermsAndNotes()
    });
  }

  editTour(): void {
    this.router.navigate(['/add-tour/', this.tourId, 'edit']);
  }

}
