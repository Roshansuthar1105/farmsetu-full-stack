import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import {
  LucideFileCheck,
  LucideGavel,
  LucideAlertTriangle,
  LucideScale,
  LucideUserCheck,
  LucideStore,
  LucideArrowLeft
} from '@lucide/angular';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'fs-terms-of-service',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    PageHeaderComponent,
    LucideFileCheck,
    LucideGavel,
    LucideAlertTriangle,
    LucideScale,
    LucideUserCheck,
    LucideStore,
    LucideArrowLeft
  ],
  template: `
    <div class="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <!-- Top Action Bar -->
      <div class="flex items-center justify-between">
        <a routerLink="/" class="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
          <svg lucideArrowLeft size="16"></svg>
          Back to Home
        </a>
        <span class="text-xs text-slate-400 dark:text-slate-500 font-mono">Last updated: July 2026</span>
      </div>

      <!-- Hero Header -->
      <div class="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden">
        <div class="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div class="relative z-10 space-y-4">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <svg lucideScale size="14"></svg>
            Terms & Conditions
          </div>
          <h1 class="text-3xl md:text-5xl font-extrabold font-display leading-tight">Terms of Service</h1>
          <p class="text-slate-300 text-sm md:text-base max-w-2xl leading-relaxed">
            Please review the terms and conditions governing your access and use of the FarmSetu platform, services, marketplace, and agricultural tools.
          </p>
        </div>
      </div>

      <!-- Quick Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <svg lucideUserCheck size="20"></svg>
          </div>
          <h3 class="font-bold text-slate-900 dark:text-slate-100 text-sm">Farmer Commitment</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">Users agree to provide authentic crop details, fair marketplace listings, and accurate information.</p>
        </div>

        <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <svg lucideStore size="20"></svg>
          </div>
          <h3 class="font-bold text-slate-900 dark:text-slate-100 text-sm">Safe Marketplace</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">All buyer-seller listings, machinery bookings, and labor hirings undergo safety screening.</p>
        </div>

        <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <svg lucideAlertTriangle size="20"></svg>
          </div>
          <h3 class="font-bold text-slate-900 dark:text-slate-100 text-sm">Advisory Guidance</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">AI disease diagnosis and weather alerts serve as expert advisory aids, not strict guarantees.</p>
        </div>
      </div>

      <!-- Main Terms Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Sidebar Navigation -->
        <div class="lg:col-span-1 space-y-2 sticky top-6 self-start hidden lg:block">
          <p class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3">Articles</p>
          <nav class="space-y-1 text-xs font-medium">
            <a href="#term-1" class="block px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">1. Acceptance & Eligibility</a>
            <a href="#term-2" class="block px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">2. Account Responsibilities</a>
            <a href="#term-3" class="block px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">3. Marketplace & Trading</a>
            <a href="#term-4" class="block px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">4. Machinery & Labor</a>
            <a href="#term-5" class="block px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">5. Advisory Disclaimers</a>
            <a href="#term-6" class="block px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">6. Governing Law</a>
          </nav>
        </div>

        <!-- Terms Body Content -->
        <div class="lg:col-span-3 space-y-10 text-slate-700 dark:text-slate-300 text-sm leading-relaxed bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 md:p-10 shadow-sm">
          <!-- Article 1 -->
          <section id="term-1" class="space-y-3">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs flex items-center justify-center font-bold">1</span>
              Acceptance of Terms & Eligibility
            </h2>
            <p>By creating an account, accessing, or browsing the FarmSetu application ("Platform"), you acknowledge that you have read, understood, and agreed to be legally bound by these Terms of Service.</p>
            <p class="text-xs text-slate-600 dark:text-slate-400">Eligibility requirements include:</p>
            <ul class="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li>You must be at least 18 years of age or possess legal capacity under Indian Contract Act, 1872.</li>
              <li>You must provide accurate registration details including a valid mobile number or email.</li>
            </ul>
          </section>

          <div class="h-px bg-slate-200/70 dark:bg-slate-800"></div>

          <!-- Article 2 -->
          <section id="term-2" class="space-y-3">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs flex items-center justify-center font-bold">2</span>
              Account Security & Responsibilities
            </h2>
            <p>Users are responsible for maintaining the confidentiality of their login credentials (OTP/Passwords). Any activity originating from your account remains your sole legal responsibility.</p>
          </section>

          <div class="h-px bg-slate-200/70 dark:bg-slate-800"></div>

          <!-- Article 3 -->
          <section id="term-3" class="space-y-3">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs flex items-center justify-center font-bold">3</span>
              Marketplace & Trading Conduct
            </h2>
            <p>FarmSetu provides an online marketplace platform connecting agricultural sellers, traders, and buyers:</p>
            <ul class="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li><strong>Listings:</strong> Sellers must accurately specify crop grade, weight, prices, and organic certifications. Misleading listings will be removed.</li>
              <li><strong>Payments:</strong> All transactions processed via FarmSetu escrow or linked payment gateways follow verified settlement cycles.</li>
              <li><strong>Prohibited Items:</strong> Unauthorized chemical pesticides, counterfeit seeds, or illegal products are strictly banned.</li>
            </ul>
          </section>

          <div class="h-px bg-slate-200/70 dark:bg-slate-800"></div>

          <!-- Article 4 -->
          <section id="term-4" class="space-y-3">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs flex items-center justify-center font-bold">4</span>
              Machinery Rentals & Labor Bookings
            </h2>
            <p>When booking equipment (tractors, harvesters, drones) or hiring agricultural labor through FarmSetu:</p>
            <ul class="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li>Equipment owners are responsible for maintaining machinery in safe operational condition.</li>
              <li>Hirers must adhere to agreed time slots, usage terms, and prompt payment upon completion.</li>
            </ul>
          </section>

          <div class="h-px bg-slate-200/70 dark:bg-slate-800"></div>

          <!-- Article 5 -->
          <section id="term-5" class="space-y-3">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs flex items-center justify-center font-bold">5</span>
              AI Crop Diagnostics & Advisory Disclaimer
            </h2>
            <p>Our AI Disease Detection and weather recommendation models provide high-precision advisory guidance based on uploaded photos and telemetry data. However, environmental variables, micro-climates, and unobserved soil factors may influence actual outcomes. Farmers are encouraged to consult local agricultural extension officers for critical farm interventions.</p>
          </section>

          <div class="h-px bg-slate-200/70 dark:bg-slate-800"></div>

          <!-- Article 6 -->
          <section id="term-6" class="space-y-3">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs flex items-center justify-center font-bold">6</span>
              Governing Law & Legal Support
            </h2>
            <p>These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the courts in New Delhi, India.</p>
            <div class="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-xs space-y-1 font-mono">
              <p class="font-bold text-slate-900 dark:text-slate-100">Legal & Support Enquiries</p>
              <p>Email: legal&#64;farmsetu.com</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  `
})
export class TermsOfServiceComponent {
  readonly theme = inject(ThemeService);
}
