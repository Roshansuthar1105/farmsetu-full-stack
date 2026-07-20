import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import {
  LucideShieldCheck,
  LucideLock,
  LucideEye,
  LucideFileText,
  LucideUserCheck,
  LucideDatabase,
  LucideMail,
  LucideArrowLeft
} from '@lucide/angular';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'fs-privacy-policy',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    PageHeaderComponent,
    LucideShieldCheck,
    LucideLock,
    LucideEye,
    LucideFileText,
    LucideUserCheck,
    LucideDatabase,
    LucideMail,
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
      <div class="bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-950 text-white rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden">
        <div class="absolute -top-20 -right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div class="relative z-10 space-y-4">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <svg lucideShieldCheck size="14"></svg>
            Data Trust & Transparency
          </div>
          <h1 class="text-3xl md:text-5xl font-extrabold font-display leading-tight">Privacy Policy</h1>
          <p class="text-slate-300 text-sm md:text-base max-w-2xl leading-relaxed">
            At FarmSetu, your privacy and data security are paramount. Learn how we collect, protect, and handle your personal and agricultural data.
          </p>
        </div>
      </div>

      <!-- Quick Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <svg lucideLock size="20"></svg>
          </div>
          <h3 class="font-bold text-slate-900 dark:text-slate-100 text-sm">Full Ownership</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">You retain 100% ownership of your farm, soil, yield, and financial record data.</p>
        </div>

        <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <svg lucideEye size="20"></svg>
          </div>
          <h3 class="font-bold text-slate-900 dark:text-slate-100 text-sm">No Unwanted Selling</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">We never sell your personal contact info or individual farm metrics to third parties.</p>
        </div>

        <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <svg lucideDatabase size="20"></svg>
          </div>
          <h3 class="font-bold text-slate-900 dark:text-slate-100 text-sm">Bank-Grade Encryption</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">All data in transit and at rest is secured with AES-256 and SSL/TLS standards.</p>
        </div>
      </div>

      <!-- Main Content Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Sidebar Navigation -->
        <div class="lg:col-span-1 space-y-2 sticky top-6 self-start hidden lg:block">
          <p class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3">Sections</p>
          <nav class="space-y-1 text-xs font-medium">
            <a href="#section-1" class="block px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">1. Information We Collect</a>
            <a href="#section-2" class="block px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">2. How We Use Data</a>
            <a href="#section-3" class="block px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">3. Data Sharing & Security</a>
            <a href="#section-4" class="block px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">4. Your Control & Rights</a>
            <a href="#section-5" class="block px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">5. Cookies & Tracking</a>
            <a href="#section-6" class="block px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">6. Contact Privacy Team</a>
          </nav>
        </div>

        <!-- Policy Body Content -->
        <div class="lg:col-span-3 space-y-10 text-slate-700 dark:text-slate-300 text-sm leading-relaxed bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 md:p-10 shadow-sm">
          <!-- Section 1 -->
          <section id="section-1" class="space-y-3">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs flex items-center justify-center font-bold">1</span>
              Information We Collect
            </h2>
            <p>We collect information to provide better agricultural services, market insights, AI disease diagnostic accuracy, and seamless marketplace transactions.</p>
            <ul class="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li><strong>Account Information:</strong> Name, mobile number, email address, user profile details, and language preferences.</li>
              <li><strong>Agricultural & Farm Data:</strong> Farm location coordinates, soil type, crop types, planting dates, irrigation logs, and harvest estimates.</li>
              <li><strong>Diagnostic Images:</strong> Photos uploaded to AI Disease Detection or Community modules for crop diagnosis.</li>
              <li><strong>Financial & Transaction Data:</strong> Marketplace orders, machinery rentals, labor postings, payment receipts, and bank account information for sellers.</li>
            </ul>
          </section>

          <div class="h-px bg-slate-200/70 dark:bg-slate-800"></div>

          <!-- Section 2 -->
          <section id="section-2" class="space-y-3">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs flex items-center justify-center font-bold">2</span>
              How We Use Your Data
            </h2>
            <p>Your data is strictly utilized to operate and enhance your farming experience on FarmSetu:</p>
            <ul class="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li>Deliver hyperlocal weather forecasts and crop-tailored irrigation/fertilizer advice.</li>
              <li>Power real-time Mandi price matching and buyers-sellers marketplace connections.</li>
              <li>Train crop health AI models using anonymized diagnostic photos.</li>
              <li>Facilitate government scheme verification and subsidy eligibility checks.</li>
              <li>Send critical alerts regarding extreme weather, pest outbreaks, or price surges.</li>
            </ul>
          </section>

          <div class="h-px bg-slate-200/70 dark:bg-slate-800"></div>

          <!-- Section 3 -->
          <section id="section-3" class="space-y-3">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs flex items-center justify-center font-bold">3</span>
              Data Sharing & Security
            </h2>
            <p>We implement industry-standard encryption protocols (TLS/SSL in transit, AES-256 at rest) to safeguard your data against unauthorized access.</p>
            <p class="text-xs text-slate-600 dark:text-slate-400">We do not sell your personal data. We only share essential information with:</p>
            <ul class="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li>Verified logistics partners to fulfill marketplace equipment or produce orders.</li>
              <li>Authorized financial entities if you apply for agricultural loans or government schemes.</li>
              <li>Legal authorities when mandatory under applicable laws or regulatory mandates.</li>
            </ul>
          </section>

          <div class="h-px bg-slate-200/70 dark:bg-slate-800"></div>

          <!-- Section 4 -->
          <section id="section-4" class="space-y-3">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs flex items-center justify-center font-bold">4</span>
              Your Rights & Data Controls
            </h2>
            <p>As a FarmSetu user, you maintain total control over your digital footprint:</p>
            <ul class="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li><strong>Access & Export:</strong> Request a complete copy of your farm history and account data at any time.</li>
              <li><strong>Correction:</strong> Update or rectify your profile, mobile number, or farm parameters directly via Settings.</li>
              <li><strong>Account Deletion:</strong> You may request full account deletion through the support portal.</li>
            </ul>
          </section>

          <div class="h-px bg-slate-200/70 dark:bg-slate-800"></div>

          <!-- Section 5 -->
          <section id="section-5" class="space-y-3">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs flex items-center justify-center font-bold">5</span>
              Cookies & Local Storage
            </h2>
            <p>FarmSetu uses session cookies and local browser storage to keep you securely signed in, preserve your theme preference (Dark/Light), and store your language selection (English/Hindi).</p>
          </section>

          <div class="h-px bg-slate-200/70 dark:bg-slate-800"></div>

          <!-- Section 6 -->
          <section id="section-6" class="space-y-3">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs flex items-center justify-center font-bold">6</span>
              Contact Our Data Privacy Officer
            </h2>
            <p>If you have questions or concerns regarding our privacy practices, please contact our dedicated Privacy Team:</p>
            <div class="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1 font-mono">
              <p class="font-bold text-emerald-700 dark:text-emerald-400">FarmSetu Privacy Office</p>
              <p>Email: privacy&#64;farmsetu.com</p>
              <p>Helpline: +91 1800-123-4567 (Toll Free)</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  `
})
export class PrivacyPolicyComponent {
  readonly theme = inject(ThemeService);
}
