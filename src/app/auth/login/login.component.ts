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
          // Handle successful login, e.g., navigate to dashboard

        },
        error: (error) => {
          console.error('Login failed:', error);
          // Handle login error, e.g., show error message
        }
      });

      setTimeout(() => {
        this.loading = false;
        // Navigate to booking or dashboard
        this.router.navigate(['/']);
      }, 2000);



      // Add your authentication logic here
    }
  }

}
