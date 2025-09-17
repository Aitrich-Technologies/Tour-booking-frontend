import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

declare var bootstrap: any;


export interface TourData {
  title: string;
  description: string;
  price: number;
}
@Component({
  selector: 'app-add-tour',
  imports: [RouterModule,CommonModule, FormsModule],
  standalone: true,
  templateUrl: './add-tour.component.html',
  styleUrl: './add-tour.component.css'
})
export class AddTourComponent {
  @ViewChild('tourForm') form: any;
  @Output() tourAdded = new EventEmitter<TourData>();
  
  tourData: TourData = {
    title: '',
    description: '',
    price: 0
  };

  isLoading = false;

  ngAfterViewInit() {
    // Listen for modal events
    const modalElement = document.getElementById('addTourModal');
    if (modalElement) {
      modalElement.addEventListener('hidden.bs.modal', () => {
        this.resetForm();
      });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      this.isLoading = true;
      
      // Simulate API call
      setTimeout(() => {
        console.log('Tour data:', this.tourData);
        this.tourAdded.emit({ ...this.tourData });
        
        this.isLoading = false;
        this.closeModal();
      }, 2000);
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
      price: 0
    };
    
    if (this.form) {
      this.form.resetForm();
    }
  }


}
