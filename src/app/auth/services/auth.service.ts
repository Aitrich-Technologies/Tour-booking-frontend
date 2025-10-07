import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, Observable, of, shareReplay, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { User } from '../model/user';

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  AGENCY = 'AGENCY',
  CONSULTANT = 'CONSULTANT',
 // If you have admin
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  userName: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API_BASE = environment.API_URL;
  private TOKEN_KEY = 'auth_token';
  private USER_KEY = 'current_user';

  // Signals for reactive state management
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  // BehaviorSubject for components that need Observable
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuth();
  }

  /**
   * Initialize authentication state on app startup
   */
  private initializeAuth() {
    const token = this.getToken();
    const cachedUser = this.getCachedUser();

    if (token) {
      this.isAuthenticated.set(true);
      
      if (cachedUser) {
        this.setUser(cachedUser);
      }
      
      // Verify token and refresh user data
      this.getCurrentUser().subscribe({
        error: () => {
          // Token is invalid, clear auth
          this.clearAuth();
        }
      });
    }
  }

  /**
   * Login user
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.isLoading.set(true);
    
    return this.http.post<LoginResponse>(`${this.API_BASE}/User/Login`, credentials).pipe(
      tap(response => {
        this.saveToken(response.token);
        this.setUser(response.user);
        this.isAuthenticated.set(true);
        this.isLoading.set(false);
      }),
      catchError(error => {
        this.isLoading.set(false);
        return this.handleError(error);
      })
    );
  }

  /**
   * Register new user
   */
  register(userData: User): Observable<any> {
    this.isLoading.set(true);
    
    return this.http.post(`${this.API_BASE}/User/Registration`, userData).pipe(
      tap(() => {
        this.isLoading.set(false);
      }),
      catchError(error => {
        this.isLoading.set(false);
        return this.handleError(error);
      })
    );
  }

  /**
   * Get current logged-in user from backend
   */
  getCurrentUser(): Observable<User> {
    // Return cached user if available and not forcing refresh
    const cachedUser = this.currentUser();
    if (cachedUser) {
      return of(cachedUser);
    }
 

    return this.http.get<User>(`${this.API_BASE}/User/LoggedUser`).pipe(
      tap(user => {
        this.setUser(user);
      }),
      catchError(error => {
        console.error('Failed to fetch current user:', error);
        this.clearAuth();
        return throwError(() => error);
      }),
      shareReplay(1) // Cache the result for multiple subscribers
    );
  }

  /**
   * Force refresh current user data from backend
   */
  refreshCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.API_BASE}/User/LoggedUser`).pipe(
      tap(user => {
        this.setUser(user);
      }),
      catchError(error => {
        console.error('Failed to refresh current user:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Logout user
   */
  logout(): void {
    // Optional: Call backend logout endpoint if available
    // this.http.post(`${this.API_BASE}/Auth/Logout`, {}).subscribe();
    
    this.clearAuth();
    this.router.navigate(['/login']);
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.currentUser();
    return user?.role?.toLowerCase() === role.toLowerCase();
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUser();
    if (!user?.role) return false;
    
    return roles.some(role => 
      user.role.toLowerCase() === role.toLowerCase()
    );
  }

  /**
   * Get authentication token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Check if user is authenticated
   */
  isLoggedIn(): boolean {
    return this.isAuthenticated() && !!this.getToken();
  }

  /**
   * Get user display name
   */
  getUserDisplayName(): string {
    const user = this.currentUser();
    return user?.userName || user?.email || 'User';
  }

  /**
   * Private: Save token to localStorage
   */
  private saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }
  

  /**
   * Private: Set current user and update all state
   */
  private setUser(user: User): void {
    this.currentUser.set(user);
    this.currentUserSubject.next(user);
    this.cacheUser(user);
  }

  /**
   * Private: Cache user in localStorage
   */
  private cacheUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Private: Get cached user from localStorage
   */
  private getCachedUser(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Private: Clear all authentication data
   */
  private clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.currentUserSubject.next(null);
    this.isAuthenticated.set(false);
  }

  /**
   * Private: Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.message || 
                     error.error?.title ||
                     `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    console.error('Auth Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
