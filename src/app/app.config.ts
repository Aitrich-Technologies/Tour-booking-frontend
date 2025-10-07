import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { HttpClient, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth/interceptors/auth.interceptor';
import { AuthService } from './auth/services/auth.service';

export function initializeApp(authService: AuthService) {
  return () => {
    const token = authService.getToken();
    const user = authService.currentUser();
    
    // Only fetch fresh data if we have a token and stored user
    if (token && user) {
      return authService.getCurrentUser()
        .toPromise()
        .catch(error => {
          console.error('Failed to initialize user:', error);
          // If token is invalid/expired, clear auth
          authService.logout();
          return null;
        });
    }
    
    return Promise.resolve(null);
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AuthService],
      multi: true
    }
  ]
};
