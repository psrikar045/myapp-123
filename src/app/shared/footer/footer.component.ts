import { Component, OnInit, OnDestroy, HostListener, Injectable, inject, PLATFORM_ID  } from '@angular/core';
import { CommonModule, isPlatformBrowser  } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit, OnDestroy {
  companyName = 'Marketify';
  companyDescription = 'Access logos, brand colors, fonts and social links by simply entering a domain name';
  copyright = '© Copyright 2021 Duxo.io All rights reserved.';
  
  showBackToTop = false;

  socialLinks = [
    { iconClass: 'bi bi-instagram', url: 'https://instagram.com/' },
    { iconClass: 'bi bi-linkedin', url: 'https://linkedin.com/' },
    { iconClass: 'bi bi-facebook', url: 'https://facebook.com/' },
    { iconClass: 'bi bi-twitter', url: 'https://twitter.com/' },
  ];

  brandCategories = [
    'Computers Electronics',
    'Finance',
    'Vehicles',
    'E-Commerce',
    'News and Media',
    'Luxury',
    'Arts and Entertainment',
    'Food and Drink',
    'Travel and Tourism',
    'Business and Services',
    'Lifestyle',
    'View all categories',
  ];

  developerLinks = [
    { label: 'Developers', url: '#' },
    { label: 'Pricing', url: '#' },
    { label: 'Docs', url: '#' },
  ];

  companyLinks = [
    { label: 'Home', url: '#' },
    { label: 'For Brands', url: '#' },
    { label: 'Plugins', url: '#' },
    { label: 'Terms and conditions', url: '#' },
    { label: 'Privacy policy', url: '#' },
    { label: 'Blog', url: '#' },
  ];

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
