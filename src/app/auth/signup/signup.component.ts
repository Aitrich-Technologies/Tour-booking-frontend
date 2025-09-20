import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  signupForm: FormGroup;
  loading = false;
  tourId: string | null = null;
  returnUrl = '/';

  // private authService: AuthService,
  // private bookingService: BookingService,
  // private tourService: TourService,
  constructor(
    private fb: FormBuilder,
  
    private router: Router,
    private route: ActivatedRoute
  ) {

    this.signupForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      gender: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      role: ['Customer', [Validators.required]],
      userName: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      telephoneNo: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    // Get query parameters
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/';
      this.tourId = params['tourId'] || null;
    });
  }

  onSubmit() {
    // if (this.signupForm.valid) {
    //   this.loading = true;
      
    //   try {
    //     // Signup user
    //     const user = this.authService.signup(this.signupForm.value);
        
    //     // Check if there's a pending booking tour
    //     const pendingTourId = this.authService.getPendingBookingTour();
        
    //     if (pendingTourId || this.tourId) {
    //       // Initialize booking flow
    //       const selectedTourId = pendingTourId || this.tourId!;
    //       this.bookingService.initializeBooking(selectedTourId, user.id);
          
    //       // Clear pending tour
    //       this.authService.clearPendingBookingTour();
          
    //       // Navigate to booking form
    //       this.router.navigate(['/booking/add-booking']);
    //     } else {
    //       // Navigate to return URL or home
    //       this.router.navigate([this.returnUrl]);
    //     }
        
    //   } catch (error) {
    //     console.error('Signup failed:', error);
    //   } finally {
    //     this.loading = false;
    //   }
    // }
  }

  goToLogin() {
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: this.returnUrl, tourId: this.tourId }
    });
  }

}
