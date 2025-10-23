import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Destination } from '../model/destination';
import { DestinationService } from '../services/destination.service';

declare var bootstrap: any;

export interface DestinationData {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  duration: string;
}

@Component({
  selector: 'app-destination-form',
  imports: [FormsModule, CommonModule],
  templateUrl: './destination-form.component.html',
  styleUrl: './destination-form.component.css'
})
export class DestinationFormComponent implements OnChanges {
 @ViewChild('destinationForm') form: NgForm | undefined;
  
  @Input() destination: Destination | null = null;
  @Input() isEditMode = false;
  
  @Output() destinationAdded = new EventEmitter<void>();
  @Output() destinationUpdated = new EventEmitter<void>();

  name: string = '';
  city: string = '';
  imageUrl: string = '';
  selectedFile: File | null = null;
  isLoading = false;
  
  private modalElement: any;
  private modalHiddenListener: any;

  constructor(private destinationService: DestinationService) {}

  ngAfterViewInit() {
    // Set up modal hidden event listener to reset form
    this.modalElement = document.getElementById('addDestinationModal');
    if (this.modalElement) {
      this.modalHiddenListener = () => {
        this.resetForm();
      };
      this.modalElement.addEventListener('hidden.bs.modal', this.modalHiddenListener);
    }
  }

  ngOnDestroy() {
    // Clean up event listener
    if (this.modalElement && this.modalHiddenListener) {
      this.modalElement.removeEventListener('hidden.bs.modal', this.modalHiddenListener);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // When destination input changes (for edit mode)
    if (changes['destination']) {
      if (this.destination) {
        this.name = this.destination.name;
        this.city = this.destination.city;
        this.imageUrl = this.destination.imageUrl;
        this.selectedFile = null; // Reset file selection
      } else {
        // If destination is null (add mode), reset the form
        this.resetForm();
      }
    }
    
    // Reset form when switching from edit to add mode
    if (changes['isEditMode'] && !this.isEditMode && changes['isEditMode'].previousValue === true) {
      this.resetForm();
    }
  }

  get modalTitle(): string {
    return this.isEditMode ? 'Edit Destination' : 'Add Destination';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'Update Destination' : 'Add Destination';
  }

  onSubmit(form: NgForm) {
    // For edit mode, file is optional
    // For add mode, file is required
    const isValid = this.isEditMode 
      ? form.valid 
      : form.valid && this.selectedFile;

    if (isValid) {
      this.isLoading = true;

      const formData = new FormData();
      
      // Only append file if a new one is selected
      if (this.selectedFile) {
        formData.append('ImageFile', this.selectedFile, this.selectedFile.name);
      }
      
      formData.append('name', this.name);
      formData.append('city', this.city);

      if (this.isEditMode && this.destination?.id) {
        // Update existing destination
        this.updateDestination(this.destination.id, formData);
      } else {
        // Add new destination
        this.addDestination(formData);
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });

      if (!this.selectedFile && !this.isEditMode) {
        alert('Please select an image file');
      }
    }
  }

  private addDestination(formData: FormData) {
    this.destinationService.addDestination(formData).subscribe({
      next: (response) => {
        console.log('Destination added successfully:', response);
        this.isLoading = false;
        this.destinationAdded.emit();
        this.closeModal();
      },
      error: (error) => {
        console.error('Error adding destination:', error);
        this.isLoading = false;
        alert('Failed to add destination. Please try again.');
      }
    });
  }

  private updateDestination(id: string, formData: FormData) {
    this.destinationService.updateDestination(id, formData).subscribe({
      next: (response) => {
        console.log('Destination updated successfully:', response);
        this.isLoading = false;
        this.destinationUpdated.emit();
        this.closeModal();
      },
      error: (error) => {
        console.error('Error updating destination:', error);
        this.isLoading = false;
        alert('Failed to update destination. Please try again.');
      }
    });
  }

  // Handle file input for image upload
  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      // Validate file size (e.g., max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('File size must be less than 5MB');
        return;
      }

      this.selectedFile = file;
      console.log('File selected:', file.name, file.type);

      // Create a preview URL for the image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onImageError(event: any) {
    console.log('Image failed to load:', event.target.src);
    event.target.src = 'https://via.placeholder.com/400x300/e9ecef/6c757d?text=No+Image';
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

  resetForm() {
    this.name = '';
    this.city = '';
    this.imageUrl = '';
    this.selectedFile = null;
    
    // Reset file input
    const fileInput = document.getElementById('imageUrl') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }

    // Reset form validation state
    if (this.form) {
      this.form.resetForm();
    }
  }
}
