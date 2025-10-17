import { Directive, effect, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService, UserRole } from '../../auth/services/auth.service';

@Directive({
  selector: '[appHasRole]'
})
export class HasRoleDirective {
  private roles: string[] = [];
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {
    effect(() => {
      this.updateView();
    });
  }

  @Input()
  set appHasRole(roles: UserRole | UserRole[] | string | string[]) {
    // Normalize input to array of strings
    if (typeof roles === 'string') {
      this.roles = [roles];
    } else if (Array.isArray(roles)) {
      this.roles = roles.map(r => String(r));
    } else {
      this.roles = [String(roles)];
    }
    this.updateView();
  }

  private updateView(): void {
    const hasRole = this.authService.hasAnyRole(this.roles);
    
    if (hasRole && !this.hasView) {
      this.viewContainer.clear();
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasRole && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}