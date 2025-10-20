import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // List of public endpoints that don't need authentication
  const publicEndpoints = [
    '/User/Login',
    '/User/Registration',
    '/Tour/GetAll',
    '/Tour/Get',
    '/Destination/GetAll',
    '/Destination/Get'
  ];
  
  // Check if this is a public endpoint
  const isPublicEndpoint = publicEndpoints.some(endpoint => 
    req.url.includes(endpoint)
  );
  
  let authReq = req;
  
  // Only add token if NOT a public endpoint
  if (!isPublicEndpoint) {
    const token = authService.getToken();
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  }
  
  // Handle the request and catch authentication errors
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only redirect to login for protected endpoints
      if (error.status === 401 && !isPublicEndpoint) {
        console.error('Authentication error - redirecting to login');
        authService.logout();
        router.navigate(['/auth/login'], { 
          queryParams: { returnUrl: router.url }
        });
      }
      
      return throwError(() => error);
    })
  );
};
