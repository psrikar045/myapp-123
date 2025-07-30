import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// Removed Angular Material dependencies - using Bootstrap instead
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

import { ToolbarService } from '../../shared/services/toolbar.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  companyIcons = [
    { src: 'assets/company/Item-1.svg', alt: 'Company 1' },
    { src: 'assets/company/Item-2.svg', alt: 'Company 2' },
    { src: 'assets/company/Item-3.svg', alt: 'Company 3' },
    { src: 'assets/company/Item-4.svg', alt: 'Company 4' }
  ];
  constructor(private toolbarService: ToolbarService) {
    // Initialize any necessary services or state here
  }
  ngOnInit(): void {
    // Toolbar state is handled automatically by header component based on auth status
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Navigation methods for the cards
  navigateToBrands(): void {
    this.router.navigate(['/all-categories']);
  }

  navigateToBrandApi(): void {
    this.router.navigate(['/brandApi']);
  }

  navigateToDevelopers(): void {
    this.router.navigate(['/developer']);
  }
   navigateToAccountHub(): void {
    this.router.navigate(['/brands/account-hub']);
  }
}
