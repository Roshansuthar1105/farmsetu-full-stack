import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import {
  LucideSprout,
  LucideCloudRain,
  LucideTrendingUp,
  LucideDroplet,
  LucideCalendarDays,
  LucideClipboardCheck,
  LucideAlertTriangle,
  LucideChevronRight,
  LucideActivity,
  LucideSparkles,
  LucideMessageSquareCode
} from '@lucide/angular';

interface DashboardTask {
  id: number;
  title: string;
  time: string;
  category: string;
  done: boolean;
}

@Component({
  selector: 'fs-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    PageHeaderComponent,
    LucideSprout,
    LucideCloudRain,
    LucideTrendingUp,
    LucideDroplet,
    LucideCalendarDays,
    LucideClipboardCheck,
    LucideAlertTriangle,
    LucideChevronRight,
    LucideActivity,
    LucideSparkles,
    LucideMessageSquareCode
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  readonly auth = inject(AuthService);

  // Time-based customized greeting
  readonly greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  });

  // Top level stats & telemetry metrics
  readonly soilMoisture = signal(68);
  readonly soilTemp = signal(24);
  readonly soilPh = signal(6.4);
  readonly npkRatio = signal('N:45, P:30, K:20');

  // Weather widget metrics
  readonly currentTemp = signal(29);
  readonly weatherStatus = signal('Scattered Showers');
  readonly weatherAlert = signal({
    title: 'Rain Storm Warning',
    desc: 'Heavy showers predicted at 4:00 PM in your village. Consider adjusting your scheduled canal watering queue.',
    critical: true
  });

  // Mandi watchlist prices
  readonly watchlistPrices = signal([
    { crop: 'Wheat (गेहूं)', price: '₹2,450/Ql', delta: '+2.4%', up: true, market: 'Khanna Mandi' },
    { crop: 'Mustard (सरसों)', price: '₹5,650/Ql', delta: '-0.5%', up: false, market: 'Alwar Mandi' },
    { crop: 'Cotton (कпас)', price: '₹7,200/Ql', delta: '+3.1%', up: true, market: 'Rajkot Mandi' }
  ]);

  // Active crop calendar task list
  readonly activeTasks = signal<DashboardTask[]>([
    { id: 1, title: 'Book Canal Irrigation slot', time: 'Today, 4:00 PM', category: 'Watering', done: false },
    { id: 2, title: 'Apply Organic Nitrogen booster', time: 'Tomorrow morning', category: 'Fertilizing', done: false },
    { id: 3, title: 'Conduct leaf classification scan', time: 'In 2 days', category: 'AI Scan', done: true },
    { id: 4, title: 'Check market rate trends', time: 'Weekly task', category: 'Market', done: false }
  ]);

  // Quick navigation modules
  readonly portalLinks = [
    { path: '/app/weather', icon: 'cloud_queue', label: 'Hyperlocal Weather', desc: 'Village weather forecasts', color: 'text-sky-500' },
    { path: '/app/market-analysis', icon: 'auto_graph', label: 'Mandi Price Hub', desc: 'Live crop rates & analysis', color: 'text-amber-500' },
    { path: '/app/disease-detection', icon: 'center_focus_strong', label: 'AI Disease Scan', desc: 'Identify crop infections', color: 'text-emerald-500' },
    { path: '/app/marketplace', icon: 'storefront', label: 'Agri Marketplace', desc: 'Buy inputs, seeds & tools', color: 'text-green-500' },
    { path: '/app/chat', icon: 'forum', label: 'Agronomist Chat', desc: 'Get live specialist guidance', color: 'text-indigo-500' },
    { path: '/app/crop-calendar', icon: 'calendar_today', label: 'Cultivation Planner', desc: 'Task guides & checklists', color: 'text-teal-500' },
    { path: '/app/govt-schemes', icon: 'policy', label: 'Subsidies & Schemes', desc: 'Government support guides', color: 'text-rose-500' },
    { path: '/app/mandi-finder', icon: 'near_me', label: 'Mandi Finder', desc: 'Locate local market spaces', color: 'text-purple-500' }
  ];

  // Toggle task completion
  toggleTask(id: number) {
    this.activeTasks.update(tasks =>
      tasks.map(t => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }
}
