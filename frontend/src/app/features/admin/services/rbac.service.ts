import { Injectable, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/user.model';

export type Permission = 'create' | 'edit' | 'delete' | 'view_analytics' | 'manage_settings';

@Injectable({ providedIn: 'root' })
export class RbacService {
  private readonly auth = inject(AuthService);

  private readonly roleWeights: Record<UserRole, number> = {
    SUPER_ADMIN: 100,
    ADMIN: 80,
    MANAGER: 60,
    EDITOR: 40,
    VIEWER: 20,
    SELLER: 0,
    EXPERT: 0,
    FARMER: 0
  };

  hasRole(requiredRole: UserRole): boolean {
    const userRole = this.auth.currentUser()?.role;
    if (!userRole) return false;
    return this.roleWeights[userRole] >= this.roleWeights[requiredRole];
  }

  hasPermission(permission: Permission): boolean {
    const userRole = this.auth.currentUser()?.role;
    if (!userRole) return false;
    const weight = this.roleWeights[userRole];

    switch (permission) {
      case 'delete':
        return weight >= 80; // Only ADMIN and SUPER_ADMIN can delete
      case 'manage_settings':
        return weight >= 80; // ADMIN and SUPER_ADMIN can manage settings
      case 'edit':
      case 'create':
        return weight >= 40; // EDITOR, MANAGER, ADMIN, SUPER_ADMIN can edit/create
      case 'view_analytics':
        return weight >= 20; // VIEWER and above can view analytics
      default:
        return false;
    }
  }
}
