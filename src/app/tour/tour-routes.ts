import { Routes } from '@angular/router';
import { AddTourComponent } from '../tour/add-tour/add-tour.component';

export const TOUR_ROUTES: Routes = [

{
    path: '', // Remove 'tour' since it's already in parent route
    loadComponent: () => import('./list-tour/list-tour.component')
        .then(c => c.ListTourComponent)
},
];