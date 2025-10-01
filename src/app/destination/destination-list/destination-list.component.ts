import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Destination } from '../model/destination';
import { DestinationService } from '../services/destination.service';
import { DestinationData, DestinationFormComponent } from '../destination-form/destination-form.component';
import { Subject, takeUntil } from 'rxjs';
import { DestinationStore } from '../store/destination.store';

declare var bootstrap: any;

@Component({
  selector: 'app-destination-list',
  imports: [DestinationFormComponent,CommonModule],
  templateUrl: './destination-list.component.html',
  styleUrl: './destination-list.component.css'
})
export class DestinationListComponent implements OnInit, OnDestroy {
  destinations: Destination[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string = '';
  
  selectedDestination: Destination | null = null;
  isEditMode = false;

  private destroy$ = new Subject<void>();
  readonly store = inject(DestinationStore);

  constructor(private destinationService: DestinationService) {}


  ngOnInit() {
    // Subscribe to state changes from service
    this.destinationService.destinations$
      .pipe(takeUntil(this.destroy$))
      .subscribe(destinations => {
        this.destinations = destinations;
      });

    this.destinationService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.isLoading = loading;
      });

    this.destinationService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        this.errorMessage = error;
        if (error) {
          this.showErrorToast(error);
        }
      });

      this.store.loadDestinations();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Handle destination added event
  onDestinationAdded() {
    this.showSuccessToast('Destination added successfully!');
    // No need to manually refresh - state management handles it
  }

  // Handle destination updated event
  onDestinationUpdated() {
    this.showSuccessToast('Destination updated successfully!');
    this.isEditMode = false;
    this.selectedDestination = null;
  }

  // Open modal for editing
  editDestination(destination: Destination) {
    this.selectedDestination = { ...destination }; // Create a copy
    this.isEditMode = true;
    
    // Open the modal
    const modalElement = document.getElementById('addDestinationModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  // Open modal for adding new destination
  openAddModal() {
    this.selectedDestination = null;
    this.isEditMode = false;
    
    const modalElement = document.getElementById('addDestinationModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  // Delete destination with confirmation
  deleteDestination(destinationId: string) {
    const destination = this.destinations.find(d => d.id === destinationId);
    
    if (destination && confirm(`Are you sure you want to delete "${destination.name}"?`)) {
      this.destinationService.deleteDestination(destinationId)
        .subscribe({
          next: () => {
            this.showSuccessToast('Destination deleted successfully!');
          },
          error: (err) => {
            console.error('Error deleting destination:', err);
            this.showErrorToast('Failed to delete destination');
          }
        });
    }
  }

  // Refresh destinations manually (if needed)
  refreshDestinations() {
    this.destinationService.loadDestinations();
  }

  // Handle image load errors
  onImageError(event: any) {
    console.log('Image failed to load:', event.target.src);
    event.target.src = 'https://via.placeholder.com/400x300/e9ecef/6c757d?text=No+Image';
  }

  // Show success toast
  private showSuccessToast(message: string) {
    this.successMessage = message;
    
    const toastElement = document.getElementById('successToast');
    if (toastElement) {
      const toast = new bootstrap.Toast(toastElement);
      toast.show();
    }
  }

  // Show error toast
  private showErrorToast(message: string) {
    this.errorMessage = message;
    
    const toastElement = document.getElementById('errorToast');
    if (toastElement) {
      const toast = new bootstrap.Toast(toastElement);
      toast.show();
    }
  }
}