import { Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  LucideLeaf,
  LucideArrowRight,
  LucideShieldCheck,
  LucideSprout,
  LucideStore,
  LucideTrendingUp,
  LucideMicroscope,
  LucideCloudRain,
  LucideUsers,
  LucideBanknote,
  LucideDynamicIcon
} from '@lucide/angular';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'fs-landing',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LucideLeaf,
    LucideArrowRight,
    LucideShieldCheck,
    LucideSprout,
    LucideStore,
    LucideTrendingUp,
    LucideMicroscope,
    LucideCloudRain,
    LucideUsers,
    LucideBanknote,
    LucideDynamicIcon
  ],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  readonly i18n = inject(I18nService);
  isScrolled = signal(false);
  readonly currentYear = new Date().getFullYear();

  readonly iconLeaf = LucideLeaf;
  readonly iconArrowRight = LucideArrowRight;
  readonly iconShield = LucideShieldCheck;
  readonly iconSprout = LucideSprout;

  readonly features = [
    { icon: LucideStore, title: 'Marketplace', desc: 'Buy & sell seeds, tools, and equipment directly.' },
    { icon: LucideTrendingUp, title: 'Market Analysis', desc: 'Live mandi prices, trends, and sell-time alerts.' },
    { icon: LucideMicroscope, title: 'AI Disease Detection', desc: 'Instant crop diagnosis and treatment from photos.' },
    { icon: LucideCloudRain, title: 'Hyperlocal Weather', desc: 'Forecasts and crop-specific alerts for your village.' },
    { icon: LucideUsers, title: 'Community', desc: 'Connect with farmers and verified experts across India.' },
    { icon: LucideBanknote, title: 'Govt Schemes', desc: 'Eligibility checks and guides for central & state schemes.' }
  ];

  readonly stats = [
    { label: 'Registered Farmers', value: '50K+' },
    { label: 'Active Mandis', value: '120+' },
    { label: 'Crops Supported', value: '200+' },
    { label: 'Expert Diagnoses', value: '1M+' }
  ];

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled.set(window.scrollY > 20);
  }
}
