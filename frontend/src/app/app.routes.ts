import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    title: '',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'dashboard',
    redirectTo: 'app/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'privacy-policy',
    title: 'Privacy Policy',
    loadComponent: () => import('./features/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent)
  },
  {
    path: 'terms-of-service',
    title: 'Terms of Service',
    loadComponent: () => import('./features/terms-of-service/terms-of-service.component').then(m => m.TermsOfServiceComponent)
  },
  {
    path: 'contact',
    title: 'Contact Us',
    loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent)
  },
  {
    path: 'help',
    redirectTo: 'app/help',
    pathMatch: 'full'
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
        title: 'Dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'farm-dashboard',
        title: 'Farm Dashboard',
        loadComponent: () => import('./features/farm-dashboard/farm-dashboard.component').then(m => m.FarmDashboardComponent)
      },
      {
        path: 'privacy-policy',
        title: 'Privacy Policy',
        loadComponent: () => import('./features/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent)
      },
      {
        path: 'terms-of-service',
        title: 'Terms of Service',
        loadComponent: () => import('./features/terms-of-service/terms-of-service.component').then(m => m.TermsOfServiceComponent)
      },
      {
        path: 'contact',
        title: 'Contact Us',
        loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent)
      },
      {
        path: 'help',
        title: 'Help & Support',
        loadComponent: () => import('./features/help/help.component').then(m => m.HelpComponent)
      },
      {
        path: 'marketplace',
        loadChildren: () => import('./features/marketplace/marketplace.routes').then(m => m.MARKETPLACE_ROUTES)
      },
      {
        path: 'orders',
        title: 'Orders',
        loadComponent: () => import('./features/marketplace/orders.component').then(m => m.OrdersComponent)
      },
      {
        path: 'farm-chat',
        title: 'Farm Chat',
        loadComponent: () => import('./features/chat/farm-chat.component').then(m => m.FarmChatComponent)
      },
      {
        path: 'community',
        title: 'Community',
        loadComponent: () => import('./features/community/community.component').then(m => m.CommunityComponent)
      },
      {
        path: 'market-analysis',
        title: 'Market Analysis',
        loadComponent: () => import('./features/market-analysis/market-analysis.component').then(m => m.MarketAnalysisComponent)
      },
      {
        path: 'weather',
        title: 'Weather',
        loadComponent: () => import('./features/weather/weather.component').then(m => m.WeatherComponent)
      },
      {
        path: 'news',
        title: 'News',
        loadComponent: () => import('./features/news/news.component').then(m => m.NewsComponent)
      },
      {
        path: 'resources',
        title: 'Resources',
        loadComponent: () => import('./features/resources/resources.component').then(m => m.ResourcesComponent)
      },
      {
        path: 'govt-schemes',
        title: 'Government Schemes',
        loadComponent: () => import('./features/govt-schemes/govt-schemes.component').then(m => m.GovtSchemesComponent)
      },
      {
        path: 'insurance',
        title: 'Insurance',
        loadComponent: () => import('./features/insurance/insurance.component').then(m => m.InsuranceComponent)
      },
      {
        path: 'crop-recommendation',
        title: 'Crop Recommendation',
        loadComponent: () => import('./features/crop-recommendation/crop-recommendation.component').then(m => m.CropRecommendationComponent)
      },
      {
        path: 'crop-calendar',
        title: 'Crop Calendar',
        loadComponent: () => import('./features/crop-calendar/crop-calendar.component').then(m => m.CropCalendarComponent)
      },
      {
        path: 'disease-detection',
        title: 'Disease Detection',
        loadComponent: () => import('./features/disease-detection/disease-detection.component').then(m => m.DiseaseDetectionComponent)
      },
      {
        path: 'mandi-finder',
        title: 'Mandi Finder',
        loadComponent: () => import('./features/mandi-finder/mandi-finder.component').then(m => m.MandiFinderComponent)
      },
      {
        path: 'water-queue',
        title: 'Water Queue',
        loadComponent: () => import('./features/water-queue/water-queue.component').then(m => m.WaterQueueComponent)
      },
      {
        path: 'financial',
        title: 'Financial',
        loadComponent: () => import('./features/financial/financial.component').then(m => m.FinancialComponent)
      },
      {
        path: 'labor-booking',
        title: 'Labor Booking',
        loadComponent: () => import('./features/labor-booking/labor-booking.component').then(m => m.LaborBookingComponent)
      },
      {
        path: 'labor-booking/manage/:jobId',
        title: 'Manage Applicants',
        loadComponent: () => import('./features/labor-booking/manage-applicants/manage-applicants.component').then(m => m.ManageApplicantsComponent)
      },
      {
        path: 'machinery',
        title: 'Machinery',
        loadComponent: () => import('./features/machinery/machinery.component').then(m => m.MachineryDashboardComponent)
      },
      {
        path: 'notifications',
        title: 'Notifications',
        loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent)
      },
      {
        path: 'profile',
        title: 'Profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'settings',
        title: 'Settings',
        loadComponent: () => import('./features/profile/settings.component').then(m => m.SettingsComponent)
      },
      {
        path: 'help',
        title: 'Help & Support',
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
        title: 'Admin Dashboard',
        loadComponent: () => import('./features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'users',
        title: 'Admin | Users',
        loadComponent: () => import('./features/admin/users/admin-users.component').then(m => m.AdminUsersComponent)
      },
      {
        path: 'farms',
        title: 'Admin | Farms',
        loadComponent: () => import('./features/admin/farms/admin-farms.component').then(m => m.AdminFarmsComponent)
      },
      {
        path: 'crops',
        title: 'Admin | Crops',
        loadComponent: () => import('./features/admin/crops/admin-crops.component').then(m => m.AdminCropsComponent)
      },
      {
        path: 'mandis',
        title: 'Admin | Mandis',
        loadComponent: () => import('./features/admin/mandis/admin-mandis.component').then(m => m.AdminMandisComponent)
      },
      {
        path: 'market-prices',
        title: 'Admin | Market Prices',
        loadComponent: () => import('./features/admin/crops/market-prices-bulk.component').then(m => m.MarketPricesBulkComponent)
      },
      {
        path: 'email',
        title: 'Admin | Email',
        loadComponent: () => import('./features/admin/email/admin-email.component').then(m => m.AdminEmailComponent)
      },
      {
        path: 'orders',
        title: 'Admin | Orders',
        loadComponent: () => import('./features/admin/orders/admin-orders.component').then(m => m.AdminOrdersComponent)
      },
      {
        path: 'water-queue',
        title: 'Admin | Water Queue',
        loadComponent: () => import('./features/admin/water-queue/admin-water-queue.component').then(m => m.AdminWaterQueueComponent)
      },
      {
        path: 'schemes',
        title: 'Admin | Schemes',
        loadComponent: () => import('./features/admin/schemes/admin-schemes.component').then(m => m.AdminSchemesComponent)
      },
      {
        path: 'insurance',
        title: 'Admin | Insurance',
        loadComponent: () => import('./features/admin/insurance/admin-insurance.component').then(m => m.AdminInsuranceComponent)
      },
      {
        path: 'products',
        title: 'Admin | Products',
        loadComponent: () => import('./features/admin/products/admin-products.component').then(m => m.AdminProductsComponent)
      },
      {
        path: 'analytics',
        title: 'Admin | Analytics',
        loadComponent: () => import('./features/admin/analytics/admin-analytics.component').then(m => m.AdminAnalyticsComponent)
      },
      {
        path: 'news',
        title: 'Admin | News',
        loadComponent: () => import('./features/admin/news/admin-news.component').then(m => m.AdminNewsComponent)
      },
      {
        path: 'resources',
        title: 'Admin | Resources',
        loadComponent: () => import('./features/admin/resources/admin-resources.component').then(m => m.AdminResourcesComponent)
      },
      {
        path: 'notifications',
        title: 'Admin | Notifications',
        loadComponent: () => import('./features/admin/notifications/admin-notifications.component').then(m => m.AdminNotificationsComponent)
      },
      {
        path: 'settings',
        title: 'Admin | Settings',
        loadComponent: () => import('./features/admin/settings/admin-settings.component').then(m => m.AdminSettingsComponent)
      }
    ]
  },
  {
    path: '**',
    title: 'Page Not Found',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
