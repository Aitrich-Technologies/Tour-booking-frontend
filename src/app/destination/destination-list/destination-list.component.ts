import { Component } from '@angular/core';
import { AddDestinationComponent, DestinationData } from '../add-destination/add-destination.component';
import { CommonModule } from '@angular/common';

interface Destination extends DestinationData {
  id: number;
  createdAt: Date;
}

@Component({
  selector: 'app-destination-list',
  imports: [AddDestinationComponent,CommonModule],
  templateUrl: './destination-list.component.html',
  styleUrl: './destination-list.component.css'
})
export class DestinationListComponent {

  destinations: Destination[] = [
    {
      id: 1,
      name: 'Maldives Paradise',
      description: 'Luxury overwater bungalows with crystal clear waters and pristine beaches. Includes snorkeling, sunset cruise, and spa treatments for the ultimate tropical getaway.',
      price: 1299,
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      duration: '5 days 4 nights',
      createdAt: new Date('2024-01-15')
    },
    {
      id: 2,
      name: 'Bali Adventure',
      description: 'Explore ancient temples, rice terraces, and volcanic landscapes. Cultural immersion with local cooking classes and traditional ceremonies.',
      price: 899,
      imageUrl: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      duration: '7 days 6 nights',
      createdAt: new Date('2024-02-20')
    },
    {
      id: 3,
      name: 'Dubai Luxury',
      description: 'Experience the opulence of Dubai with luxury shopping, desert safaris, and world-class dining. Stay in 5-star hotels with stunning city views.',
      price: 1599,
      imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      duration: '4 days 3 nights',
      createdAt: new Date('2024-03-10')
    }
  ];

  successMessage: string = '';

  // Handle destination added event
  onDestinationAdded(destinationData: DestinationData) {
    const newDestination: Destination = {
      id: this.generateId(),
      ...destinationData,
      createdAt: new Date()
    };
    
    this.destinations.unshift(newDestination);
    this.showSuccessToast('Destination added successfully!');
  }

  // Edit destination functionality
  editDestination(destination: Destination) {
    console.log('Editing destination:', destination);
    // You can implement edit functionality here
    // For now, just show a message
    alert(`Edit functionality for "\${destination.name}" - To be implemented`);
  }

  // Delete destination
  deleteDestination(destinationId: number) {
    const destination = this.destinations.find(d => d.id === destinationId);
  }
    
    // if (destination && confirm(`Are you sure you want to delete "\${destination.name}"?\`)) {
    //   this.destinations = this.destinations.filter(d => d.id !== destinationId);
    //   this.showSuccessToast('Destination deleted successfully!'`))
    // }
  

  // Handle image load errors
  onImageError(event: any) {
    console.log('Image failed to load, using fallback');
    event.target.src = 'https://via.placeholder.com/400x300/e9ecef/6c757d?text=Image+Not+Found';
  }

  // Helper methods
  private generateId(): number {
    return Math.max(...this.destinations.map(dest => dest.id), 0) + 1;
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
