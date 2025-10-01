import { Component } from '@angular/core';
import { ListTourComponent } from '../../tour/list-tour/list-tour.component';

@Component({
  selector: 'app-home',
  imports: [ListTourComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
