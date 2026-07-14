import { Routes } from '@angular/router';

export const MARKETPLACE_ROUTES: Routes = [
  {
    path: '',
    title: 'Marketplace',
    loadComponent: () => import('./product-list.component').then(m => m.ProductListComponent)
  },
  {
    path: 'cart',
    title: 'Cart',
    loadComponent: () => import('./cart.component').then(m => m.CartComponent)
  },
  {
    path: 'orders',
    redirectTo: '/app/orders',
    pathMatch: 'full'
  },
  {
    path: ':id',
    title: 'Product Details',
    loadComponent: () => import('./product-detail.component').then(m => m.ProductDetailComponent)
  }
];

