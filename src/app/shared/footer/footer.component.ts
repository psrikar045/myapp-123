import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  companyName = 'Marketify';
  companyDescription = 'Access logos, brand colors, fonts and social links by simply entering a domain name';
  copyright = '© Copyright 2021 Duxo.io All rights reserved.';

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
}
