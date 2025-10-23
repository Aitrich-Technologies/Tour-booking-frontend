import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
declare var bootstrap: any; // For Bootstrap modal

@Component({
  selector: 'app-signup',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent implements OnInit, AfterViewInit, OnDestroy{
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private userServie = inject(AuthService);
  
  signupForm!: FormGroup;
  loading = false;
  private modalInstance: any;
  showPassword: boolean = false;

  ngOnInit(): void {
    this.initForm();
  }

  ngAfterViewInit(): void {
    // Initialize and auto-open the modal
    const modalElement = document.getElementById('signupModal');
    if (modalElement) {
      this.modalInstance = new bootstrap.Modal(modalElement, {
        backdrop: 'static', // Prevent closing by clicking outside
        keyboard: true // Allow closing with ESC key
      });
      
      // Auto-open modal when component loads
      this.modalInstance.show();

      // Listen for modal close event to navigate away
      modalElement.addEventListener('hidden.bs.modal', () => {
        // Navigate back to home or previous page when modal closes
        this.router.navigate(['/']);
      });
    }
  }

  initForm(): void {
    this.signupForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      gender: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      userName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephoneNo: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

    togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      this.loading = true;
      
      // Your signup API call here
      console.log('Signup Data:', this.signupForm.value);
      this.userServie.register(this.signupForm.value).subscribe({
        next: (response) => {
          console.log('Signup successful:', response);  
        },
        error: (error) => {
          console.error('Signup error:', error);
          this.loading = false;
        }
      });
      
      // Simulate API call
      setTimeout(() => {
        this.loading = false;
        
        // After successful signup:
        this.closeModal();
        // Navigate to booking or dashboard
        this.router.navigate(['/auth/login']);
      }, 2000);
    }
  }

  goToLogin(): void {
    this.closeModal();
    this.router.navigate(['/auth/login']);
  }

  closeModal(): void {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
  }

  ngOnDestroy(): void {
    // Clean up modal instance
    if (this.modalInstance) {
      this.modalInstance.dispose();
    }
  }

}
