import { Component, ViewChild } from '@angular/core';
import { AddTourComponent, TourData} from '../add-tour/add-tour.component';
import { CommonModule } from '@angular/common';

interface Tour extends TourData {
  id: number;
  createdAt: Date;
}
@Component({
  selector: 'app-list-tour',
  imports: [CommonModule,AddTourComponent],
  templateUrl: './list-tour.component.html',
  styleUrl: './list-tour.component.css'
})
export class ListTourComponent {
  tours: Tour[] = [
    {
      id: 1,
      title: 'Maldives Paradise',
      description: 'Luxury overwater bungalows with crystal clear waters and pristine beaches. Includes snorkeling, sunset cruise, and spa treatments.',
      price: 1299,
      createdAt: new Date('2024-01-15')
    },
    {
      id: 2,
      title: 'Bali Adventure',
      description: 'Explore ancient temples, rice terraces, and volcanic landscapes. Cultural immersion with local cooking classes.',
      price: 899,
      createdAt: new Date('2024-02-20')
    }
  ];

  successMessage: string = '';

  // Handle tour added event
  onTourAdded(tourData: TourData) {
    const newTour: Tour = {
      id: this.generateId(),
      ...tourData,
      createdAt: new Date()
    };
    
    this.tours.unshift(newTour);
    this.showSuccessToast('Tour added successfully!');
  }

  // Edit tour functionality
  editTour(tour: Tour) {
    console.log('Editing tour:', tour);
    // You can implement edit functionality here
    // For now, just show a message
    alert(`Edit functionality for "${tour.title}" - To be implemented`);
  }

  // Delete tour
  deleteTour(tourId: number) {
    const tour = this.tours.find(t => t.id === tourId);
    
    if (tour && confirm(`Are you sure you want to delete "${tour.title}"?`)) {
      this.tours = this.tours.filter(t => t.id !== tourId);
      this.showSuccessToast('Tour deleted successfully!');
    }
  }

  // Helper methods
  private generateId(): number {
    return Math.max(...this.tours.map(tour => tour.id), 0) + 1;
  }

  private showSuccessToast(message: string) {
    this.successMessage = message;
    
    const toastElement = document.getElementById('successToast');
    if (toastElement) {
      const toast = new (window as any).bootstrap.Toast(toastElement);
      toast.show();
    }
  }
}
