import { Routes } from '@angular/router';
import { roleGuard } from './auth/guards/role.guard';
import { UserRole } from './auth/services/auth.service';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./home/home/home.component')
            .then(c => c.HomeComponent)
    },
    {
        path: 'destinations',
        loadChildren: () => import('./destination/destination-routes')
            .then(r => r.DESTINATION_ROUTES)
    },
    {
        path: 'bookings',
        // canActivate: [roleGuard([UserRole.CUSTOMER])],
        loadChildren: () => import('./booking/booking-routes')
            .then(r => r.BOOKING_ROUTES)
    },
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth-routes')
            .then(r => r.AUTH_ROUTES)
    },
    {
        path: 'tour',
        loadChildren: () => import('./tour/tour-routes')
            .then(r => r.TOUR_ROUTES)
    },
    {
        path: 'consultants',
        loadComponent: () => import('./shared/consultant-dashboard/consultant-dashboard.component')
            .then(c => c.ConsultantDashboardComponent)
    },
    {
        path: 'edit-requests',
        // canActivate: [roleGuard([UserRole.CUSTOMER])],
        loadComponent: () => import('./shared/edit-requests/edit-requests.component')
            .then(r => r.EditRequestsComponent)
    },
];
