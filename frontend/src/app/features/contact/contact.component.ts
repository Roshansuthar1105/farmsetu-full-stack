import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import {
  LucidePhone,
  LucideMail,
  LucideMapPin,
  LucideMessageSquare,
  LucideSend,
  LucideCheckCircle2,
  LucideClock,
  LucideHelpCircle,
  LucideArrowLeft
} from '@lucide/angular';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'fs-contact',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    PageHeaderComponent,
    LucidePhone,
    LucideMail,
    LucideMapPin,
    LucideMessageSquare,
    LucideSend,
    LucideCheckCircle2,
    LucideClock,
    LucideHelpCircle,
    LucideArrowLeft
  ],
  template: `
    <div class="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <!-- Top Navigation -->
      <div class="flex items-center justify-between">
        <a routerLink="/" class="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
          <svg lucideArrowLeft size="16"></svg>
          Back to Home
        </a>
        <a routerLink="/app/help" class="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-600 transition font-medium">
          <svg lucideHelpCircle size="14"></svg>
          Visit Help & FAQ Center
        </a>
      </div>

      <!-- Hero Header -->
      <div class="bg-gradient-to-br from-emerald-800 via-slate-900 to-slate-950 text-white rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden">
        <div class="absolute -top-10 -right-10 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl"></div>
        <div class="relative z-10 space-y-4">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <svg lucideMessageSquare size="14"></svg>
            24/7 Farmer Support
          </div>
          <h1 class="text-3xl md:text-5xl font-extrabold font-display leading-tight">Get in Touch With FarmSetu</h1>
          <p class="text-slate-300 text-sm md:text-base max-w-2xl leading-relaxed">
            Have questions about mandi prices, AI crop diagnosis, marketplace orders, or technical support? Our expert team is ready to assist you.
          </p>
        </div>
      </div>

      <!-- Support Channel Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <svg lucidePhone size="20"></svg>
          </div>
          <h3 class="font-bold text-slate-900 dark:text-slate-100 text-sm">Toll-Free Helpline</h3>
          <p class="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold">+91 1800-123-4567</p>
          <p class="text-[11px] text-slate-400">Mon - Sat: 6:00 AM - 9:00 PM IST</p>
        </div>

        <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <svg lucideMail size="20"></svg>
          </div>
          <h3 class="font-bold text-slate-900 dark:text-slate-100 text-sm">Email Support</h3>
          <p class="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold">support&#64;farmsetu.com</p>
          <p class="text-[11px] text-slate-400">Average response time: &lt; 2 hours</p>
        </div>

        <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <svg lucideClock size="20"></svg>
          </div>
          <h3 class="font-bold text-slate-900 dark:text-slate-100 text-sm">Live Kisan Chat</h3>
          <p class="text-xs text-emerald-600 dark:text-emerald-400 font-medium">In-app Farm Chat</p>
          <p class="text-[11px] text-slate-400">Instant AI & Agronomist assistance</p>
        </div>

        <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <svg lucideMapPin size="20"></svg>
          </div>
          <h3 class="font-bold text-slate-900 dark:text-slate-100 text-sm">Headquarters</h3>
          <p class="text-xs text-slate-600 dark:text-slate-300">Krishi Bhavan Tech Hub</p>
          <p class="text-[11px] text-slate-400">New Delhi, India 110001</p>
        </div>
      </div>

      <!-- Main Layout: Contact Form & Info -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- Form Section -->
        <div class="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">Send Us a Message</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Fill out the form below and our team will get back to you promptly.</p>
          </div>

          @if (submitted()) {
            <div class="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-start gap-3 animate-fade-in">
              <svg lucideCheckCircle2 size="22" class="text-emerald-600 shrink-0 mt-0.5"></svg>
              <div class="space-y-1">
                <p class="font-bold text-sm">Thank you for reaching out!</p>
                <p class="text-xs text-emerald-700 dark:text-emerald-400">Your ticket (#FS-{{ ticketId() }}) has been logged. An agronomist or support representative will contact you shortly.</p>
                <button (click)="resetForm()" class="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-300 underline hover:no-underline">
                  Send another message
                </button>
              </div>
            </div>
          } @else {
            <form (ngSubmit)="sendMessage()" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Full Name *</label>
                  <input type="text" [(ngModel)]="formData.name" name="name" required placeholder="e.g. Ramesh Kumar"
                    class="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-250 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-emerald-500 transition">
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Contact (Phone or Email) *</label>
                  <input type="text" [(ngModel)]="formData.contact" name="contact" required placeholder="Mobile number or email"
                    class="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-250 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-emerald-500 transition">
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Inquiry Category</label>
                <select [(ngModel)]="formData.category" name="category"
                  class="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-250 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-emerald-500 transition cursor-pointer">
                  <option value="general">General Agriculture Inquiry</option>
                  <option value="disease">Crop Health & Disease Diagnostic</option>
                  <option value="mandi">Mandi Prices & Trading</option>
                  <option value="marketplace">Marketplace & Orders</option>
                  <option value="machinery">Machinery & Equipment Rental</option>
                  <option value="schemes">Government Schemes Assistance</option>
                  <option value="technical">Technical App Issue</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Subject *</label>
                <input type="text" [(ngModel)]="formData.subject" name="subject" required placeholder="Brief summary of your query"
                  class="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-250 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-emerald-500 transition">
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Message / Query Details *</label>
                <textarea [(ngModel)]="formData.message" name="message" rows="4" required placeholder="Please describe your question or issue in detail..."
                  class="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-250 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-emerald-500 transition resize-none"></textarea>
              </div>

              <button type="submit" [disabled]="isSubmitting() || !formData.name || !formData.contact || !formData.message"
                class="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition duration-200 flex items-center justify-center gap-2">
                @if (isSubmitting()) {
                  <span>Sending Message...</span>
                } @else {
                  <svg lucideSend size="16"></svg>
                  <span>Submit Inquiry</span>
                }
              </button>
            </form>
          }
        </div>

        <!-- Sidebar FAQs & Regional Offices -->
        <div class="lg:col-span-5 space-y-6">
          <div class="bg-slate-900 text-white rounded-3xl p-6 md:p-8 space-y-4 shadow-sm relative overflow-hidden">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <svg lucideHelpCircle size="20"></svg>
            </div>
            <h3 class="font-bold text-lg font-display">Common Questions</h3>
            <p class="text-xs text-slate-300 leading-relaxed">
              Looking for quick answers on how to use AI crop detection or track mandi commodity prices?
            </p>
            <div class="pt-2">
              <a routerLink="/app/help" class="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition">
                Explore Help Center & FAQs
              </a>
            </div>
          </div>

          <div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
            <h3 class="font-bold text-sm text-slate-900 dark:text-white">Regional Krishi Hubs</h3>
            <div class="space-y-3 text-xs text-slate-600 dark:text-slate-400">
              <div class="border-b border-slate-100 dark:border-slate-800 pb-2">
                <p class="font-bold text-slate-800 dark:text-slate-200">North India Hub (Karnal, Haryana)</p>
                <p class="text-[11px] text-slate-400">GT Road, Agri Tech Park | +91 0184-225-8900</p>
              </div>
              <div class="border-b border-slate-100 dark:border-slate-800 pb-2">
                <p class="font-bold text-slate-800 dark:text-slate-200">West India Hub (Rajkot, Gujarat)</p>
                <p class="text-[11px] text-slate-400">GIDC Market Yard | +91 0281-245-1200</p>
              </div>
              <div>
                <p class="font-bold text-slate-800 dark:text-slate-200">Central India Hub (Indore, MP)</p>
                <p class="text-[11px] text-slate-400">Sanwer Road Industrial Area | +91 0731-280-4500</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ContactComponent {
  readonly theme = inject(ThemeService);

  formData = {
    name: '',
    contact: '',
    category: 'general',
    subject: '',
    message: ''
  };

  isSubmitting = signal(false);
  submitted = signal(false);
  ticketId = signal(Math.floor(100000 + Math.random() * 900000));

  sendMessage(): void {
    if (!this.formData.name || !this.formData.contact || !this.formData.message) return;
    this.isSubmitting.set(true);

    setTimeout(() => {
      this.isSubmitting.set(false);
      this.submitted.set(true);
    }, 800);
  }

  resetForm(): void {
    this.formData = {
      name: '',
      contact: '',
      category: 'general',
      subject: '',
      message: ''
    };
    this.submitted.set(false);
    this.ticketId.set(Math.floor(100000 + Math.random() * 900000));
  }
}
