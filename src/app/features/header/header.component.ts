import { Component } from '@angular/core';
import { ToolbarService, ToolbarLogo, ToolbarNavItem, ToolbarAction } from '../../shared/services/toolbar.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  logo: ToolbarLogo;
  navItems: ToolbarNavItem[];
  actions: ToolbarAction[];

  constructor(public toolbarService: ToolbarService) {
    this.logo = this.toolbarService.logo;
    this.navItems = this.toolbarService.navItems;
    this.actions = this.toolbarService.actions;
  }
}
