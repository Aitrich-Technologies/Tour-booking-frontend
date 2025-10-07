import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { AddTourComponent, TourData } from '../add-tour/add-tour.component';
import { CommonModule } from '@angular/common';
import { TourServiceService } from '../services/tour-service.service';
import { Tour, TourResponse } from '../model/tour';
import { Router } from '@angular/router';


// interface Tour extends TourData {
//   id: number;
//   createdAt: Date;
// }

declare var bootstrap: any;

@Component({
  selector: 'app-list-tour',
  imports: [CommonModule, AddTourComponent],
  templateUrl: './list-tour.component.html',
  styleUrl: './list-tour.component.css'
})

export class ListTourComponent implements OnInit {


  tours: TourResponse[] = []
  isLoading!: false;
  isEditMode = false;
  selectedTour: TourResponse | null = null;

  private tourService = inject(TourServiceService)
  private router = inject(Router);

  ngOnInit(): void {
    this.getAllTours();
  }


  successMessage: string = '';

  onTourAdded() {
    this.showSuccessToast('Destination added successfully!');
    // No need to manually refresh - state management handles it
  }

  openAddModal() {
    this.selectedTour = null;
    this.isEditMode = false;

    const modalElement = document.getElementById('addTourModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  getAllTours() {
    // this.isLoading = true;
    this.tourService.getTour().subscribe({
      next: (tours) => {
        this.tours = tours;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching tours:', error);
        this.isLoading = false;
      }
    });
  }

  viewTour(tour: TourResponse) {
    this.selectedTour = tour;
    this.isEditMode = false;
    const modalElement = document.getElementById('addTourModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  // Edit tour functionality
  // editTour(tour: Tour) {
  //   console.log('Editing tour:', tour);
  //   // You can implement edit functionality here
  //   // For now, just show a message
  //   alert(`Edit functionality for "${tour.title}" - To be implemented`);
  // }

  // Delete tour
  // deleteTour(tourId: number) {
  //   const tour = this.tours.find(t => t.id === tourId);

  //   if (tour && confirm(`Are you sure you want to delete "${tour.title}"?`)) {
  //     this.tours = this.tours.filter(t => t.id !== tourId);
  //     this.showSuccessToast('Tour deleted successfully!');
  //   }
  // }

  // Helper methods
  // private generateId(): number {
  //   return Math.max(...this.tours.map(tour => tour.id), 0) + 1;
  // }

  getDetails(id: string) {
    console.log("Navigating to details of tour with ID:", id);
    this.router.navigate(['/tour/manage/tour-detail', id]);
  }

  private showSuccessToast(message: string) {
    this.successMessage = message;

    const toastElement = document.getElementById('successToast');
    if (toastElement) {
      const toast = new (window as any).bootstrap.Toast(toastElement);
      toast.show();
    }
  }
}
