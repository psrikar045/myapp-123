import { Component, Input } from '@angular/core';

/**
 * Mock HeaderComponent to avoid dependency cascades in tests
 * This replaces the real HeaderComponent in component tests
 */
@Component({
  selector: 'app-header',
  standalone: true,
  template: '<div data-testid="mock-header">Mock Header</div>'
})
export class MockHeaderComponent {
  @Input() showNavigation = true;
  @Input() transparent = false;
}