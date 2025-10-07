import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, inject, Inject, Output, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Destination } from '../../destination/model/destination';
import { DestinationService } from '../../destination/services/destination.service';
import { Subject, takeUntil } from 'rxjs';
import { DestinationStore } from '../../destination/store/destination.store';
import { TourServiceService } from '../services/tour-service.service';
import { User } from '../../auth/model/user';
import { Tour } from '../model/tour';

declare var bootstrap: any;


export interface TourData {
  title: string;
  description: string;
  price: number;
  destinationId: string;
  noOfNights: number;
  departureDate?: string;
  arrivalDate?: string;
  customerId?: string;
  consultantId?: string;
  status?: string;
}
@Component({
  selector: 'app-add-tour',
  imports: [RouterModule, CommonModule, FormsModule],
  standalone: true,
  templateUrl: './add-tour.component.html',
  styleUrl: './add-tour.component.css'
})
export class AddTourComponent {
  @ViewChild('tourForm') form: any;
  @Output() tourAdded = new EventEmitter<void>();
  
  customers: User[] = [];
  consultants: User[] = [];
  
  // Tour status options with display names
statusOptions = [
  { value: 'Save', label: 'Save', icon: 'save', color: 'secondary' },
  { value: 'Submit', label: 'Submit', icon: 'send', color: 'primary' },
  { value: 'Approved', label: 'Approved', icon: 'check-circle', color: 'success' },
  { value: 'On Hold', label: 'On Hold', icon: 'pause-circle', color: 'warning' },
  { value: 'Closed', label: 'Closed', icon: 'x-circle', color: 'dark' },
  { value: 'Cancelled', label: 'Cancelled', icon: 'x-octagon', color: 'danger' }
];

  // TourStatus = TourStatus; // Expose enum to template
  
  isLoading = false;
  destinations: Destination[] = [];
  minDepartureDate: string = '';
  errorMessage: string | null = null;
  isCustomizedTour = false;

  private destinationService = inject(DestinationService);
  private tourService = inject(TourServiceService);
  private destroy$ = new Subject<void>();
  readonly store = inject(DestinationStore);

  tourData: TourData = {
    title: '',
    description: '',
    price: 0,
    destinationId: '',
    noOfNights: 0,
    departureDate: '',
    arrivalDate: '',
    customerId: '',
    consultantId: '',
    status: ''
  };

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
    this.getAllCustomers();
    this.getAllConsultants();

    // Set minimum departure date to today
    const today = new Date();
    this.minDepartureDate = today.toISOString().split('T')[0];
  }

  ngAfterViewInit() {
    // Listen for modal events
    const modalElement = document.getElementById('addTourModal');
    if (modalElement) {
      modalElement.addEventListener('hidden.bs.modal', () => {
        this.resetForm();
      });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getAllCustomers() {
    this.tourService.getAllCustomers().subscribe({
      next: (customers) => {  
        this.customers = customers;
        console.log('Customers loaded:', this.customers);
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.showErrorToast('Failed to load customers');
      }
    });
  }

  getAllConsultants() {
    this.tourService.getAllConsultants().subscribe({
      next: (consultants) => {
        this.consultants = consultants;
        console.log('Consultants loaded:', this.consultants);
      },
      error: (error) => {
        console.error('Error loading consultants:', error);
        this.showErrorToast('Failed to load consultants');
      }
    });
  }

  calculateArrivalDate() {
    if (this.tourData.departureDate && this.tourData.noOfNights) {
      const departureDate = new Date(this.tourData.departureDate);
      departureDate.setDate(departureDate.getDate() + this.tourData.noOfNights);
      this.tourData.arrivalDate = departureDate.toISOString().split('T')[0];
    } else {
      this.tourData.arrivalDate = '';
    }
  }

  onSubmit() {
    if (this.form.valid) {
      // If not customized tour, remove customerId
      if (!this.isCustomizedTour) {
        this.tourData.customerId = undefined;
      }

      this.isLoading = true;
      this.errorMessage = null;

      // Prepare tour data according to Tour interface
      const tourPayload: Tour = {
        id: '', 
        tourName: this.tourData.title,
        tourDescription: this.tourData.description,
        destinationId: this.tourData.destinationId,
        noOfNights: this.tourData.noOfNights,
        departureDate: this.tourData.departureDate!,
        arrivalDate: this.tourData.arrivalDate!,
        customerId: this.tourData.customerId,
        consultantId: this.tourData.consultantId!,
        status: this.tourData.status!,
        price: this.tourData.price
      };

      console.log('Submitting tour:', tourPayload);

      this.tourService.addTour(tourPayload).subscribe({
        next: (response) => {
          console.log('Tour created successfully:', response);
          this.showSuccessToast('Tour created successfully!');
          this.tourAdded.emit();
          this.isLoading = false;
          this.closeModal();
        },
        error: (error) => {
          console.error('Error creating tour:', error);
          this.errorMessage = error.error?.message || 'Failed to create tour. Please try again.';
          // this.showErrorToast(this.errorMessage);
          this.isLoading = false;
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.form.controls).forEach(key => {
        this.form.controls[key].markAsTouched();
      });
      this.showErrorToast('Please fill in all required fields correctly');
    }
  }

  private closeModal() {
    const modalElement = document.getElementById('addTourModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

  private resetForm() {
    this.tourData = {
      title: '',
      description: '',
      price: 0,
      destinationId: '',
      noOfNights: 0,
      departureDate: '',
      arrivalDate: '',
      customerId: '',
      consultantId: '',
      status: ''
    };

    this.isCustomizedTour = false;
    this.errorMessage = null;

    if (this.form) {
      this.form.resetForm(this.tourData);
    }
  }

  private showErrorToast(message: string) {
    this.errorMessage = message;

    const toastElement = document.getElementById('errorToast');
    if (toastElement) {
      const toast = new bootstrap.Toast(toastElement);
      toast.show();
    }
  }

  private showSuccessToast(message: string) {
    // Create a success toast dynamically or use existing one
    const toastElement = document.getElementById('successToast');
    if (toastElement) {
      const toast = new bootstrap.Toast(toastElement);
      toast.show();
    }
  }

  // Helper method to get status label
  // getStatusLabel(status: TourStatus): string {
  //   return this.statusOptions.find(s => s.value === status)?.label || '';
  // }

  // // Helper method to get status color
  // getStatusColor(status: TourStatus): string {
  //   return this.statusOptions.find(s => s.value === status)?.color || 'secondary';
  // }


}
