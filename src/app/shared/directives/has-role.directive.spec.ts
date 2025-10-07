import { HasRoleDirective } from '../directives/has-role.directive';

describe('HasRoleDirective', () => {
  it('should create an instance', () => {
    const directive = new HasRoleDirective({} as any, {} as any, {} as any);
    expect(directive).toBeTruthy();
  });
});
