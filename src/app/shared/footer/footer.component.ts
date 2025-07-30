import { Component, OnInit, OnDestroy, HostListener, Injectable, inject, PLATFORM_ID  } from '@angular/core';
import { CommonModule, isPlatformBrowser  } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit, OnDestroy {
  companyName = 'RIVO9';
  companyDescription = 'Access logos, brand colors, fonts and social links by simply entering a domain name';
  copyright = '© Copyright 2025 RIVO9. All rights reserved.';
  currentYear = new Date().getFullYear();
  
  showBackToTop = false;

  socialLinks = [
    { iconClass: 'bi bi-instagram', url: 'https://instagram.com/' },
    { iconClass: 'bi bi-linkedin', url: 'https://linkedin.com/' },
    { iconClass: 'bi bi-facebook', url: 'https://facebook.com/' },
    { iconClass: 'bi bi-twitter', url: 'https://twitter.com/' },
  ];

  brandCategories = [
    { name: 'Computers Electronics', route: 'computers-electronics' },
    { name: 'Finance', route: 'finance' },
    { name: 'Vehicles', route: 'vehicles' },
    { name: 'E-Commerce', route: 'e-commerce' },
    { name: 'News and Media', route: 'news-media' },
    { name: 'Luxury', route: 'luxury' },
    { name: 'Arts and Entertainment', route: 'arts-entertainment' },
    { name: 'Food and Drink', route: 'food-drink' },
    { name: 'Travel and Tourism', route: 'travel-tourism' },
    { name: 'Business and Services', route: 'business-services' },
    { name: 'Lifestyle', route: 'lifestyle' },
    { name: 'View all categories →', route: '' }
  ];

  developerLinks = [
    { label: 'Developers', route: '/developer' },
    { label: 'Plugins', route: '#' },
    { label: 'Pricing', route: '/pricing' },
    { label: 'Docs', route: '#' },
  ];

  companyLinks = [
    { label: 'Brands', route: '/all-categories' },
    { label: 'Blog', route: '/blog' },
    { label: 'Contact Us', route: '#' },
    { label: 'Terms and conditions', route: '#' },
    { label: 'Privacy policy', route: '#' },
  ];

  constructor(private router: Router) {}

  navigateToCategory(category: { name: string, route: string }, event?: MouseEvent): void {
    if (event) {
      event.preventDefault();
    }
    
    if (category.name === 'View all categories') {
      this.router.navigate(['/all-categories']);
    } else {
      this.router.navigate(['/all-categories'], {
        queryParams: { category: category.route }
      });
    }
  }

  ngOnInit(): void {
  if (typeof window !== 'undefined') {
    this.checkScrollPosition();
    window.addEventListener('scroll', () => {
      this.checkScrollPosition();
    });
  }
}

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.checkScrollPosition();
  }

 checkScrollPosition(): void {
  if (typeof window !== 'undefined') {
    const scrollY = window.scrollY || window.pageYOffset;
    this.showBackToTop = scrollY > 200;
  }
}

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

 private platformId = inject(PLATFORM_ID);
  isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
