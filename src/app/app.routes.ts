import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./home/home/home.component')
            .then(c => c.HomeComponent)
    },
    {
        path: 'tour',
        loadChildren: () => import('./tour/tour-routes')
            .then(r => r.TOUR_ROUTES)
    },
    {
        path: 'destinations',
        loadChildren: () => import('./destination/destination-routes')
            .then(r => r.DESTINATION_ROUTES)
    },
    {
        path: 'bookings',
        loadChildren: () => import('./booking/booking-routes')
            .then(r => r.BOOKING_ROUTES)
    },
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth-routes')
        .then(r => r.AUTH_ROUTES)
    }
];
