import { Component, HostListener, OnDestroy, OnInit, inject, PLATFORM_ID, Inject, ViewChild } from '@angular/core';
import { isPlatformBrowser, CommonModule, NgClass, NgIf, NgFor, NgSwitch } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject, Subscription, fromEvent, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ThemeService } from '../../../core/services/theme.service';
import { LayoutService } from '../../../core/services/layout.service'; // Import LayoutService
import { Router } from '@angular/router';
import { HeaderComponent } from '../../header/header.component';
import { ToolbarService } from '../../../shared/services/toolbar.service';
@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule, // Add MatSidenavModule
    MatListModule,
    NgClass, NgIf, NgFor,    // Add MatListModule for nav items in sidenav
    HeaderComponent, // <-- Add HeaderComponent here
    FormsModule // <-- Add FormsModule for ngModel
  ],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  isDarkMode: boolean = false;
  isVisible: boolean = true;
  private lastScrollY: number = 0;

  // Replace isMobileView with Observable from LayoutService
  isMobile$: Observable<boolean>;

  private destroy$ = new Subject<void>();
  private themeSubscription!: Subscription;
  private scrollSubscription!: Subscription;

  private logoPath = 'images/logo.svg'; // Ensure correct path
  private sunIconPath = 'icons/sun.svg'; // Ensure correct path
  private cloudIconPath = 'icons/cloud.svg'; // Ensure correct path
  private arrowForwardIconPath = 'icons/arrow_forward.svg'; // Ensure correct path
  private menuIconPath = 'icons/menu.svg'; // Ensure correct path for menu icon

  private themeService = inject(ThemeService);
  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);
  private router = inject(Router);
  public layoutService = inject(LayoutService); // Inject LayoutService
  private toolbarService = inject(ToolbarService);
  @Inject(PLATFORM_ID) private platformId!: Object;

  isAnnual = false;

   constructor() {
    this.isMobile$ = this.layoutService.isMobile$; // Initialize isMobile$
    this.registerIcons();
  }

  ngOnInit(): void {
    this.toolbarService.setLoggedOutToolbar();
    this.themeSubscription = this.themeService.isDarkMode$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(isDark => {
      this.isDarkMode = isDark;
    });

    if (isPlatformBrowser(this.platformId)) {
      this.checkScrollPosition();
      // REMOVED: this.checkScreenSize(); // Screen size is now handled by LayoutService

      this.scrollSubscription = fromEvent(window, 'scroll').pipe(
        debounceTime(50),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      ).subscribe(() => this.handleScroll());

      // Close sidenav if screen size changes from mobile to desktop
      this.layoutService.isDesktop$.pipe(takeUntil(this.destroy$)).subscribe(isDesktop => {
        if (isDesktop && this.sidenav && this.sidenav.opened) {
          this.sidenav.close();
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private registerIcons(): void {
    const icons = [
      { name: 'company-logo', path: this.logoPath },
      { name: 'sun', path: this.sunIconPath },
      { name: 'cloud', path: this.cloudIconPath },
      { name: 'arrow-forward', path: this.arrowForwardIconPath },
      { name: 'menu', path: this.menuIconPath } // Register menu icon
    ];
    icons.forEach(icon => {
      this.iconRegistry.addSvgIcon(
        icon.name,
        this.sanitizer.bypassSecurityTrustResourceUrl(icon.path)
      );
    });
    console.log('LandingPageComponent: Registered SVG icons including menu.');
  }

  private checkScrollPosition(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.lastScrollY = window.scrollY;
      this.handleScroll(); // Initial check
    }
  }

  private handleScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      const currentScrollY = window.scrollY;
      if (currentScrollY === 0) {
        this.isVisible = true;
      } else if (currentScrollY > this.lastScrollY) {
        this.isVisible = false; // Scrolling down
      } else {
        this.isVisible = true; // Scrolling up
      }
      this.lastScrollY = currentScrollY < 0 ? 0 : currentScrollY;
    }
  }

  // REMOVED: checkScreenSize() and onWindowResize() as LayoutService handles this.

  toggleSidenav(): void {
    if (this.sidenav) {
      this.sidenav.toggle();
    }
  }

  closeSidenav(): void {
    if (this.sidenav && this.sidenav.opened) {
      this.sidenav.close();
    }
  }

  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
  }

  navigateToLogin(): void {
    console.log('LandingPageComponent: Navigating to login page...');
    this.closeSidenav(); // Close sidenav before navigating
    this.router.navigate(['/login']);
  }

  // Add this method for navigation to signup
  navigateToSignup(): void {
    this.router.navigate(['/login'], { queryParams: { register: 'true' } });
  }

  scrollToSection(sectionId: string): void {
    console.log(`LandingPageComponent: Attempting to scroll to section: ${sectionId}`);
    this.closeSidenav(); // Close sidenav before scrolling

    if (sectionId === 'login') {
      this.navigateToLogin();
      return;
    }

    if (isPlatformBrowser(this.platformId)) {
      const element = document.getElementById(sectionId);
      if (element) {
        console.log(`LandingPageComponent: Scrolling smoothly to physical section: #${sectionId}`);
        element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
      } else {
        console.warn(`LandingPageComponent: Element with ID '${sectionId}' not found for scrolling.`);
        // Fallback or alternative navigation if element not found, e.g. for 'get-started'
        if (sectionId === 'get-started') {
          // Potentially navigate to a route or scroll to a known fallback element
          console.log("LandingPageComponent: 'get-started' section not found, consider alternative action.");
        }
      }
    } else {
      console.log(`LandingPageComponent: Skipping scroll on server for section: ${sectionId}`);
    }
  }

    open = false;

  logo = {
    src: 'landing/logo.svg', // Replace with your logo path or use the SVG inline
    alt: 'Marketify Logo',
    text: 'Marketify',
  };

  menuItems = [
    { label: 'Home', link: '#' },
    { label: 'Features', link: '#' },
    { label: 'Developers', link: '#' },
    { label: 'Pricing', link: '#' },
    { label: 'About', link: '#' },
  ];

  buttons = [
    {
      label: 'Login',
      link: '#',
      style: 'ghost',
      icon: null,
    },
    {
      label: 'Get Started',
      link: '#',
      style: 'primary',
      icon: 'arrow',
    },
  ];
  // Hero section logic
  heroHeadline = {
    main: 'Fetch Company',
    main1: 'Brand Data Instantly with',
    highlight: 'Marketify',
    waveIcon: true
  };
  heroSubheadline = 'Access logos, brand colors, fonts and social links by simply entering a domain name';
  ctas = [
    { label: 'Try Marketify now', style: 'primary', icon: 'arrow' },
    { label: 'View Docs', style: 'secondary', icon: 'arrow' }
  ];
  rating = {
    label: 'Excellent',
    value: 4.7,
    count: 194
  };
  // Company logos orbit section logic
  orbitHeadline = 'Trusted by Forward – Thinking Teams';
  orbitSubheadline = 'Polygon absolutely works great with tools in your other existing platform.';
  orbitLogos = [
    { src: '/company/Animalbiome.svg', alt: 'Company 1' },
    { src: '/company/nutanix.svg', alt: 'Company 2' },
    { src: '/company/paloalto.svg', alt: 'Company 3' },
    { src: '/company/xAmplify.svg', alt: 'Company 4' },
    { src: '/company/people.png', alt: 'Company 5' }
  ];
  // Company logos row section logic (after hero)
  companyLogos = [
    { src: '/company/Item-1.svg', alt: 'Company 1' },
    { src: '/company/Item-2.svg', alt: 'Company 2' },
    { src: '/company/Item-3.svg', alt: 'Company 3' },
    { src: '/company/Item-4.svg', alt: 'Company 4' },
    { src: '/company/Item.svg', alt: 'Company 5' }
  ];
  // Core capabilities section logic
  coreHeadline = "Discover Marketify’s Core Capabilities";
  coreSubheadline = "Everything you need to build powerful brand integrations";
  cards = [
    {
      icon: 'bi bi-brightness-high',
      title: 'Logos and Brand Assets',
      button: 'Learn More'
    },
    {
      icon: 'bi bi-display',
      title: 'Brand colors & Fonts',
      button: 'Learn More'
    },
    {
      icon: 'bi bi-lightning-charge',
      title: 'Real time API',
      button: 'Learn More'
    },
    {
      icon: 'bi bi-arrow-repeat',
      title: 'Always Update',
      button: 'Learn More'
    }
  ];
  // All sections logic
  allSections = [
    {
      title: 'For Designers',
      description: 'Instantly access brand assets, color palettes, and typography to streamline your creative workflow. Marketify makes it easy to maintain brand consistency and save hours on manual asset collection.',
      image: 'landing/Section_1.png',
      cards: [
        { icon: 'bi bi-journal-bookmark', title: 'Brand Guidelines', subtitle: 'Official brand rules at your fingertips' },
        { icon: 'bi bi-palette', title: 'Color Palettes', subtitle: 'Accurate brand color codes instantly' },
        { icon: 'bi bi-type', title: 'Typography', subtitle: 'Discover and use brand fonts' },
        { icon: 'bi bi-easel', title: 'Design Assets', subtitle: 'Download logos, icons, and more' }
      ]
    },
    {
      title: 'For Developers',
      description: 'Integrate real-time brand data into your apps and websites with our robust API and SDKs. Marketify empowers you to automate branding, onboarding, and more.',
      cards: [
        { icon: 'bi bi-plug', title: 'REST API', subtitle: 'Fetch brand assets programmatically' },
        { icon: 'bi bi-boxes', title: 'SDKs Available', subtitle: 'Quick integration in your language' },
        { icon: 'bi bi-code-slash', title: 'Code Examples', subtitle: 'Ready-to-use code snippets' },
        { icon: 'bi bi-graph-up', title: 'Real-Time Data', subtitle: 'Always up-to-date brand info' }
      ]
    },
    {
      title: 'For Marketers',
      description: 'Ensure your campaigns and content always use the latest brand assets. Marketify helps you maintain consistency and credibility across all channels.',
      image: 'landing/Section_3.png',
      cards: [
        { icon: 'bi bi-geo-alt', title: 'Social Links', subtitle: 'Find official social profiles' },
        { icon: 'bi bi-bell', title: 'Brand Monitoring', subtitle: 'Get notified on asset changes' },
        { icon: 'bi bi-collection', title: 'Asset Library', subtitle: 'Centralized brand visuals' },
        { icon: 'bi bi-megaphone', title: 'Campaign Ready', subtitle: 'Assets for every platform' }
      ]
    }
  ];
  // Supercharge workflow section logic
  superchargeHeadline = 'Ready to Supercharge Your Workflow';
  superchargeSubheadline = 'Start fetching brand data in minutes with Marketify.';
  superchargeCta = 'Get Started';
  // Pricing section logic
  pricingHeadline = 'Expand your options with a subscription';
  pricingSubheadline = 'Graphs displaying your performance for metrics like follower evolution, average rate per post and reach and impressions to give you the insights.';
  pricingPlans = [
    {
      name: 'Base',
      price: '$0',
      features: [
        'Access to editing all blocks',
        'Editing blocks together',
        'Access to all premium icons',
        'A dedicated domain',
        'Ability to integrate with CMS'
      ],
      cta: 'Try for Free',
      highlight: false
    },
    {
      name: 'Standard',
      price: '$300',
      features: [
        'Access to editing all blocks',
        'Editing blocks together',
        'Access to all premium icons',
        'A dedicated domain',
        'Ability to integrate with CMS'
      ],
      cta: 'Start 14 Days Free Trial',
      highlight: true
    },
    {
      name: 'Unlimited',
      price: '$600',
      features: [
        'Access to editing all blocks',
        'Editing blocks together',
        'Access to all premium icons',
        'A dedicated domain',
        'Ability to integrate with CMS'
      ],
      cta: 'Start 14 Days Free Trial',
      highlight: false
    }
  ];
  // All merged logic from dashboard components will go here
  isDarkTheme = false;

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    if (this.isDarkTheme) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  goToSearch() {
    this.router.navigate(['/search']);
  }

  testimonials = [
    {
      avatar: 'landing/user.jfif',
      name: 'User',
      role: 'Customer',
      text: 'This is a testimonial from user.jfif.'
    },
    {
      name: 'Mila McSabbu',
      role: 'Freelance Designer',
      avatar: 'landing/user.jfif',
      text: 'We test and compare the best project management software for collaborating with a team, hitting deadlines.'
    },
    {
      name: 'Mila McSabbu',
      role: 'Freelance Designer',
      avatar: 'landing/user.jfif',
      text: 'We test and compare the best project management software for collaborating with a team, hitting deadlines.'
    },
    {
      name: 'Mila McSabbu',
      role: 'Freelance Designer',
      avatar: 'landing/user.jfif',
      text: 'We test and compare the best project management software for collaborating with a team, hitting deadlines.'
    },
    {
      name: 'Mila McSabbu',
      role: 'Freelance Designer',
      avatar: 'landing/user.jfif',
      text: 'We test and compare the best project management software for collaborating with a team, hitting deadlines.'
    },
    {
      name: 'Mila McSabbu',
      role: 'Freelance Designer',
      avatar: 'landing/user.jfif',
      text: 'We test and compare the best project management software for collaborating with a team, hitting deadlines.'
    },
    {
      name: 'Mila McSabbu',
      role: 'Freelance Designer',
      avatar: 'landing/user.jfif',
      text: 'We test and compare the best project management software for collaborating with a team, hitting deadlines.'
    },
    {
      name: 'Mila McSabbu',
      role: 'Freelance Designer',
      avatar: 'landing/user.jfif',
      text: 'We test and compare the best project management software for collaborating with a team, hitting deadlines.'
    },
    {
      name: 'Mila McSabbu',
      role: 'Freelance Designer',
      avatar: 'landing/user.jfif',
      text: 'We test and compare the best project management software for collaborating with a team, hitting deadlines.'
    }
  ];
}