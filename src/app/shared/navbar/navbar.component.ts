import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';


@Component({
  selector: 'app-navbar',
  imports: [RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  private router = inject(Router);
  
  openSignupModal(): void {
    // Navigate to signup route which will trigger the modal
    this.router.navigate(['/auth/signup']);
  }

  openLoginModal(): void {
    // Navigate to login route (if you have a login modal too)
    this.router.navigate(['/auth/login']);
  }

}
