import { Routes } from '@angular/router';

export const MARKETPLACE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./product-list.component').then(m => m.ProductListComponent)
  },
  {
    path: 'cart',
    loadComponent: () => import('./cart.component').then(m => m.CartComponent)
  },
  {
    path: 'orders',
    loadComponent: () => import('./orders.component').then(m => m.OrdersComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./product-detail.component').then(m => m.ProductDetailComponent)
  }
];
