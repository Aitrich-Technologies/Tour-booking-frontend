import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

username: string = '';
  password: string = '';
  rememberMe: boolean = false;
  showPassword: boolean = false;
  loading: boolean = false;

  // Forgot Password Properties
  showForgotPasswordModal: boolean = false;
  forgotPasswordEmail: string = '';
  forgotPasswordLoading: boolean = false;
  forgotPasswordSuccess: boolean = false;
  forgotPasswordError: string = '';

  private authService = inject(AuthService);
  private router = inject(Router);

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.username && this.password) {
      this.loading = true;

      console.log('Login attempt:', {
        username: this.username,
        password: this.password,
        rememberMe: this.rememberMe
      });
      
      this.authService.login({ userName: this.username, password: this.password }).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          this.loading = false;
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Login failed:', error);
          this.loading = false;
          // Handle login error, e.g., show error message
        }
      });
    }
  }

  // Open Forgot Password Modal
  openForgotPasswordModal() {
    this.showForgotPasswordModal = true;
    this.forgotPasswordEmail = '';
    this.forgotPasswordSuccess = false;
    this.forgotPasswordError = '';
  }

  // Close Forgot Password Modal
  closeForgotPasswordModal() {
    this.showForgotPasswordModal = false;
    this.forgotPasswordEmail = '';
    this.forgotPasswordSuccess = false;
    this.forgotPasswordError = '';
  }

  // Submit Forgot Password Request
  onForgotPasswordSubmit() {
    if (!this.forgotPasswordEmail) {
      this.forgotPasswordError = 'Please enter your email address';
      return;
    }

    this.forgotPasswordLoading = true;
    this.forgotPasswordError = '';

    this.authService.forgetPassword(this.forgotPasswordEmail).subscribe({
      next: (response) => {
        console.log('Forgot password request successful:', response);
        this.forgotPasswordLoading = false;
        this.forgotPasswordSuccess = true;
      },
      error: (error) => {
        console.error('Forgot password request failed:', error);
        this.forgotPasswordLoading = false;
        this.forgotPasswordError = error.error?.message || 'Failed to send reset instructions. Please try again.';
      }
    });
  }
}
