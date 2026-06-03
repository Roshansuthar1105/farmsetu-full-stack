import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'fs-profile',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent],
  template: `
    <fs-page-header title="Profile" />
    @if (user(); as u) {
      <div class="fs-card max-w-lg">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
            {{ u.name.charAt(0) }}
          </div>
          <div>
            <h3 class="text-xl font-bold">{{ u.name }}</h3>
            <p class="text-sm text-gray-500">{{ u.role }} · {{ u.state }}, {{ u.district }}</p>
          </div>
        </div>
        <dl class="mt-6 space-y-2 text-sm">
          <div class="flex justify-between"><dt>Email</dt><dd>{{ u.email ?? '—' }}</dd></div>
          <div class="flex justify-between"><dt>Phone</dt><dd>{{ u.phone ?? '—' }}</dd></div>
          <div class="flex justify-between"><dt>Reputation</dt><dd>{{ u.reputationScore ?? 0 }}</dd></div>
          <div class="flex justify-between"><dt>Language</dt><dd>{{ u.preferredLanguage }}</dd></div>
        </dl>
        <a routerLink="/app/settings" class="mt-4 inline-block text-primary text-sm font-medium">Settings →</a>
      </div>
    }
  `
})
export class ProfileComponent {
  private readonly auth = inject(AuthService);
  readonly user = this.auth.currentUser;
}
