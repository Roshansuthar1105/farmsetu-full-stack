import { Routes } from '@angular/router';

export const MARKETPLACE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./product-list.component').then(m => m.ProductListComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./product-detail.component').then(m => m.ProductDetailComponent)
  }
];
