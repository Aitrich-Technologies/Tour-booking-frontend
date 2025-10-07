import { Directive, effect, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService, UserRole } from '../../auth/services/auth.service';

@Directive({
  selector: '[appHasRole]'
})
export class HasRoleDirective {

    private roles: UserRole[] = [];

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {
    // Use effect to react to role changes (Angular 19 approach)
    effect(() => {
      this.updateView();
    });
  }

  @Input()
  set appHasRole(roles: UserRole | UserRole[]) {
    this.roles = Array.isArray(roles) ? roles : [roles];
    this.updateView();
  }

  private updateView(): void {
    const hasRole = this.authService.hasAnyRole(this.roles);
    
    if (hasRole) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }

}
