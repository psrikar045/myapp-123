import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { SidenavItemComponent } from './sidenav-item.component';
import { SidenavService } from '../../../services/sidenav.service';
import { SidenavItem } from '../../../models/navigation.models';

describe('SidenavItemComponent', () => {
  let component: SidenavItemComponent;
  let fixture: ComponentFixture<SidenavItemComponent>;
  let mockSidenavService: jest.Mocked<Partial<SidenavService>>;

  const mockSidenavItem: SidenavItem = {
    id: 'test-item',
    label: 'Test Item',
    icon: 'bi-test',
    route: '/test',
    isActive: false,
    isExpanded: false
  };

  const mockSidenavItemWithChildren: SidenavItem = {
    id: 'parent-item',
    label: 'Parent Item',
    icon: 'bi-parent',
    isActive: false,
    isExpanded: false,
    children: [
      {
        id: 'child-item',
        label: 'Child Item',
        route: '/child',
        isActive: false
      }
    ]
  };

  beforeEach(async () => {
    mockSidenavService = {
      navigateToRoute: jest.fn(),
      toggleItemExpanded: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [SidenavItemComponent, RouterTestingModule],
      providers: [
        { provide: SidenavService, useValue: mockSidenavService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SidenavItemComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.item = mockSidenavItem;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display item label and icon', () => {
    component.item = mockSidenavItem;
    fixture.detectChanges();

    const labelElement = fixture.nativeElement.querySelector('.sidenav-item-label');
    const iconElement = fixture.nativeElement.querySelector('.sidenav-item-icon i');

    expect(labelElement?.textContent.trim()).toBe('Test Item');
    expect(iconElement?.className).toContain('bi-test');
  });

  it('should navigate to route when item with route is clicked', () => {
    component.item = mockSidenavItem;
    fixture.detectChanges();

    const itemContent = fixture.nativeElement.querySelector('.sidenav-item-content');
    itemContent.click();

    expect(mockSidenavService.navigateToRoute).toHaveBeenCalledWith('/test');
  });

  it('should toggle expansion when parent item is clicked', () => {
    component.item = mockSidenavItemWithChildren;
    fixture.detectChanges();

    const itemContent = fixture.nativeElement.querySelector('.sidenav-item-content');
    itemContent.click();

    expect(mockSidenavService.toggleItemExpanded).toHaveBeenCalledWith('parent-item');
  });

  it('should show children when expanded', () => {
    component.item = { ...mockSidenavItemWithChildren, isExpanded: true };
    fixture.detectChanges();

    const submenu = fixture.nativeElement.querySelector('.sidenav-submenu');
    expect(submenu).toBeTruthy();
  });

  it('should hide children when collapsed', () => {
    component.item = { ...mockSidenavItemWithChildren, isExpanded: false };
    fixture.detectChanges();

    const submenu = fixture.nativeElement.querySelector('.sidenav-submenu');
    expect(submenu).toBeFalsy();
  });

  it('should display badge when present', () => {
    component.item = {
      ...mockSidenavItem,
      badge: { count: 5, type: 'primary' }
    };
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('.sidenav-item-badge .badge');
    expect(badge?.textContent.trim()).toBe('5');
    expect(badge?.className).toContain('badge-primary');
  });

  it('should show arrow for items with children', () => {
    component.item = mockSidenavItemWithChildren;
    fixture.detectChanges();

    const arrow = fixture.nativeElement.querySelector('.sidenav-item-arrow');
    expect(arrow).toBeTruthy();
  });

  it('should not show arrow for items without children', () => {
    component.item = mockSidenavItem;
    fixture.detectChanges();

    const arrow = fixture.nativeElement.querySelector('.sidenav-item-arrow');
    expect(arrow).toBeFalsy();
  });

  it('should apply active class when item is active', () => {
    component.item = { ...mockSidenavItem, isActive: true };
    fixture.detectChanges();

    const itemElement = fixture.nativeElement.querySelector('.sidenav-item');
    expect(itemElement?.className).toContain('active');
  });

  it('should generate correct tooltip text', () => {
    component.item = {
      ...mockSidenavItem,
      badge: { count: 3, type: 'warning' }
    };

    const tooltipText = component.getTooltipText();
    expect(tooltipText).toBe('Test Item (3)');
  });

  it('should track items by id', () => {
    const trackResult = component.trackByItemId(0, mockSidenavItem);
    expect(trackResult).toBe('test-item');
  });

  it('should handle collapsed state', () => {
    component.item = mockSidenavItem;
    component.collapsed = true;
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('.sidenav-item-label');
    expect(label?.className).toContain('sr-only');
  });
});