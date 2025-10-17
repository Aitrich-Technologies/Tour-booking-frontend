import { Component, inject } from '@angular/core';
import { TourServiceService } from '../services/tour-service.service';
import { TourResponse } from '../model/tour';
import { ActivatedRoute, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Notes } from '../model/notes';
import { Terms } from '../model/terms';

@Component({
  selector: 'app-tour-detail',
  imports: [CommonModule,RouterModule],
  templateUrl: './tour-detail.component.html',
  styleUrl: './tour-detail.component.css'
})
export class TourDetailComponent {
  tour: TourResponse | null = null;
  notes: Notes[] = [];
  terms: Terms [] = [];
  tourId: string = '';
  isLoading: boolean = true;
  errorMessage: string = '';

  private tourService = inject(TourServiceService);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    // Get tourId from route parameters
    this.route.paramMap.subscribe(params => {
      this.tourId = params.get('id') || '';
      
      if (this.tourId) {
        this.fetchTourDetails();
        this.getTourTermsByTourId(this.tourId);
        this.getTourNotesByTourId(this.tourId);
      } else {
        this.errorMessage = 'No tour ID provided';
        this.isLoading = false;
      }
    });
  }

  fetchTourDetails(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.tourService.getTourById(this.tourId).subscribe({
      next: (tour: TourResponse) => {
        this.tour = tour;
        console.log('Tour details:', tour);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching tour details:', error);
        this.errorMessage = 'Failed to load tour details. Please try again.';
        this.isLoading = false;
      }
    });
  }

  getDestinationName(destinationName: string | undefined): string {
    return destinationName || 'Unknown Destination';
  }

  getTourTermsByTourId(tourId:string) {
    this.tourService.getTourTerms(tourId).subscribe({
      next: (terms: Terms[]) => {
        this.terms = terms

        console.log('Tour terms:', terms);
      },
      error: (error) => {
        console.error('Error fetching tour terms:', error);
      }
    });
  }

  getTourNotesByTourId(tourId: string) {
    this.tourService.getTourNotes(tourId).subscribe({
      next: (notes: Notes[]) => {
        this.notes = notes
        console.log('Tour notes:', notes);
      },
      error: (error) => {
        console.error('Error fetching tour notes:', error);
      }
    });
    
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/tour-placeholder.jpg'; // Fallback image
    // Or use a placeholder service:
    // img.src = 'https://via.placeholder.com/800x600?text=Tour+Image';
  }

}
