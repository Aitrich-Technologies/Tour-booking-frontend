import { Routes } from '@angular/router';
import { roleGuard } from '../auth/guards/role.guard';
import { UserRole } from '../auth/services/auth.service';

export const TOUR_ROUTES: Routes = [

    {
        path: 'catalog',
        loadComponent: () => import('./tour-catalog/tour-catalog.component')
            .then(c => c.TourCatalogComponent)
    },
    {
        path: 'manage',
        canActivate: [roleGuard([UserRole.CONSULTANT, UserRole.AGENCY])],
        children: [
            {
                path: '',
                loadComponent: () => import('./list-tour/list-tour.component')
                    .then(c => c.ListTourComponent)
            }
            ,
            {
                path: 'tour-detail/:id',
                loadComponent: () => import('./agency-tour-detail/agency-tour-detail.component')
                    .then(c => c.AgencyTourDetailComponent)
            },

        ]
    }
    ,
    {path: 'add-tour/:id', canActivate: [roleGuard([UserRole.CONSULTANT])], loadComponent: () => import('./add-tour/add-tour.component').then(c => c.AddTourComponent)}
    ,
    {
        path: ':id',
        loadComponent: () => import('./tour-detail/tour-detail.component')
            .then(c => c.TourDetailComponent)
    }
];