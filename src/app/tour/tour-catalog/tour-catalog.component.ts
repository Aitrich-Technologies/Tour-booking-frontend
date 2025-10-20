import { Component, inject, Input, OnInit } from '@angular/core';
import { TourServiceService } from '../services/tour-service.service';
import { AuthService, UserRole } from '../../auth/services/auth.service';
import { Tour, TourResponse } from '../model/tour';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tour-catalog',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './tour-catalog.component.html',
  styleUrl: './tour-catalog.component.css'
})
export class TourCatalogComponent implements OnInit {

    private tourService = inject(TourServiceService);
  authService = inject(AuthService);
  private router = inject(Router);

  UserRole = UserRole;

  // Input properties
  @Input() title: string = 'Available Tours';
  @Input() subtitle: string = 'Discover amazing destinations';
  @Input() showHeader: boolean = true;
  @Input() showViewAll: boolean = false;
  @Input() limit?: number;
  @Input() compact: boolean = false;

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
    console.log('Starting to load tours...');
    
    this.tourService.getTour().subscribe({
      next: (tours) => {
        console.log('API Response - Total tours:', tours.length);
        console.log('Tours data:', tours);
        
        // Filter tours based on availability and customer access
        this.tours = tours.filter(tour => this.canViewTour(tour));
        
        console.log('After filtering - Tours to show:', this.tours.length);
        
        this.filterTours();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('API Error:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        this.isLoading = false;
      }
    });
  }

  /**
   * Check if the current user can view this tour
   * Rules:
   * 1. Tour must be available (future date)
   * 2. If tour has no customerId (null), everyone can see it (public tour)
   * 3. If tour has a customerId, only that specific customer can see it (private tour)
   */
  canViewTour(tour: TourResponse): boolean {
    // First check if tour is available
    if (!this.isTourAvailable(tour)) {
      return false;
    }

    const currentUser = this.authService.currentUser();
    
    // If tour has no customerId, it's a public tour - everyone can see it
    if (!tour.customerId) {
      return true;
    }

    // If user is not logged in, they can't see private tours
    if (!currentUser) {
      return false;
    }

    // If tour has a customerId, only that customer can see it
    // Also allow consultants/admins to see all tours
    const userRole = currentUser.role?.toUpperCase();
    
    if (userRole === UserRole.CONSULTANT || userRole === 'ADMIN') {
      return true; // Consultants and admins can see all tours
    }

    // For customers, check if the tour is assigned to them
    return tour.customerId === currentUser.id;
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
    if (this.limit) {
      this.displayedTours = this.filteredTours.slice(0, this.limit);
    } else {
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

  handleTourClick(tour: TourResponse, event: Event): void {
    this.router.navigate(['/tour', tour.id]);
  }

  getViewButtonText(): string {
    return this.authService.isAuthenticated() 
      ? 'View Details' 
      : 'View & Book';
  }

  // Helper methods
  isTourAvailable(tour: TourResponse): boolean {
    if (tour.arrivalDate) {
      const arrivalDate = new Date(tour.arrivalDate);
      return arrivalDate > new Date();
    }
    return true;
  }

  getTourImage(tour: TourResponse): string {
    return tour.imageUrl ;
  }

  getDestinationName(destinationName: string): string {
    return destinationName || 'Unknown Destination';
  }

  truncateDescription(description: string, maxLength: number = 100): string {
    if (!description) return 'No description available';
    return description.length > maxLength 
      ? description.substring(0, maxLength) + '...'
      : description;
  }

  onImageError(event: any): void {
    // event.target.src = '../assets/images/tour-placeholder.jpg';
  }

  /**
   * Check if a tour is private (assigned to a specific customer)
   */
  isPrivateTour(tour: TourResponse): boolean {
    return !!tour.customerId;
  }
}
