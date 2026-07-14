import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'app',
    loadComponent: () => import('./shared/components/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'farm-dashboard',
        loadComponent: () => import('./features/farm-dashboard/farm-dashboard.component').then(m => m.FarmDashboardComponent)
      },
      {
        path: 'marketplace',
        loadChildren: () => import('./features/marketplace/marketplace.routes').then(m => m.MARKETPLACE_ROUTES)
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/marketplace/orders.component').then(m => m.OrdersComponent)
      },
      {
        path: 'farm-chat',
        loadComponent: () => import('./features/chat/farm-chat.component').then(m => m.FarmChatComponent)
      },
      {
        path: 'community',
        loadComponent: () => import('./features/community/community.component').then(m => m.CommunityComponent)
      },
      {
        path: 'market-analysis',
        loadComponent: () => import('./features/market-analysis/market-analysis.component').then(m => m.MarketAnalysisComponent)
      },
      {
        path: 'weather',
        loadComponent: () => import('./features/weather/weather.component').then(m => m.WeatherComponent)
      },
      {
        path: 'news',
        loadComponent: () => import('./features/news/news.component').then(m => m.NewsComponent)
      },
      {
        path: 'resources',
        loadComponent: () => import('./features/resources/resources.component').then(m => m.ResourcesComponent)
      },
      {
        path: 'govt-schemes',
        loadComponent: () => import('./features/govt-schemes/govt-schemes.component').then(m => m.GovtSchemesComponent)
      },
      {
        path: 'insurance',
        loadComponent: () => import('./features/insurance/insurance.component').then(m => m.InsuranceComponent)
      },
      {
        path: 'crop-recommendation',
        loadComponent: () => import('./features/crop-recommendation/crop-recommendation.component').then(m => m.CropRecommendationComponent)
      },
      {
        path: 'crop-calendar',
        loadComponent: () => import('./features/crop-calendar/crop-calendar.component').then(m => m.CropCalendarComponent)
      },
      {
        path: 'disease-detection',
        loadComponent: () => import('./features/disease-detection/disease-detection.component').then(m => m.DiseaseDetectionComponent)
      },
      {
        path: 'mandi-finder',
        loadComponent: () => import('./features/mandi-finder/mandi-finder.component').then(m => m.MandiFinderComponent)
      },
      {
        path: 'water-queue',
        loadComponent: () => import('./features/water-queue/water-queue.component').then(m => m.WaterQueueComponent)
      },
      {
        path: 'financial',
        loadComponent: () => import('./features/financial/financial.component').then(m => m.FinancialComponent)
      },
      {
        path: 'labor-booking',
        loadComponent: () => import('./features/labor-booking/labor-booking.component').then(m => m.LaborBookingComponent)
      },
      {
        path: 'labor-booking/manage/:jobId',
        loadComponent: () => import('./features/labor-booking/manage-applicants/manage-applicants.component').then(m => m.ManageApplicantsComponent)
      },
      {
        path: 'machinery',
        loadComponent: () => import('./features/machinery/machinery.component').then(m => m.MachineryDashboardComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/profile/settings.component').then(m => m.SettingsComponent)
      },
      {
        path: 'help',
        loadComponent: () => import('./features/help/help.component').then(m => m.HelpComponent)
      }
    ]
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./shared/components/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/users/admin-users.component').then(m => m.AdminUsersComponent)
      },
      {
        path: 'crops',
        loadComponent: () => import('./features/admin/crops/admin-crops.component').then(m => m.AdminCropsComponent)
      },
      {
        path: 'mandis',
        loadComponent: () => import('./features/admin/mandis/admin-mandis.component').then(m => m.AdminMandisComponent)
      },
      {
        path: 'market-prices',
        loadComponent: () => import('./features/admin/crops/market-prices-bulk.component').then(m => m.MarketPricesBulkComponent)
      },
      {
        path: 'email',
        loadComponent: () => import('./features/admin/email/admin-email.component').then(m => m.AdminEmailComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/admin/orders/admin-orders.component').then(m => m.AdminOrdersComponent)
      },
      {
        path: 'water-queue',
        loadComponent: () => import('./features/admin/water-queue/admin-water-queue.component').then(m => m.AdminWaterQueueComponent)
      },
      {
        path: 'schemes',
        loadComponent: () => import('./features/admin/schemes/admin-schemes.component').then(m => m.AdminSchemesComponent)
      },
      {
        path: 'insurance',
        loadComponent: () => import('./features/admin/insurance/admin-insurance.component').then(m => m.AdminInsuranceComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./features/admin/products/admin-products.component').then(m => m.AdminProductsComponent)
      },
      {
        path: 'analytics',
        loadComponent: () => import('./features/admin/analytics/admin-analytics.component').then(m => m.AdminAnalyticsComponent)
      },
      {
        path: 'news',
        loadComponent: () => import('./features/admin/news/admin-news.component').then(m => m.AdminNewsComponent)
      },
      {
        path: 'resources',
        loadComponent: () => import('./features/admin/resources/admin-resources.component').then(m => m.AdminResourcesComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/admin/notifications/admin-notifications.component').then(m => m.AdminNotificationsComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/admin/settings/admin-settings.component').then(m => m.AdminSettingsComponent)
      }
      // ,
      // {
      //   path: 'marketplace',
      //   loadComponent: () => import('./features/admin/marketplace/admin-marketplace.component').then(m => m.AdminMarketplaceComponent)
      // },
      // {
      //   path: 'marketplace',
      //   loadComponent: () => import('./features/admin/marketplace/admin-marketplace.component').then(m => m.AdminMarketplaceComponent)
      // },
      // {
      //   path: 'services',
      //   loadComponent: () => import('./features/admin/services/admin-services.component').then(m => m.AdminServicesComponent)
      // },
      // {
      //   path: 'insurance',
      //   loadComponent: () => import('./features/admin/insurance/admin-insurance.component').then(m => m.AdminInsuranceComponent)
      // },
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
