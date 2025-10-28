import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./core/layout/layout.component').then((m) => m.LayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./features/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'trip/:id',
        loadComponent: () =>
          import('./features/trip-detail/trip-detail.component').then(
            (m) => m.TripDetailComponent
          ),
      },
      {
        path: '**',
        redirectTo: 'home',
      },
    ],
  },
];
