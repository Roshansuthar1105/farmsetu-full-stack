import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { RbacService, Permission } from '../services/rbac.service';

@Directive({
  selector: '[fsHasPermission]',
  standalone: true
})
export class HasPermissionDirective {
  private readonly templateRef = inject(TemplateRef);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly rbacService = inject(RbacService);

  private permission: Permission | null = null;
  private hasView = false;

  @Input() set fsHasPermission(val: Permission) {
    this.permission = val;
    this.updateView();
  }

  private updateView(): void {
    if (!this.permission) {
      this.viewContainer.clear();
      this.hasView = false;
      return;
    }

    const isAuthorized = this.rbacService.hasPermission(this.permission);

    if (isAuthorized && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!isAuthorized && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
