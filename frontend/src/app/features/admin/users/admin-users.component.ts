import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'fs-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly toastr = inject(ToastrService);

  users = signal<User[]>([]);
  selectedUser = signal<any>(null);
  showEditModal = signal(false);

  // Pagination
  page = 0;
  size = 10;
  totalElements = 0;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.api.get<any>('/api/admin/users', { page: this.page, size: this.size }).subscribe({
      next: (res) => {
        this.users.set(res.content);
        this.totalElements = res.totalElements;
      },
      error: () => this.showError('Failed to load users')
    });
  }

  onEdit(user: User): void {
    this.api.get<any>(`/api/admin/users/${user.id}`).subscribe({
      next: (fullUser) => {
        // Map farmer profile flat fields for easier form binding
        const fp = fullUser.farmerProfile || {};
        this.selectedUser.set({
          ...fullUser,
          farmArea: fp.farmArea || null,
          soilType: fp.soilType || '',
          soilPh: fp.soilPh || null,
          waterSource: fp.waterSource || '',
          farmingExperience: fp.farmingExperience || null,
          farmingType: fp.farmingType || 'CONVENTIONAL'
        });
        this.showEditModal.set(true);
      },
      error: () => this.showError('Failed to fetch user details')
    });
  }

  onSave(): void {
    const user = this.selectedUser();
    if (!user) return;

    this.api.put<any>(`/api/admin/users/${user.id}/details`, user).subscribe({
      next: () => {
        this.showSuccess('User updated successfully');
        this.showEditModal.set(false);
        this.loadUsers();
      },
      error: () => this.showError('Failed to save user details')
    });
  }

  onDelete(user: User): void {
    if (confirm(`Are you sure you want to deactivate ${user.name}?`)) {
      this.api.delete<void>(`/api/admin/users/${user.id}`).subscribe({
        next: () => {
          this.showSuccess('User deactivated successfully');
          this.loadUsers();
        },
        error: () => this.showError('Failed to deactivate user')
      });
    }
  }

  toggleActive(user: User, event: Event): void {
    const active = (event.target as HTMLInputElement).checked;
    this.api.put<any>(`/api/admin/users/${user.id}`, { active }).subscribe({
      next: () => this.showSuccess(`User ${active ? 'activated' : 'deactivated'}`),
      error: () => {
        this.showError('Failed to update status');
        this.loadUsers();
      }
    });
  }

  toggleVerified(user: User, event: Event): void {
    const verified = (event.target as HTMLInputElement).checked;
    this.api.put<any>(`/api/admin/users/${user.id}`, { verified }).subscribe({
      next: () => this.showSuccess(`User verification updated`),
      error: () => {
        this.showError('Failed to update status');
        this.loadUsers();
      }
    });
  }

  nextPage(): void {
    if ((this.page + 1) * this.size < this.totalElements) {
      this.page++;
      this.loadUsers();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadUsers();
    }
  }

  private showSuccess(msg: string): void {
    this.toastr.success(msg, 'Success');
  }

  private showError(msg: string): void {
    this.toastr.error(msg, 'Error');
  }
}
