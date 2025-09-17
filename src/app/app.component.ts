import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AddTourComponent } from './tour/add-tour/add-tour.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavbarComponent,FooterComponent,RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'tour-booking-frontend';
}
