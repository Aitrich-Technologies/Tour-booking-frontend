import { Component, inject, Input, OnInit } from '@angular/core';
import { TourServiceService } from '../services/tour-service.service';
import { AuthService } from '../../auth/services/auth.service';
import { Tour, TourResponse } from '../model/tour';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tour-catalog',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './tour-catalog.component.html',
  styleUrl: './tour-catalog.component.css'
})
export class TourCatalogComponent implements OnInit {

  private tourService = inject(TourServiceService);
  private authService = inject(AuthService);

  // Input properties
  @Input() title: string = 'Available Tours';
  @Input() subtitle: string = 'Discover amazing destinations';
  @Input() showHeader: boolean = true;
  @Input() showViewAll: boolean = false;
  @Input() limit?: number;
  @Input() compact: boolean = false; // For 4 columns layout


  // Data
  tours: TourResponse[] = [];
  filteredTours: TourResponse[] = [];
  displayedTours: TourResponse[] = [];
  
  // State
  isLoading: boolean = true;
  searchTerm: string = '';
  sortBy: string = 'popular';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 12;
  totalPages: number = 1;

  ngOnInit(): void {
      console.log('Is authenticated?', this.authService.isAuthenticated());
  console.log('Current user:', this.authService.currentUser());
  this.loadTours();
  }

  loadTours(): void {
    this.isLoading = true;
    this.tourService.getTour().subscribe({
      next: (tours) => {
        // Only show active/available tours for public/customer
        this.tours = tours.filter(tour => this.isTourAvailable(tour));
        this.filterTours();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tours:', error);
        this.isLoading = false;
      }
    });
  }

  filterTours(): void {
    let filtered = [...this.tours];

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(tour => 
        tour.tourName.toLowerCase().includes(term) ||
        tour.tourDescription?.toLowerCase().includes(term)
      );
    }

    this.filteredTours = filtered;
    this.sortTours();
    this.updateDisplayedTours();
  }

  sortTours(): void {
    switch(this.sortBy) {
      case 'popular':
        // Sort by some popularity metric (you can adjust this)
        this.filteredTours.sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
        break;
      case 'price-low':
        this.filteredTours.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        this.filteredTours.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'newest':
        this.filteredTours.sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
        break;
    }
    this.updateDisplayedTours();
  }

  updateDisplayedTours(): void {
    // Apply limit if specified (for home page)
    if (this.limit) {
      this.displayedTours = this.filteredTours.slice(0, this.limit);
    } else {
      // Apply pagination
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      this.displayedTours = this.filteredTours.slice(startIndex, endIndex);
      this.totalPages = Math.ceil(this.filteredTours.length / this.itemsPerPage);
    }
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.sortBy = 'popular';
    this.filterTours();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedTours();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Helper methods
  isTourAvailable(tour: TourResponse): boolean {
    // Add your logic to determine if tour is available
    // For example: check if status is active, not past date, etc.
    if (tour.arrivalDate) {
      const arrivalDate = new Date(tour.arrivalDate);
      return arrivalDate > new Date();
    }
    return true;
  }

  getTourImage(tour: TourResponse): string {
    // Return tour image or default placeholder
    return tour.imageUrl || '../assets/images/tour-placeholder.jpg';
  }

  getDestinationName(destinationId: string): string {

    return `Destination:  ${destinationId}`;
  }

  truncateDescription(description: string, maxLength: number = 100): string {
    if (!description) return 'No description available';
    return description.length > maxLength 
      ? description.substring(0, maxLength) + '...'
      : description;
  }

  onImageError(event: any): void {
    event.target.src = '../assets/images/tour-placeholder.jpg';
  }

}
