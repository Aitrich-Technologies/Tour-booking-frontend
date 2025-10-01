import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Destination } from '../model/destination';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DestinationService {

 protected API_URL = environment.API_URL;

  // State management using BehaviorSubject
  private destinationsSubject = new BehaviorSubject<Destination[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Public observables
  public destinations$ = this.destinationsSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadDestinations();
  }

  // Get current state value
  get currentDestinations(): Destination[] {
    return this.destinationsSubject.value;
  }

  // Load all destinations and update state
  loadDestinations(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.http.get<Destination[]>(`${this.API_URL}/Destination`)
      .subscribe({
        next: (destinations) => {
          this.destinationsSubject.next(destinations);
          this.loadingSubject.next(false);
        },
        error: (error) => {
          this.errorSubject.next('Failed to load destinations');
          this.loadingSubject.next(false);
          console.error('Error loading destinations:', error);
        }
      });
  }

  // Add destination - optimistic update
  addDestination(formData: FormData): Observable<Destination> {
    this.loadingSubject.next(true);
    
    return this.http.post<Destination>(`${this.API_URL}/Destination`, formData)
      .pipe(
        tap({
          next: (newDestination) => {
            // Update state immediately after successful add
            const currentDestinations = this.currentDestinations;
            this.destinationsSubject.next([newDestination, ...currentDestinations]);
            this.loadingSubject.next(false);
            this.errorSubject.next(null);
          },
          error: (error) => {
            this.errorSubject.next('Failed to add destination');
            this.loadingSubject.next(false);
            console.error('Error adding destination:', error);
          }
        })
      );
  }

  // Update destination
  updateDestination(id: string, formData: FormData): Observable<Destination> {
    this.loadingSubject.next(true);
    
    return this.http.put<Destination>(`${this.API_URL}/Destination/${id}`, formData)
      .pipe(
        tap({
          next: (updatedDestination) => {
            // Update state with the modified destination
            const currentDestinations = this.currentDestinations;
            const index = currentDestinations.findIndex(d => d.id === id);
            
            if (index !== -1) {
              const updatedList = [...currentDestinations];
              updatedList[index] = updatedDestination;
              this.destinationsSubject.next(updatedList);
            }
            
            this.loadingSubject.next(false);
            this.errorSubject.next(null);
          },
          error: (error) => {
            this.errorSubject.next('Failed to update destination');
            this.loadingSubject.next(false);
            console.error('Error updating destination:', error);
          }
        })
      );
  }

  // Delete destination
  deleteDestination(id: string): Observable<any> {
    this.loadingSubject.next(true);
    
    return this.http.delete(`${this.API_URL}/Destination/${id}`)
      .pipe(
        tap({
          next: () => {
            // Remove from state immediately
            const currentDestinations = this.currentDestinations;
            this.destinationsSubject.next(
              currentDestinations.filter(d => d.id !== id)
            );
            this.loadingSubject.next(false);
            this.errorSubject.next(null);
          },
          error: (error) => {
            this.errorSubject.next('Failed to delete destination');
            this.loadingSubject.next(false);
            console.error('Error deleting destination:', error);
          }
        })
      );
  }

  // Get single destination by ID
  getDestinationById(id: string): Observable<Destination> {
    return this.http.get<Destination>(`${this.API_URL}/Destination/${id}`);
  }

  // Clear error
  clearError(): void {
    this.errorSubject.next(null);
  }
}
