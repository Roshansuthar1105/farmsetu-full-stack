import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { PageResponse } from '../../core/models/user.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'fs-notifications',
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <fs-page-header title="Notifications" />
    @for (n of items(); track n.id) {
      <div class="fs-card mb-2" [class.opacity-60]="n.read">
        <p class="font-medium">{{ n.title }}</p>
        <p class="text-sm text-gray-500">{{ n.message }}</p>
      </div>
    }
  `
})
export class NotificationsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  readonly items = signal<any[]>([]);

  ngOnInit(): void {
    const id = this.auth.currentUser()?.id ?? 1;
    this.api.getPage<any>(`/api/notifications/${id}`).subscribe({
      next: (p: PageResponse<any>) => this.items.set(p.content)
    });
  }
}
