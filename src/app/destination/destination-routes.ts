import { Routes } from '@angular/router';

export const DESTINATION_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./destination-list/destination-list.component')
            .then(c => c.DestinationListComponent)
    }
];