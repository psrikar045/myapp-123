import { Component, HostListener, OnDestroy, OnInit, inject, PLATFORM_ID, Inject, ViewChild } from '@angular/core';
import { isPlatformBrowser, CommonModule, NgIf, NgFor, NgSwitch } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject, Subscription, fromEvent, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { LayoutService } from '../../../core/services/layout.service'; // Import LayoutService
import { Router } from '@angular/router';
import { ToolbarService } from '../../../shared/services/toolbar.service';
import { AppThemeService } from '../../../core/services/app-theme.service';
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
    NgIf, NgFor,    // Add MatListModule for nav items in sidenav
    FormsModule // <-- Add FormsModule for ngModel
  ],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit, OnDestroy {
  // Responsive data
  features = [
    {
      icon: 'bi bi-lightning-charge',
      title: 'Lightning Fast',
      description: 'Learn More'
    },
    {
      icon: 'bi bi-shield-check',
      title: 'Always Accurate',
      description: 'Learn More'
    },
    {
      icon: 'bi bi-code-slash',
      title: 'Developer Friendly',
      description: 'Learn More'
    },
    {
      icon: 'bi bi-palette',
      title: 'Rich Brand Data',
      description: 'Learn More'
    },
  ];

  stats = [
    { number: '10K+', label: 'Brands Available' },
    { number: '99.9%', label: 'Uptime SLA' },
    { number: '50M+', label: 'API Calls/Month' },
    { number: '1000+', label: 'Happy Developers' }
  ];

  // Event handlers for logo hover effects
  onLogoHover(event: Event, isHover: boolean): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.opacity = isHover ? '1' : '0.7';
    }
  }

  onOrbitLogoHover(event: Event, isHover: boolean): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.opacity = isHover ? '1' : '0.8';
      target.style.transform = isHover ? 'scale(1.1)' : 'scale(1)';
    }
  }
  @ViewChild('sidenav') sidenav!: MatSidenav;

  isDarkMode: boolean = false;
  isVisible: boolean = true;
  private lastScrollY: number = 0;

  // Replace isMobileView with Observable from LayoutService
  isMobile$: Observable<boolean>;

  private destroy$ = new Subject<void>();
  private themeSubscription!: Subscription;
  private scrollSubscription!: Subscription;

  private logoPath = 'assets/images/logo.svg'; // Ensure correct path
  private sunIconPath = 'assets/icons/sun.svg'; // Ensure correct path
  private cloudIconPath = 'assets/icons/cloud.svg'; // Ensure correct path
  private arrowForwardIconPath = 'assets/icons/arrow_forward.svg'; // Ensure correct path
  private menuIconPath = 'assets/icons/menu.svg'; // Ensure correct path for menu icon

  private appThemeService = inject(AppThemeService);
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
    // Set layout configuration for landing page
    this.layoutService.setLayoutConfig({
      showHeader: true,
      showFooter: true,
      containerClass: 'container-fluid',
      headerType: 'default'
    });
    
    // Don't force toolbar state - let header component handle it based on auth status

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
    // this.themeService.toggleDarkMode();
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
    src: 'assets/landing/logo.svg', // Replace with your logo path or use the SVG inline
    alt: 'RIVO9 Logo',
    text: 'RIVO9',
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
    main: "Know any company's",
    main1: 'Brand reputation instantly',
    suffix:'With ',
    highlight: 'RIVO9',
    waveIcon: true
  };
  heroSubheadline = 'Access logos, brand colors, fonts and social links by simply entering a domain name';
  ctas = [
    { label: 'Try RIVO9 now', style: 'primary', icon: 'arrow' },
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
    { src: 'assets/company/Animalbiome.svg', alt: 'Company 1' },
    { src: 'assets/company/nutanix.svg', alt: 'Company 2' },
    { src: 'assets/company/paloalto.svg', alt: 'Company 3' },
    { src: 'assets/company/xAmplify.svg', alt: 'Company 4' },
    { src: 'assets/company/people.png', alt: 'Company 5' }
  ];
  // Company logos row section logic (after hero)
  companyLogos = [
    { src: 'assets/company/Item-1.svg', alt: 'Company 1' },
    { src: 'assets/company/Item-2.svg', alt: 'Company 2' },
    { src: 'assets/company/Item-3.svg', alt: 'Company 3' },
    { src: 'assets/company/Item-4.svg', alt: 'Company 4' },
    { src: 'assets/company/Item.svg', alt: 'Company 5' }
  ];
  // Core capabilities section logic
  coreHeadline = "Discover RIVO9’s Core Capabilities";
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
      description: 'Instantly access brand assets, color palettes, and typography to streamline your creative workflow. RIVO9 makes it easy to maintain brand consistency and save hours on manual asset collection.',
      image: 'assets/landing/Section_1.png',
      cards: [
        { icon: 'bi bi-journal-bookmark', title: 'Brand Guidelines', subtitle: 'Official brand rules at your fingertips' },
        { icon: 'bi bi-palette', title: 'Color Palettes', subtitle: 'Accurate brand color codes instantly' },
        { icon: 'bi bi-type', title: 'Typography', subtitle: 'Discover and use brand fonts' },
        { icon: 'bi bi-easel', title: 'Design Assets', subtitle: 'Download logos, icons, and more' }
      ]
    },
    {
      title: 'For Developers',
      description: 'Integrate real-time brand data into your apps and websites with our robust API and SDKs. RIVO9 empowers you to automate branding, onboarding, and more.',
      cards: [
        { icon: 'bi bi-plug', title: 'REST API', subtitle: 'Fetch brand assets programmatically' },
        { icon: 'bi bi-boxes', title: 'SDKs Available', subtitle: 'Quick integration in your language' },
        { icon: 'bi bi-code-slash', title: 'Code Examples', subtitle: 'Ready-to-use code snippets' },
        { icon: 'bi bi-graph-up', title: 'Real-Time Data', subtitle: 'Always up-to-date brand info' }
      ]
    },
    {
      title: 'For Marketers',
      description: 'Ensure your campaigns and content always use the latest brand assets. RIVO9 helps you maintain consistency and credibility across all channels.',
      image: 'assets/landing/Section_3.png',
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
  superchargeSubheadline = 'Start fetching brand data in minutes with RIVO9.';
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
      avatar: 'assets/landing/user.jfif',
      name: 'User',
      role: 'Customer',
      text: 'This is a testimonial from user.jfif.'
    },
    {
      name: 'Mila McSabbu',
      role: 'Freelance Designer',
      avatar: 'assets/landing/user.jfif',
      text: 'We test and compare the best project management software for collaborating with a team, hitting deadlines.'
    },
    {
      name: 'Mila McSabbu',
      role: 'Freelance Designer',
      avatar: 'assets/landing/user.jfif',
      text: 'We test and compare the best project management software for collaborating with a team, hitting deadlines.'
    },
    {
      name: 'Mila McSabbu',
      role: 'Freelance Designer',
      avatar: 'assets/landing/user.jfif',
      text: 'We test and compare the best project management software for collaborating with a team, hitting deadlines.'
    },
    {
      name: 'Mila McSabbu',
      role: 'Freelance Designer',
      avatar: 'assets/landing/user.jfif',
      text: 'We test and compare the best project management software for collaborating with a team, hitting deadlines.'
    },
    {
      name: 'Mila McSabbu',
      role: 'Freelance Designer',
      avatar: 'assets/landing/user.jfif',
      text: 'We test and compare the best project management software for collaborating with a team, hitting deadlines.'
    },
    {
      name: 'Mila McSabbu',
      role: 'Freelance Designer',
      avatar: 'assets/landing/user.jfif',
      text: 'We test and compare the best project management software for collaborating with a team, hitting deadlines.'
    },
    {
      name: 'Mila McSabbu',
      role: 'Freelance Designer',
      avatar: 'assets/landing/user.jfif',
      text: 'We test and compare the best project management software for collaborating with a team, hitting deadlines.'
    },
    {
      name: 'Mila McSabbu',
      role: 'Freelance Designer',
      avatar: 'assets/landing/user.jfif',
      text: 'We test and compare the best project management software for collaborating with a team, hitting deadlines.'
    }
  ];
}