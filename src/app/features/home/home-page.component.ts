import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface Card {
  title: string;
  subtitle?: string;
  icon?: string;
  content: string;
  cssClass: string;
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePageComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  // Mock data for cards
  readonly featuredCards: Card[] = [
    {
      title: 'Strat Building with Marketify',
      content: 'Access powerful tools to build and expand your brand strategy.',
      cssClass: 'card-large card-feature-1'
    },
    {
      title: 'Marketify - Seamless integration for developers',
      content: 'Integrate our APIs with ease. Robust, reliable, and ready for scale.',
      cssClass: 'card-large card-feature-2'
    }
  ];

  readonly apiCards: Card[] = [
    {
      title: 'Brand API',
      subtitle: 'Core Functionality',
      icon: 'pie_chart',
      content: 'Discover and analyze brand data.',
      cssClass: 'card-medium'
    },
    {
      title: 'Logo API',
      subtitle: 'Visual Assets',
      icon: 'image',
      content: 'Retrieve and manage brand logos.',
      cssClass: 'card-medium'
    },
    {
      title: 'Search API',
      subtitle: 'Data Retrieval',
      icon: 'search',
      content: 'Powerful and flexible search capabilities.',
      cssClass: 'card-medium'
    }
  ];

  readonly supportCards: Card[] = [
    {
      title: 'API Documentation',
      content: 'Detailed guides and references for all our APIs.',
      cssClass: 'card-small'
    },
    {
      title: 'Need Help?',
      content: 'Our support team is here to assist you with any questions.',
      cssClass: 'card-small'
    },
    {
      title: 'Community Forum',
      content: 'Connect with other developers and share your projects.',
      cssClass: 'card-small'
    },
    {
      title: 'Contact Support',
      content: 'Get in touch with us for personalized support.',
      cssClass: 'card-small'
    }
  ];

  onLogout(): void {
    this.authService.logout(); // Assuming logout logic is in AuthService
    this.router.navigate(['/login']);
  }
}
