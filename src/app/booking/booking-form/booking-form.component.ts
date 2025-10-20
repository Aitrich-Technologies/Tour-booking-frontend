import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TourBooking } from '../model/tourBooking';
import { TourResponse } from '../../tour/model/tour';
import { BookingService } from '../services/booking.service';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-booking-form',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './booking-form.component.html',
  styleUrl: './booking-form.component.css'
})
export class BookingFormComponent {
  bookingForm!: FormGroup;
  loading = false;
  tourId: string = '';
  userId: string = '';
  selectedTour: TourResponse | null = null;
  loadingTour = false; // No need to load, we get it from state
  private routeSubscription?: Subscription;
  cities: string[] = ['USA', 'Canada', 'UK', 'Australia', 'India', 'Germany', 'France', 'Italy'];
  countries: string[] = ['USA', 'Canada', 'UK', 'Australia', 'India', 'Germany', 'France', 'Italy'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private authService: AuthService
  ) {
    // Get tour data from router state (passed from tour-detail component)
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.selectedTour = navigation.extras.state['tour'];
      console.log('Tour received from state:', this.selectedTour);
      
      // Set tourId from the tour object if available
      if (this.selectedTour && this.selectedTour.id) {
        this.tourId = this.selectedTour.id;
        console.log('Tour ID set from state:', this.tourId);
      }
    }
  }

  ngOnInit(): void {
    // Get userId first
    this.userId = this.authService.currentUser()?.id || ''; // Ensure user is logged in
    
    // Get tourId from route parameter
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const urlTourId = params.get('id') || '';
      console.log('Tour ID from URL:', urlTourId);
      
      // Use tourId from URL if we don't have it from state
      if (!this.tourId && urlTourId) {
        this.tourId = urlTourId;
        console.log('Using Tour ID from URL:', this.tourId);
      }
      
      if (this.tourId) {
        if (!this.selectedTour) {
          console.warn('No tour data received from state. Tour info will not be displayed.');
          // Optionally: fetch tour data from API here if needed
          // this.fetchTourDetails();
        } else {
          console.log('Using tour data from state:', this.selectedTour);
        }
        
        this.initializeForm();
      } else {
        console.error('No tour ID available');
        alert('Invalid tour ID');
        this.router.navigate(['/tours']);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  // Fetch userid from auth service
  getCurrentUserId(): string {
    const user = this.authService.currentUser();
    return user && user.id ? user.id : '';
  }

  initializeForm(): void {
    this.bookingForm = this.fb.group({
      tourId: [this.tourId, Validators.required], 
      userId:[this.userId], 
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      gender: ['', Validators.required],
      dob: ['', Validators.required],
      citizenship: ['', Validators.required],
      passportNumber: [''],
      issueDate: [''],
      expiryDate: [''],
      placeOfBirth: ['', Validators.required],
      leadPassenger: [true],
      participantType: ['Adult'],
      status: ['Pending']
    });
    console.log('Form initialized with tourId:', this.tourId);
  }

  

  onSubmit(): void {
    if (this.bookingForm.valid) {
      this.loading = true;
      const bookingData: TourBooking = this.bookingForm.value;
      
      console.log('Booking Data (only tourId sent to backend):', JSON.stringify(bookingData, null, 2));
      
      // Call your booking service here
      this.bookingService.bookTour(bookingData).subscribe({
        next: (response) => {
          console.log('Booking successful', response);
          alert('Booking submitted successfully!');
          this.loading = false;
          // this.router.navigate(['/bookings/confirmation', response.id]);
        },
        error: (error) => {
          console.error('Booking failed', error);
          alert('Booking failed. Please try again.');
          this.loading = false;
        }
      });

      // Simulate API call
      setTimeout(() => {
        this.router.navigate(['/bookings']);

        this.loading = false;
      }, 2000);
    } else {
      Object.keys(this.bookingForm.controls).forEach(key => {
        this.bookingForm.get(key)?.markAsTouched();
      });
      alert('Please fill in all required fields');
    }
  }

  goBack(): void {
    if (this.tourId) {
      this.router.navigate(['/tours', this.tourId]);
    } else {
      window.history.back();
    }
  }
}
