import { Component, Input, inject, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Subject, takeUntil } from 'rxjs';
import { SidenavItem } from '../../../models/navigation.models';
import { SidenavService } from '../../../services/sidenav.service';

@Component({
  selector: 'app-sidenav-item',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <li class="sidenav-item" 
        [class.has-children]="hasChildren"
        [class.expanded]="item.isExpanded"
        [class.active]="item.isActive"
        [class.level-0]="level === 0"
        [class.level-1]="level === 1"
        [class.collapsed]="collapsed">
      
      <!-- Main Item -->
      <div class="sidenav-item-content"
           [class.clickable]="item.route || hasChildren"
           [class.parent-item]="hasChildren && level === 0"
           [class.child-item]="level > 0"
           (click)="onItemClick()"
           (mouseenter)="onMouseEnter()"
           (mouseleave)="onMouseLeave()">
        
        <!-- Icon -->
        <span class="sidenav-item-icon" *ngIf="item.icon && !collapsed">
          <i [class]="item.icon" aria-hidden="true"></i>
        </span>
        
        <!-- Collapsed Icon (when sidebar is collapsed) -->
        <span class="sidenav-item-icon-collapsed" *ngIf="collapsed">
          <i [class]="item.icon || getDefaultIcon()" aria-hidden="true"></i>
        </span>
        
        <!-- Label -->
        <span class="sidenav-item-label" 
              [class.visually-hidden]="collapsed"
              *ngIf="!collapsed || !item.icon">
          {{ item.label }}
        </span>
        
        <!-- Badge -->
        <span class="sidenav-item-badge" 
              *ngIf="item.badge && !collapsed">
          <span class="badge"
                [class]="getBadgeClass()"
                [class.badge-pulse]="item.badge.pulse">
            {{ item.badge.count || item.badge.text }}
          </span>
        </span>
        
        <!-- Expand/Collapse Icon -->
        <span class="sidenav-item-arrow" 
              *ngIf="hasChildren && !collapsed">
          <i class="bi-chevron-down" 
             [class.rotated]="item.isExpanded"
             aria-hidden="true"></i>
        </span>
      </div>
      
      <!-- Children with Bootstrap Collapse -->
      <div class="sidenav-submenu-wrapper" 
           *ngIf="hasChildren">
        <div class="collapse" 
             [class.show]="item.isExpanded"
             [class.collapsed-submenu]="collapsed"
             [id]="'submenu-' + item.id">
          <ul class="sidenav-submenu" 
              [class.collapsed-submenu-list]="collapsed">
            <app-sidenav-item 
              *ngFor="let child of item.children; trackBy: trackByItemId"
              [item]="child"
              [level]="level + 1"
              [collapsed]="collapsed">
            </app-sidenav-item>
          </ul>
        </div>
      </div>
      
      <!-- Enhanced Tooltip for collapsed state -->
      <div class="sidenav-tooltip" 
           *ngIf="collapsed && item.label"
           [class.show-tooltip]="showTooltip">
        {{ getTooltipText() }}
      </div>
    </li>
  `,
  styleUrls: ['./sidenav-item.component.scss'],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        opacity: 1,
        transform: 'translateY(0)',
        maxHeight: '500px'
      })),
      state('out', style({
        opacity: 0,
        transform: 'translateY(-10px)',
        maxHeight: '0px'
      })),
      transition('in => out', animate('300ms ease-out')),
      transition('out => in', animate('300ms ease-in'))
    ])
  ]
})
export class SidenavItemComponent implements OnInit, OnDestroy {
  @Input() item!: SidenavItem;
  @Input() level: number = 0;
  @Input() collapsed: boolean = false;

  showTooltip: boolean = false;
  
  private sidenavService = inject(SidenavService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Subscribe to navigation items changes to trigger change detection
    this.sidenavService.navigationItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get hasChildren(): boolean {
    return !!(this.item.children && this.item.children.length > 0);
  }
get hasActiveChildren(): boolean {
    return this.hasChildren && this.item.children!.some(child => child.isActive);
  }
  // onItemClick(): void {
  //   // Block navigation for submenu items only
  //   // if (this.level > 0 && this.item.label !== 'Brands Api' && this.item.label !== 'API Dashboard' && this.item.label !== 'API Keys') {
  //   //   return;
  //   // }

  //   if (this.item.route) {
  //     // Navigate to route
  //     this.sidenavService.navigateToRoute(this.item.route);
  //   } else if (this.hasChildren) {
  //     // Toggle expansion
  //     this.sidenavService.toggleItemExpanded(this.item.id);
  //   } else if (this.item.action) {
  //     // Execute custom action
  //     this.item.action();
  //   }
  // }
onItemClick(): void {
  if (this.collapsed) {
    if (this.hasChildren) {
      // When clicked in collapsed state, just toggle expansion to show child icons
      this.sidenavService.toggleItemExpanded(this.item.id);
    } else if (this.item.route) {
      // Navigate to route for items without children
      this.sidenavService.navigateToRoute(this.item.route);
    }
  } else {
    // Normal behavior when not collapsed
    if (this.item.route && !this.hasChildren) {
      // Navigate to route for leaf items (no children)
      this.sidenavService.navigateToRoute(this.item.route);
    } else if (this.item.route && this.hasChildren) {
      // For items with both route and children (like Dashboard)
      // Navigate to the route and close all dropdowns
      this.sidenavService.navigateToRoute(this.item.route);
    } else if (this.hasChildren) {
      // Toggle expansion for parent items (only children, no route)
      this.sidenavService.toggleItemExpanded(this.item.id);
    } 
    // else if (this.item.route) {
    //   // Navigate to route for parent items that also have routes
    //   this.sidenavService.navigateToRoute(this.item.route);
    // } 
    else if (this.item.action) {
      // Execute custom action
      this.item.action();
    }
  }
}
  trackByItemId(index: number, item: SidenavItem): string {
    return item.id;
  }

  getTooltipText(): string {
    let text = this.item.label;
    if (this.item.badge) {
      text += ` (${this.item.badge.count || this.item.badge.text})`;
    }
    return text;
  }

  getBadgeClass(): string {
    if (!this.item.badge) return '';
    return `badge-${this.item.badge.type}`;
  }
  
  onMouseEnter(): void {
    if (this.collapsed) {
      this.showTooltip = true;
    }
  }
  
  onMouseLeave(): void {
    this.showTooltip = false;
  }
  
  getDefaultIcon(): string {
    // Provide default icons based on level or item type
    if (this.level === 0) {
      return 'bi-circle'; // Parent item default
    } else {
      return 'bi-dot'; // Child item default
    }
  }
}