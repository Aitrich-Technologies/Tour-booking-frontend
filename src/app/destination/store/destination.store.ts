import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { computed } from '@angular/core';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';
import { Destination } from '../model/destination';
import { environment } from '../../../environments/environment.development';

interface DestinationState {
  destinations: Destination[];
  selectedDestination: Destination | null;
  isLoading: boolean;
  error: string | null;
  filter: string;
}

// Initial state
const initialState: DestinationState = {
  destinations: [],
  selectedDestination: null,
  isLoading: false,
  error: null,
  filter: ''
};

export const DestinationStore = signalStore(
  { providedIn: 'root' },
  
  // State
  withState(initialState),
  
  // Computed values (like getters)
  withComputed((store) => ({
    // Filter destinations based on search
    filteredDestinations: computed(() => {
      const filter = store.filter().toLowerCase();
      if (!filter) return store.destinations();
      
      return store.destinations().filter(d => 
        d.name.toLowerCase().includes(filter) ||
        d.city.toLowerCase().includes(filter)
      );
    }),
    
    // Count of destinations
    destinationCount: computed(() => store.destinations().length),
    
    // Check if has destinations
    hasDestinations: computed(() => store.destinations().length > 0)
  })),
  
  // Methods (actions)
  withMethods((store, http = inject(HttpClient)) => ({
    
    // Load all destinations
    loadDestinations: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() =>
          http.get<Destination[]>(`${environment.API_URL}/Destination`).pipe(
            tap(destinations => 
              patchState(store, { 
                destinations, 
                isLoading: false,
                error: null 
              })
            ),
            catchError(error => {
              patchState(store, { 
                isLoading: false, 
                error: 'Failed to load destinations' 
              });
              console.error('Load error:', error);
              return of([]);
            })
          )
        )
      )
    ),
    
    // Add destination
    addDestination: rxMethod<FormData>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(formData =>
          http.post<Destination>(`${environment.API_URL}/Destination`, formData).pipe(
            tap(newDestination => {
              // Optimistically update state
              patchState(store, state => ({ 
                destinations: [newDestination, ...state.destinations],
                isLoading: false,
                error: null
              }));
            }),
            catchError(error => {
              patchState(store, { 
                isLoading: false, 
                error: 'Failed to add destination' 
              });
              console.error('Add error:', error);
              return of(null);
            })
          )
        )
      )
    ),
    
    // Update destination
    updateDestination: rxMethod<{ id: string; formData: FormData }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ id, formData }) =>
          http.put<Destination>(`${environment.API_URL}/Destination/${id}`, formData).pipe(
            tap(updatedDestination => {
              patchState(store, state => ({
                destinations: state.destinations.map(d =>
                  d.id === id ? updatedDestination : d
                ),
                isLoading: false,
                error: null,
                selectedDestination: null
              }));
            }),
            catchError(error => {
              patchState(store, { 
                isLoading: false, 
                error: 'Failed to update destination' 
              });
              console.error('Update error:', error);
              return of(null);
            })
          )
        )
      )
    ),
    
    // Delete destination
    deleteDestination: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(id =>
          http.delete(`${environment.API_URL}/Destination/${id}`).pipe(
            tap(() => {
              patchState(store, state => ({
                destinations: state.destinations.filter(d => d.id !== id),
                isLoading: false,
                error: null
              }));
            }),
            catchError(error => {
              patchState(store, { 
                isLoading: false, 
                error: 'Failed to delete destination' 
              });
              console.error('Delete error:', error);
              return of(null);
            })
          )
        )
      )
    ),
    
    // Select destination for editing
    selectDestination(destination: Destination | null) {
      patchState(store, { selectedDestination: destination });
    },
    
    // Update filter
    setFilter(filter: string) {
      patchState(store, { filter });
    },
    
    // Clear error
    clearError() {
      patchState(store, { error: null });
    }
  }))
);