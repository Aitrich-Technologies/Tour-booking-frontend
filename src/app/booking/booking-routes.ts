import { Routes } from '@angular/router';

export const BOOKING_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./list-bookings/list-bookings.component')
            .then(c => c.ListBookingsComponent)
    }
];