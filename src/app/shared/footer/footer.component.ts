import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
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
    this.checkScrollPosition();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.checkScrollPosition();
  }

  private checkScrollPosition(): void {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Show button when user has scrolled down 300px or reached footer area
    this.showBackToTop = scrollPosition > 300 || (scrollPosition + windowHeight >= documentHeight - 200);
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
