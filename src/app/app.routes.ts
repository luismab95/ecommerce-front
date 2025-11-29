import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Client routes
  {
    path: '',
    loadComponent: () =>
      import('./features/client/client-layout/client-layout.component').then(
        (m) => m.ClientLayoutComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/client/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/client/products/product-catalog.component').then(
            (m) => m.ProductCatalogComponent
          ),
      },
      {
        path: 'products/:id',
        loadComponent: () =>
          import('./features/client/product-detail/product-detail.component').then(
            (m) => m.ProductDetailComponent
          ),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/client/category-list/category-list.component').then(
            (m) => m.CategoryListComponent
          ),
      },
    ],
  },

  // Admin routes
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/admin-layout/admin-layout.component').then(
        (m) => m.AdminLayoutComponent
      ),
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent
          ),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/admin/products/admin-products.component').then(
            (m) => m.AdminProductsComponent
          ),
      },
      {
        path: 'products/:id/images',
        loadComponent: () =>
          import('./features/admin/products/product-images/admin-product-images.component').then(
            (m) => m.AdminProductImagesComponent
          ),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/admin/categories/admin-categories.component').then(
            (m) => m.AdminCategoriesComponent
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/users/admin-users.component').then((m) => m.AdminUsersComponent),
      },
    ],
  },

  // Redirect unknown routes
  {
    path: '**',
    redirectTo: '',
  },
];
