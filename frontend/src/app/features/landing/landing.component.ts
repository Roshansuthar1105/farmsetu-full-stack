import { Component, HostListener, inject, signal, computed } from '@angular/core';
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
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';

interface CropConfig {
  name: string;
  nameHi: string;
  baseYield: number; // Quintals per acre
  pricePerQl: number; // INR
  costPerAcre: number; // INR
}

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
  readonly theme = inject(ThemeService);
  readonly auth = inject(AuthService);
  isScrolled = signal(false);
  readonly currentYear = new Date().getFullYear();

  readonly iconLeaf = LucideLeaf;
  readonly iconArrowRight = LucideArrowRight;
  readonly iconShield = LucideShieldCheck;
  readonly iconSprout = LucideSprout;

  // ROI Calculator inputs
  readonly selectedCrop = signal<string>('wheat');
  readonly farmSize = signal<number>(2);
  readonly soilType = signal<string>('loamy');

  readonly cropsMap: Record<string, CropConfig> = {
    wheat: { name: 'Wheat', nameHi: 'गेहूं', baseYield: 18, pricePerQl: 2450, costPerAcre: 12000 },
    rice: { name: 'Rice (Paddy)', nameHi: 'धान (चावल)', baseYield: 22, pricePerQl: 2300, costPerAcre: 15500 },
    cotton: { name: 'Cotton', nameHi: 'कपास', baseYield: 9, pricePerQl: 7200, costPerAcre: 20000 },
    mustard: { name: 'Mustard', nameHi: 'सरसों', baseYield: 8, pricePerQl: 5650, costPerAcre: 10500 }
  };

  readonly soilMultipliers: Record<string, number> = {
    loamy: 1.2,
    clayey: 1.0,
    sandy: 0.75,
    black: 1.35
  };

  // ROI Outputs computed reactively
  readonly calculatorResult = computed(() => {
    const crop = this.cropsMap[this.selectedCrop()];
    const size = this.farmSize();
    const soilMult = this.soilMultipliers[this.soilType()];

    if (!crop) return { totalYield: 0, cost: 0, revenue: 0, profit: 0, roi: 0 };

    const totalYield = size * crop.baseYield * soilMult;
    const cost = size * crop.costPerAcre;
    const revenue = totalYield * crop.pricePerQl;
    const profit = revenue - cost;
    const roi = cost > 0 ? (profit / cost) * 100 : 0;

    return {
      totalYield: Math.round(totalYield * 10) / 10,
      cost: Math.round(cost),
      revenue: Math.round(revenue),
      profit: Math.round(profit),
      roi: Math.round(roi)
    };
  });

  // Simulated live ticker commodities
  readonly tickerCommodities = [
    { name: 'Wheat (गेहूं)', price: '₹2,450', change: '+2.4%', up: true, location: 'Khanna Mandi' },
    { name: 'Paddy (धान)', price: '₹2,300', change: '+1.8%', up: true, location: 'Karnal Mandi' },
    { name: 'Mustard (सरसों)', price: '₹5,650', change: '-0.5%', up: false, location: 'Alwar Mandi' },
    { name: 'Cotton (कपास)', price: '₹7,200', change: '+3.1%', up: true, location: 'Rajkot Mandi' },
    { name: 'Potato (आलू)', price: '₹1,450', change: '+5.2%', up: true, location: 'Agra Mandi' },
    { name: 'Onion (प्याज)', price: '₹2,100', change: '-4.3%', up: false, location: 'Lasalgaon Mandi' },
    { name: 'Soyabean (सोयाबीन)', price: '₹4,800', change: '+0.7%', up: true, location: 'Indore Mandi' }
  ];

  // Features description
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

  // Update calculator inputs
  setCrop(crop: string) {
    this.selectedCrop.set(crop);
  }

  setSoil(soil: string) {
    this.soilType.set(soil);
  }

  setFarmSize(size: string) {
    const val = parseFloat(size);
    if (!isNaN(val) && val > 0) {
      this.farmSize.set(val);
    }
  }
}
