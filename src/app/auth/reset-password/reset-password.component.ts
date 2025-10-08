import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule,FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  email: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  loading: boolean = false;
  resetSuccess: boolean = false;
  errorMessage: string = '';

  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    // Get email from query parameters if passed from email link
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.email = params['email'];
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  validatePassword(): boolean {
    if (!this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields';
      return false;
    }

    if (this.newPassword.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters long';
      return false;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return false;
    }

    return true;
  }

  onSubmit() {
    this.errorMessage = '';

    if (!this.validatePassword()) {
      return;
    }

    this.loading = true;

    this.authService.resetPassword({ 
      email: this.email, 
      newPassword: this.newPassword 
    }).subscribe({
      next: (response) => {
        console.log('Password reset successful:', response);
        this.loading = false;
        this.resetSuccess = true;
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        console.error('Password reset failed:', error);
        this.loading = false;
        this.errorMessage = error.error?.message || 'Failed to reset password. Please try again.';
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

}
