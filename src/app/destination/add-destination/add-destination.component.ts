import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

declare var bootstrap: any;

export interface DestinationData {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  duration: string;
}
@Component({
  selector: 'app-add-destination',
  imports: [FormsModule,CommonModule],
  templateUrl: './add-destination.component.html',
  styleUrl: './add-destination.component.css'
})
export class AddDestinationComponent {
  @ViewChild('destinationForm') form: any;
  @Output() destinationAdded = new EventEmitter<DestinationData>();
  
  destinationData: DestinationData = {
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    duration: ''
  };

  isLoading = false;

  ngAfterViewInit() {
    // Listen for modal events
    const modalElement = document.getElementById('addDestinationModal');
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
        console.log('Destination data:', this.destinationData);
        this.destinationAdded.emit({ ...this.destinationData });
        
        this.isLoading = false;
        this.closeModal();
      }, 2000);
    }
  }

  onImageError(event: any) {
    console.log('Image failed to load:', event.target.src);
    event.target.style.display = 'none';
  }

  private closeModal() {
    const modalElement = document.getElementById('addDestinationModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

  private resetForm() {
    this.destinationData = {
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      duration: ''
    };
    
    if (this.form) {
      this.form.resetForm();
    }
  }

}
