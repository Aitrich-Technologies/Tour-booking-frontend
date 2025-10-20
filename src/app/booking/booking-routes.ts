import { Routes } from '@angular/router';
import { roleGuard } from '../auth/guards/role.guard';
import { UserRole } from '../auth/services/auth.service';

export const BOOKING_ROUTES: Routes = [

    {
        path: 'manage',
        canActivate: [roleGuard([UserRole.CONSULTANT, UserRole.AGENCY])],
        children: [
            {
                path: '',
                loadComponent: () => import('./agency-bookings/agency-bookings.component')
                    .then(c => c.AgencyBookingsComponent)
            },
        ]
    },
    {
        path: 'booking-info/:id',
        loadComponent: () => import('./booking-info/booking-info.component')
            .then(m => m.BookingInfoComponent)
    },
    {
        path: '',
        loadComponent: () => import('./list-bookings/list-bookings.component')
            .then(c => c.ListBookingsComponent)
    },
    {
        path: ':id',
        loadComponent: () => import('./booking-details/booking-details.component')
            .then(m => m.BookingDetailsComponent)
    },
    {
        path: 'booking-form/:tourId',
        loadComponent: () => import('./booking-form/booking-form.component')
            .then(c => c.BookingFormComponent)
    }

];