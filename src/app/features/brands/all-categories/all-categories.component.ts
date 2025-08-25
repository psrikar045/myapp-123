import { Component, OnInit, OnDestroy, inject, PLATFORM_ID,ChangeDetectorRef, ElementRef, ViewChild, AfterViewInit  } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';


import { AuthService } from '../../../core/services/auth.service';
import { BrandDataResponse, BrandSearchFilters, BrandDataSummary } from '../../../shared/models/api.models';
import { UtilService } from '../../../shared/services/util.service';

interface Category {
  id?: number;
  label: string;
}

interface SubCategory {
  id: number;
  name: string;
}

@Component({
  selector: 'app-all-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './all-categories.component.html',
  styleUrl: './all-categories.component.scss'
})
export class AllCategoriesComponent implements OnInit, OnDestroy, AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  
  // Make Math available in template
  Math = Math;
  
  categories:any = [];
  selectedCategory = 'All';
  
  expandedCategory: string = 'All';
  selectedSubCategory: string = '';

  subCategoryMap: { [key: string]: any[] } = {};

  // Brand data from API
  brandData: BrandDataResponse[] = [];
  brandStatistics: any = {};
  isLoadingBrands = false;
  brandSearchFilters: BrandSearchFilters = {};
  
  // Pagination properties
  currentPage = 1;
  pageSize = 0; // Dynamic - calculated based on container height
  totalElements = 0;
  totalPages = 0;
  isLastPage = false;
  isFirstPage = true;
// Dynamic grid measurement
  @ViewChild('gridContainer') gridContainerRef?: ElementRef<HTMLElement>;
  @ViewChild('brandCard') brandCardRef?: ElementRef<HTMLElement>;
  @ViewChild('paginationWrapper') paginationWrapperRef?: ElementRef<HTMLElement>;
  private resizeObserver?: ResizeObserver;
  private lastComputedPageSize?: number;

  // Mobile sidebar functionality
  isMobileSidebarOpen = false;
  isMobile = false;
  // Properties for displaying filtered data (updated only on explicit search)
  displayedBrands: any[] = [];
  pagedDisplayedBrands: any[] = [];
  // Static brand data for fallback/demo purposes
  allBrands:any = [
    // Education
    { name: 'Google Drive', user: 'theshaaer', color: 'linear-gradient(135deg, #FFF6B7 0%, #F6416C 100%)', category: 'Education', subCategory: 'Resume' },
    { name: 'Github', user: 'theshaaer', color: 'linear-gradient(135deg, #232526 0%, #414345 100%)', category: 'Education', subCategory: 'Science' },
    { name: 'Behance', user: 'theshaaer', color: 'linear-gradient(135deg, #00C6FB 0%, #005BEA 100%)', category: 'Education', subCategory: 'Science' },
    { name: 'Instagram', user: 'theshaaer', color: 'linear-gradient(135deg, #F6416C 0%, #FFB199 100%)', category: 'Education', subCategory: 'Social media' },
    { name: 'Layers', user: 'theshaaer', color: 'linear-gradient(135deg, #232526 0%, #414345 100%)', category: 'Education', subCategory: 'Physics' },
    { name: 'Email', user: 'theshaaer', color: 'linear-gradient(135deg, #232526 0%, #005BEA 100%)', category: 'Education', subCategory: 'Math’s' },
    { name: 'Reddit', user: 'theshaaer', color: 'linear-gradient(135deg, #F6416C 0%, #FFB199 100%)', category: 'Education', subCategory: 'Social media' },
    { name: 'Discord', user: 'theshaaer', color: 'linear-gradient(135deg, #00C6FB 0%, #005BEA 100%)', category: 'Education', subCategory: 'Social media' },
    { name: 'Facebook', user: 'theshaaer', color: 'linear-gradient(135deg, #00C6FB 0%, #005BEA 100%)', category: 'Education', subCategory: 'Social media' },
    { name: 'Medium', user: 'theshaaer', color: 'linear-gradient(135deg, #e0e0e0 0%, #ffffff 100%)', category: 'Education', subCategory: 'Science' },
    { name: 'Twitter', user: 'theshaaer', color: 'linear-gradient(135deg, #232526 0%, #414345 100%)', category: 'Education', subCategory: 'Social media' },
    { name: 'Figma', user: 'theshaaer', color: 'linear-gradient(135deg, #232526 0%, #414345 100%)', category: 'Education', subCategory: 'Science' },
    // Entertainment
    { name: 'Netflix', user: 'netflix', color: 'linear-gradient(135deg, #e50914 0%, #221f1f 100%)', category: 'Entertainment', subCategory: 'Movie tickets' },
    { name: 'Spotify', user: 'spotify', color: 'linear-gradient(135deg, #1db954 0%, #191414 100%)', category: 'Entertainment', subCategory: 'Dance studios' },
    { name: 'YouTube', user: 'youtube', color: 'linear-gradient(135deg, #ff0000 0%, #282828 100%)', category: 'Entertainment', subCategory: 'Photograph' },
    // Games
    { name: 'Steam', user: 'steam', color: 'linear-gradient(135deg, #00c6fb 0%, #005bea 100%)', category: 'Games', subCategory: 'Video Games' },
    { name: 'Epic Games', user: 'epicgames', color: 'linear-gradient(135deg, #232526 0%, #414345 100%)', category: 'Games', subCategory: 'Board Games' },
    { name: 'Twitch', user: 'twitch', color: 'linear-gradient(135deg, #6441a5 0%, #2a0845 100%)', category: 'Games', subCategory: 'Mobile Games' },
    // Music & Video
    { name: 'Apple Music', user: 'applemusic', color: 'linear-gradient(135deg, #f3e6ff 0%, #ffb199 100%)', category: 'Music & Video', subCategory: 'Music' },
    { name: 'SoundCloud', user: 'soundcloud', color: 'linear-gradient(135deg, #ff5500 0%, #ffb199 100%)', category: 'Music & Video', subCategory: 'Music' },
    // Fitness
    { name: 'Fitbit', user: 'fitbit', color: 'linear-gradient(135deg, #00c6fb 0%, #005bea 100%)', category: 'Fitness', subCategory: 'Gyms' },
    { name: 'Nike Training', user: 'niketraining', color: 'linear-gradient(135deg, #232526 0%, #414345 100%)', category: 'Fitness', subCategory: 'Gyms' },
    // Hospitals
    { name: 'Mayo Clinic', user: 'mayoclinic', color: 'linear-gradient(135deg, #00c6fb 0%, #005bea 100%)', category: 'Hospitals', subCategory: 'General' },
    { name: 'Cleveland Clinic', user: 'clevelandclinic', color: 'linear-gradient(135deg, #232526 0%, #414345 100%)', category: 'Hospitals', subCategory: 'General' },
    // Add more as needed for other categories/subcategories
  ];

  searchTerm = '';
  filteredCategories:any = this.categories;
  
  // Enhanced search functionality
  private searchResults: any[] = [];
  private isSearchActive = false;
  private hasInitialLoad = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private utilService: UtilService // Inject UtilService
  ) {
    
    // Initialize with default categories immediately
    this.setDefaultCategories();
    
    // Restore previous state if returning from search-view
    this.restorePreviousState();
  }
private windowResizeHandler = () => {
    this.checkScreenSize();
    this.scheduleRecalculatePageSize();
    this.syncContainerHeights();
  };

  private syncContainerHeights() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    setTimeout(() => {
      const sidebar = document.querySelector('.categories-sidebar') as HTMLElement;
      const mainContent = document.querySelector('.categories-main-layout-right') as HTMLElement;
      
      if (sidebar && mainContent && !this.isMobile) {
        const sidebarHeight = sidebar.offsetHeight;
        const viewportHeight = window.innerHeight;
        const headerHeight = 200; // Approximate header height
        const minHeight = Math.max(sidebarHeight, viewportHeight - headerHeight);
        
        mainContent.style.minHeight = `${minHeight}px`;
        mainContent.style.height = 'auto';
      }
    }, 100);
  }
  ngOnInit() {
    this.checkScreenSize();
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('resize', this.windowResizeHandler);
    }
    
    // Load initial data only once
    if (!this.hasInitialLoad) {
      this.hasInitialLoad = true;
      this.getAllCategories();
      // Delay initial load until page size is calculated
      setTimeout(() => {
        if (this.pageSize > 0) {
          this.loadBrandData(this.currentPage - 1);
        }
      }, 300);
    }
    
    // Subscribe to query parameters
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        // Convert route-friendly category name back to display name
        const categoryParam = params['category'];
        const categoryMap: { [key: string]: string } = {
          'computers-electronics': 'Computers, Electronics and Technology',
          'finance': 'Finance',
          'vehicles': 'Vehicles',
          'e-commerce': 'E-commerce and Shopping',
          'news-media': 'News and Media',
          'luxury': 'Luxury',
          'arts-entertainment': 'Arts and Entertainment',
          'food-drink': 'Food and Drink',
          'travel-tourism': 'Travel and Tourism',
          'business-services': 'Business and Consumer Services',
          'lifestyle': 'Lifestyle'
        };

        const categoryName = categoryMap[categoryParam] || categoryParam;
        
        // Find the category in our list
        const foundCategory = this.categories.find((cat: Category) => 
          cat.label.toLowerCase() === categoryName.toLowerCase()
        );

        if (foundCategory) {
          this.selectedCategory = foundCategory.label;
          this.expandedCategory = foundCategory.label;
          this.selectedSubCategory = '';
          this.searchTerm = '';
          this.filteredCategories = this.categories;
        } else {
          // If no category in URL, reset to default state
          this.selectedCategory = 'All';
          this.expandedCategory = 'All';
          this.selectedSubCategory = '';
        }
      }
    });
  }
ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    // Observe main container for size changes
    const mainContainer = document.querySelector('.categories-main-layout-right');
    if (mainContainer && 'ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => {
        this.scheduleRecalculatePageSize();
        this.syncContainerHeights();
      });
      this.resizeObserver.observe(mainContainer);
    }
    
    // Initial calculations after view init with shorter delay
    setTimeout(() => {
      this.initializeDynamicPageSize();
      this.syncContainerHeights();
    }, 100);
  }
  
  private initializeDynamicPageSize(): void {
    const newPageSize = this.calculateDynamicPageSize();
    if (newPageSize !== this.pageSize) {
      this.pageSize = newPageSize;
      this.lastComputedPageSize = newPageSize;
      if (this.hasInitialLoad) {
        this.loadBrandData(0);
      }
    }
  }
  // ngOnDestroy() {
  //   if (isPlatformBrowser(this.platformId)) {
  //     window.removeEventListener('resize', () => this.checkScreenSize());
  //   }
  // }
  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.windowResizeHandler);
    }
    if (this.resizeObserver && this.gridContainerRef?.nativeElement) {
      this.resizeObserver.unobserve(this.gridContainerRef.nativeElement);
      this.resizeObserver.disconnect();
    }
  }

  private recalcDebounce?: number | null;
  private scheduleRecalculatePageSize() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.recalcDebounce) {
      window.clearTimeout(this.recalcDebounce as any);
    }
    this.recalcDebounce = window.setTimeout(() => {
      this.recalculatePageSizeAndReloadIfNeeded();
    }, 100);
  }

  private calculateDynamicPageSize(): number {
    if (!isPlatformBrowser(this.platformId)) return 8;
    
    const width = window.innerWidth;
    
    // Use fixed smaller page sizes to prevent excessive scrolling
    if (width <= 576) {
      return 6; // 3 rows of 2 columns for mobile
    }
    if (width <= 768) {
      return 8; // 2 rows of 4 columns for small tablet
    }
    if (width <= 992) {
      return 9; // 3 rows of 3 columns for tablet
    }
    
    // Desktop - limit to prevent excessive scrolling
    return 12; // 3 rows of 4 columns for desktop
  }
  
  private getColumnsForScreenSize(): number {
    if (!isPlatformBrowser(this.platformId)) return 4;
    
    const width = window.innerWidth;
    if (width <= 480) return 2;
    if (width <= 768) return 4;
    if (width <= 992) return 3;
    return 4;
  }
  
  private getCardHeightForScreenSize(): number {
    if (!isPlatformBrowser(this.platformId)) return 130;
    
    const width = window.innerWidth;
    if (width <= 480) return 110;
    if (width <= 768) return 120;
    return 130;
  }
  
  private getCardGapForScreenSize(): number {
    if (!isPlatformBrowser(this.platformId)) return 28;
    
    const width = window.innerWidth;
    if (width <= 480) return 16;
    if (width <= 768) return 20;
    return 28;
  }

  private recalculatePageSize(): number {
    return this.calculateDynamicPageSize();
  }

  private recalculatePageSizeAndReloadIfNeeded() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const newSize = this.recalculatePageSize();
    if (this.lastComputedPageSize === newSize || newSize === 0) return;
    
    const oldFirstItemIndex = (this.currentPage - 1) * this.pageSize;
    this.pageSize = newSize;
    this.lastComputedPageSize = newSize;
    this.totalPages = Math.max(1, Math.ceil(this.totalElements / this.pageSize));
    
    // Keep the first visible index stable
    const newPage = Math.floor(oldFirstItemIndex / this.pageSize) + 1;
    if (newPage !== this.currentPage) {
      this.currentPage = Math.min(Math.max(1, newPage), this.totalPages);
    }
    
    // Only reload if initialized and not loading
    if (this.hasInitialLoad && !this.isLoadingBrands && this.pageSize > 0) {
      this.loadBrandData(this.currentPage - 1);
    }
  }

  /**
   * Clear stored navigation state
   */
  clearStoredState() {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem('brandsCurrentPage');
      sessionStorage.removeItem('brandsSelectedCategory');
      sessionStorage.removeItem('brandsSelectedSubCategory');
      sessionStorage.removeItem('brandsSearchTerm');
    }
  }

  // Mobile sidebar methods
  checkScreenSize() {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth < 992; // Bootstrap md and below
      if (!this.isMobile) {
        this.isMobileSidebarOpen = false;
      }
    }
  }

  toggleMobileSidebar() {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar() {
    this.isMobileSidebarOpen = false;
  }

  /**
   * Restore previous state when returning from search-view
   */
  restorePreviousState() {
    if (isPlatformBrowser(this.platformId)) {
      const savedPage = sessionStorage.getItem('brandsCurrentPage');
      const savedCategory = sessionStorage.getItem('brandsSelectedCategory');
      const savedSubCategory = sessionStorage.getItem('brandsSelectedSubCategory');
      const savedSearchTerm = sessionStorage.getItem('brandsSearchTerm');
      
      if (savedPage) {
        this.currentPage = parseInt(savedPage, 10);
        console.log('Restored page:', this.currentPage);
      }
      
      if (savedCategory) {
        this.selectedCategory = savedCategory;
        this.expandedCategory = savedCategory;
        console.log('Restored category:', this.selectedCategory);
      }
      
      if (savedSubCategory) {
        this.selectedSubCategory = savedSubCategory;
        console.log('Restored subcategory:', this.selectedSubCategory);
      }
      
      if (savedSearchTerm) {
        this.searchTerm = savedSearchTerm;
        this.isSearchActive = !!(savedSearchTerm && savedSearchTerm.trim().length > 0);
        console.log('Restored search term:', this.searchTerm);
      }
    }
  }

setDefaultCategories() {
    // Set default categories to match footer categories
    this.categories = [
      { label: 'All' },
      { label: 'Computers Electronics' },
      { label: 'Finance' },
      { label: 'Vehicles' },
      { label: 'E-Commerce' },
      { label: 'News and Media' },
      { label: 'Luxury' },
      { label: 'Arts and Entertainment' },
      { label: 'Food and Drink' },
      { label: 'Travel and Tourism' },
      { label: 'Business and Services' },
      { label: 'Lifestyle' }
    ];
    
    // Set default subcategories
    this.subCategoryMap = {
      'Computers Electronics': [
        { id: 1, name: 'Hardware' },
        { id: 2, name: 'Software' },
        { id: 3, name: 'Mobile Devices' },
        { id: 4, name: 'Networking' }
      ],
      'Finance': [
        { id: 5, name: 'Banking' },
        { id: 6, name: 'Investment' },
        { id: 7, name: 'Insurance' },
        { id: 8, name: 'Fintech' }
      ],
      'Vehicles': [
        { id: 9, name: 'Cars' },
        { id: 10, name: 'Motorcycles' },
        { id: 11, name: 'Commercial Vehicles' },
        { id: 12, name: 'Auto Parts' }
      ],
      'E-Commerce': [
        { id: 13, name: 'Retail' },
        { id: 14, name: 'Marketplace' },
        { id: 15, name: 'Digital Products' },
        { id: 16, name: 'Subscription Services' }
      ],
      'News and Media': [
        { id: 17, name: 'News Outlets' },
        { id: 18, name: 'Digital Media' },
        { id: 19, name: 'Broadcasting' },
        { id: 20, name: 'Publishing' }
      ],
      'Luxury': [
        { id: 21, name: 'Fashion' },
        { id: 22, name: 'Jewelry' },
        { id: 23, name: 'Watches' },
        { id: 24, name: 'Premium Services' }
      ],
      'Arts and Entertainment': [
        { id: 25, name: 'Music' },
        { id: 26, name: 'Movies' },
        { id: 27, name: 'Gaming' },
        { id: 28, name: 'Live Events' }
      ],
      'Food and Drink': [
        { id: 29, name: 'Restaurants' },
        { id: 30, name: 'Beverages' },
        { id: 31, name: 'Food Delivery' },
        { id: 32, name: 'Catering' }
      ],
      'Travel and Tourism': [
        { id: 33, name: 'Hotels' },
        { id: 34, name: 'Airlines' },
        { id: 35, name: 'Travel Services' },
        { id: 36, name: 'Tourism Activities' }
      ],
      'Business and Services': [
        { id: 37, name: 'Consulting' },
        { id: 38, name: 'Professional Services' },
        { id: 39, name: 'B2B Services' },
        { id: 40, name: 'Office Services' }
      ],
      'Lifestyle': [
        { id: 41, name: 'Health & Wellness' },
        { id: 42, name: 'Sports' },
        { id: 43, name: 'Personal Care' },
        { id: 44, name: 'Home & Living' }
      ]
    };
    
    this.filteredCategories = this.categories;
  }

  private categoriesLoaded = false;

  getAllCategories() {
    // Skip API calls during SSR/prerendering or if already loaded
    if (!isPlatformBrowser(this.platformId) || this.categoriesLoaded) {
      return;
    }
    
    this.categoriesLoaded = true;
    
    this.authService.categoryFetch().subscribe({
      next : (response: any) => {
        console.log('Categories API response:', response);
        if (response && response.categories) {
          // Clear existing categories and rebuild from API
          this.categories = [{ label: 'All' }];
          this.subCategoryMap = {};
          
          response.categories.forEach((category: any) => {
            // Add to categories array
            this.categories.push({ id: category.id, label: category.name });

            // Populate subCategoryMap
            if (category.subCategories && category.subCategories.length > 0) {
              this.subCategoryMap[category.name] = category.subCategories.map((subCat: any) => ({ id: subCat.id, name: subCat.name }));
            }
          });
          this.filteredCategories = this.categories;
          console.log('Categories loaded from API:', this.categories);
        }
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
        console.log('Using default categories due to API error');
        this.categoriesLoaded = false; // Allow retry on error
      }
    });
  }

  get tags() {
    if (this.selectedCategory === 'All') return [];
    return this.subCategoryMap[this.selectedCategory] || [];
  }

  getDisplayTags(): string[] {
    if (!this.tags.length) return [];
    if (this.tags.length >= 10) return this.tags;
    // Repeat or generate placeholder subcategories to reach at least 10
    const result = [...this.tags];
    let i = 1;
    while (result.length < 10) {
      result.push(`${this.tags[result.length % this.tags.length]} ${i}`);
      i++;
    }
    return result;
  }

  // Filter brands by selected category and subcategory
  get brands() {
    if (this.selectedCategory === 'All') {
      return this.allBrands;
    }
    let filtered = this.allBrands.filter((b:any)=> b.category === this.selectedCategory);
    if (this.selectedSubCategory) {
      filtered = filtered.filter((b:any) => b.subCategory === this.selectedSubCategory);
    }
    return filtered;
  }

  // Enhanced filtered brands with priority-based search
  get filteredBrands() {
    const baseBrands = this.brands;
    
    if (!this.searchTerm || this.searchTerm.trim().length === 0) {
      return baseBrands;
    }

    const searchTermLower = this.searchTerm.trim().toLowerCase();
    
    // Priority-based filtering
    const exactMatches: any[] = [];
    const partialMatches: any[] = [];
    const descriptionMatches: any[] = [];
    
    baseBrands.forEach((brand: any) => {
      const brandName = (brand.name || '').toLowerCase();
      const brandDescription = (brand.description || '').toLowerCase();
      const brandWebsite = (brand.website || '').toLowerCase();
      
      // Priority 1: Exact name match
      if (brandName === searchTermLower) {
        exactMatches.push(brand);
      }
      // Priority 2: Partial name match (contains search term)
      else if (brandName.includes(searchTermLower)) {
        partialMatches.push(brand);
      }
      // Priority 3: Description or website match (fallback)
      else if (brandDescription.includes(searchTermLower) || brandWebsite.includes(searchTermLower)) {
        descriptionMatches.push(brand);
      }
    });
    
    // Return results in priority order
    return [...exactMatches, ...partialMatches, ...descriptionMatches];
  }

  // Removed duplicate pagination properties - now defined above

  // Server-side pagination - brands are already paginated from API
  get pagedBrands() {
    return this.allBrands; // allBrands now contains only current page data
  }

  // For filtered brands, we'll use the same data since filtering will be done server-side
  // get pagedFilteredBrands() {
  //   if (this.searchTerm && this.searchTerm.trim().length > 0) {
  //     // If searching, use client-side filtering on current page data
  //     return this.filteredBrands;
  //   }
  //   return this.allBrands; // Server-side paginated data
  // }

  get pages() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getVisiblePages(): number[] {
    const totalPages = this.totalPages;
    const currentPage = this.currentPage;
    
    // If only 1 page, return empty array (first page is shown separately)
    if (totalPages <= 1) {
      return [];
    }
    
    // If 2-7 pages, show middle pages only
    if (totalPages <= 7) {
      const middlePages = [];
      for (let i = 2; i < totalPages; i++) {
        middlePages.push(i);
      }
      return middlePages;
    }
    
    // For more than 7 pages, show pages around current page
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Adjust if we're near the beginning
    if (currentPage <= 3) {
      startPage = 2;
      endPage = Math.min(totalPages - 1, 4);
    }
    
    // Adjust if we're near the end
    if (currentPage >= totalPages - 2) {
      startPage = Math.max(2, totalPages - 3);
      endPage = totalPages - 1;
    }
    
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }
  // Method to update displayed brands (called only when search is explicitly triggered)
  private updateDisplayedBrands() {
    if (this.isSearchActive && this.searchTerm && this.searchTerm.trim().length > 0) {
      // Use search results from API when search is active
      this.displayedBrands = this.brandData || [];
      this.pagedDisplayedBrands = this.displayedBrands;
    } else {
      // Use regular brand data when no search is active
      this.displayedBrands = this.brandData || [];
      this.pagedDisplayedBrands = this.allBrands || [];
    }
  }

  // Enhanced real-time search functionality
  // onSearchInputChange() {
  //   // Reset to first page when search changes
  //   this.currentPage = 1;
    
  //   // Update search state
  //   this.isSearchActive = !!(this.searchTerm && this.searchTerm.trim().length > 0);
    
  //   // If search is active, we'll use client-side filtering on current page
  //   // If search is cleared, reload data from API
  //   if (!this.isSearchActive) {
  //     this.loadBrandData(0);
  //   }
    
  //   // The filtering is handled by the filteredBrands getter automatically
  //   // No need to manually filter here as it's reactive
  // }

  // Clear search functionality
  clearSearch() {
    this.searchTerm = '';
    this.isSearchActive = false;
    this.currentPage = 1;
    
    // Reset any search-specific states
    this.searchResults = [];
    
    // Reload data from API without search parameter only if pageSize is set
    if (this.pageSize > 0) {
      this.loadBrandData(0, '');
    }
    
    // Clear stored search state
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem('brandsSearchTerm', '');
    }
  }

  // Search method - triggers brand search API call
  onSearch() {
    // Reset to first page when search is triggered
    this.currentPage = 1;
    
    // Update search state
    this.isSearchActive = !!(this.searchTerm && this.searchTerm.trim().length > 0);
    
    // Trigger API call with current search term only if pageSize is set
    if (this.pageSize > 0) {
      this.loadBrandData(0, this.searchTerm);
    }
    
    // Store search state for navigation
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem('brandsSearchTerm', this.searchTerm);
    }
  }

  // Update selectCategory to handle navigation
  selectCategory(category: string) {
    if (this.selectedCategory === category) return; // Prevent unnecessary calls
    
    this.selectedCategory = category;
    this.expandedCategory = category;
    this.currentPage = 1;
    this.selectedSubCategory = '';
    this.filteredCategories = this.categories;

    // Load first page of data for new category only if not loading
    if (!this.isLoadingBrands) {
      this.loadBrandData(0);
    }

    // Update URL with the selected category
    if (category !== 'All') {
      const routeCategory = category.toLowerCase().replace(/\s+/g, '-');
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { category: routeCategory },
        queryParamsHandling: 'merge'
      });
    } else {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        queryParamsHandling: 'merge'
      });
    }
  }

  selectPage(page: number) {
    if (page !== this.currentPage && page >= 1 && page <= this.totalPages && this.pageSize > 0) {
      this.currentPage = page;
      // Load data for the new page (convert to 0-based for API)
      this.loadBrandData(page - 1);
      
      // Store current page in session storage for navigation memory
      if (isPlatformBrowser(this.platformId)) {
        sessionStorage.setItem('brandsCurrentPage', page.toString());
        sessionStorage.setItem('brandsSelectedCategory', this.selectedCategory);
        sessionStorage.setItem('brandsSelectedSubCategory', this.selectedSubCategory);
      }
    }
  }

  subCategoryColors: { [key: string]: string } = {
    'Arts and Entertainment': '#fff7e6',
    'Community and Society': '#e6f7ff',
    'E-commerce and Shopping': '#f0fff4',
    'Food and Drink': '#fff0f6',
    'Games': '#f9f0ff',
    'Heavy Industry and Engineering': '#f6ffed',
    'Home and Garden': '#f0f5ff',
    'Law and Government': '#f9fafb',
    'Luxury': '#fffbe6',
    'Pets and Animals': '#f6fffa',
    'Science and Education': '#f0f5ff',
    'Travel and Tourism': '#e6fffb',
    'Business and Consumer Services': '#f0f5ff',
    'Computers Electronics and Technology': '#e6f7ff',
    'Finance': '#f6ffed',
    'Gambling': '#fff0f6',
    'Health': '#f0fff4',
    'Hobbies and Leisure': '#fffbe6',
    'Jobs and Career': '#f9fafb',
    'Lifestyle': '#fff7e6',
    'News and Media': '#f0f5ff',
    'Reference Materials': '#f9f0ff',
    'Sports': '#e6fffb',
    'Vehicles': '#f0f5ff'
  };

  getSubCardBgColor(): string {
    return this.subCategoryColors[this.selectedCategory] || '#fafbfc';
  }

  // When a subcategory is clicked, filter by it
  goToSubCategory(sub: string) {
    if (this.selectedCategory === 'All' || this.selectedSubCategory === sub) {
      this.selectedSubCategory = '';
      return;
    }
    
    this.selectedSubCategory = sub;
    this.currentPage = 1;
    
    // Load first page of data for new subcategory only if not loading
    if (!this.isLoadingBrands) {
      this.loadBrandData(0);
    }
  }

  // Enhanced toggle category accordion with search preservation
  toggleCategoryAccordion(category: string) {
    const wasExpanded = this.expandedCategory === category;
    const wasSelected = this.selectedCategory === category;
    
    if (category === 'All') {
      this.expandedCategory = wasExpanded ? '' : 'All';
      if (!wasSelected) {
        this.selectedCategory = 'All';
        this.selectedSubCategory = '';
        this.currentPage = 1;
        if (!this.isLoadingBrands) {
          this.loadBrandData(0);
        }
      }
      // Remove category from URL
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        queryParamsHandling: 'merge'
      });
    } else {
      this.expandedCategory = wasExpanded ? '' : category;
      if (!wasSelected) {
        this.selectedCategory = category;
        this.selectedSubCategory = '';
        this.currentPage = 1;
        if (!this.isLoadingBrands) {
          this.loadBrandData(0);
        }
        // Update URL with selected category
        const routeCategory = category.toLowerCase().replace(/\s+/g, '-');
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { category: routeCategory },
          queryParamsHandling: 'merge'
        });
      }
    }
  }

  // Explore categories button stub
  exploreCategories() {
    alert('Explore categories clicked!');
  }

  goToBrand(brand: any) {
    // Store current state before navigation
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem('brandsCurrentPage', this.currentPage.toString());
      sessionStorage.setItem('brandsSelectedCategory', this.selectedCategory);
      sessionStorage.setItem('brandsSelectedSubCategory', this.selectedSubCategory);
      sessionStorage.setItem('brandsSearchTerm', this.searchTerm);
    }
    
    this.utilService.searchResult = brand; // Set the selected brand for search-view
    const brandName = encodeURIComponent(brand.name);
    this.router.navigate(['/search/view', brandName], { 
      queryParams: { from: 'brands' },
      state: { brandData: brand }
    });
  }

  // Returns a style object for the brand card background using top 2 colors as a gradient
  getBrandCardGradient(brand: any) {
    if (brand.colors && brand.colors.length > 0) {
      const color1 = brand.colors[0]?.hexCode || '#e0e7ef';
      const color2 = brand.colors[1]?.hexCode || color1;
      if (brand.colors.length > 1) {
        return { background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)` };
      } else {
        return { background: color1 };
      }
    }
    // fallback color
    return { background: '#e0e7ef' };
  }

  getNonWhiteColor(brand: any): string {
    if (brand.colors && brand.colors.length > 0) {
      const nonWhite = brand.colors.find((c: any) => {
        const hex = (c.hexCode || '').toLowerCase();
        return hex !== '#fff' && hex !== '#ffffff';
      });
      return nonWhite ? nonWhite.hexCode : '#e0e7ef';
    }
    return '#e0e7ef';
  }

  getNonWhiteColorWithOpacity(brand: any, opacity: number): string {
    const hex = this.getNonWhiteColor(brand);
    // Convert hex to rgba
    const hexVal = hex.replace('#', '');
    let r = 0, g = 0, b = 0;
    if (hexVal.length === 3) {
      r = parseInt(hexVal[0] + hexVal[0], 16);
      g = parseInt(hexVal[1] + hexVal[1], 16);
      b = parseInt(hexVal[2] + hexVal[2], 16);
    } else if (hexVal.length === 6) {
      r = parseInt(hexVal.substring(0, 2), 16);
      g = parseInt(hexVal.substring(2, 4), 16);
      b = parseInt(hexVal.substring(4, 6), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  // ==================== NEW BRAND DATA API METHODS ====================

  /**
   * Load brand data from API with pagination and optional search
   */
  loadBrandData(page: number = 0, searchTerm?: string): void {
    // Skip API calls during SSR/prerendering or if already loading
    if (!isPlatformBrowser(this.platformId) || this.isLoadingBrands) {
      return;
    }
    
    this.isLoadingBrands = true;
    
    // Use the provided search term or the component's current search term
    const search = searchTerm !== undefined ? searchTerm : this.searchTerm;
    
    this.authService.getAllBrands(page, this.pageSize, search).subscribe({
      next: (response: any) => {
        console.log('API Response:', response);
        
        // Handle paginated response structure
        if (response.content) {
          // Spring Boot paginated response
          this.brandData = response.content || [];
          this.totalElements = response.totalElements || 0;
          this.totalPages = response.totalPages || 1;
          this.isLastPage = response.last || false;
          this.isFirstPage = response.first || true;
          this.currentPage = (response.number || 0) + 1; // Spring Boot uses 0-based indexing
        } else if (response.data) {
          // Custom response structure
          this.brandData = response.data || [];
          this.totalElements = response.totalElements || response.data.length;
          this.totalPages = Math.ceil(this.totalElements / this.pageSize);
        } else {
          // Direct array response (fallback)
          this.brandData = Array.isArray(response) ? response : [];
          this.totalElements = this.brandData.length;
          this.totalPages = Math.ceil(this.totalElements / this.pageSize);
        }
        
        // Remove duplicate brands by name (case-insensitive)
        const seenNames = new Set<string>();
        this.allBrands = this.brandData.filter((brand: any) => {
          const name = (brand.name || '').toLowerCase();
          if (seenNames.has(name)) {
            return false;
          }
          seenNames.add(name);
          return true;
        });
        
        this.isLoadingBrands = false;
        this.updateDisplayedBrands();
        this.cdr.detectChanges();
        
        console.log('Brand data loaded from API:', {
          page: this.currentPage,
          totalPages: this.totalPages,
          totalElements: this.totalElements,
          brandsCount: this.allBrands.length
        });
      },
      error: (error) => {
        console.error('Error loading brand data:', error);
        this.isLoadingBrands = false;
        console.log('Using static brand data due to API error');
        // Keep static brand data as fallback
        this.totalElements = this.allBrands.length;
        this.totalPages = Math.ceil(this.totalElements / this.pageSize);
        this.updateDisplayedBrands();
      }
    });
  }

  /**
   * Load brand statistics
   */
  loadBrandStatistics(): void {
    this.authService.getBrandStatistics().subscribe({
      next: (response: any) => {
        this.brandStatistics = response;
        console.log('Brand statistics loaded:', this.brandStatistics);
      },
      error: (error) => {
        console.error('Error loading brand statistics:', error);
      }
    });
  }

  /**
   * Search brands by name
   */
  searchBrandsByName(query: string): void {
    if (!query.trim()) {
      this.loadBrandData();
      return;
    }

    this.isLoadingBrands = true;
    this.authService.searchBrands(query, 0, 50).subscribe({
      next: (response: any) => {
        this.brandData = response.content || [];
        this.isLoadingBrands = false;
        console.log('Brand search results:', this.brandData);
      },
      error: (error) => {
        console.error('Error searching brands:', error);
        this.isLoadingBrands = false;
      }
    });
  }

  /**
   * Get brand by website
   */
  getBrandByWebsite(website: string): void {
    this.authService.getBrandByWebsite(website).subscribe({
      next: (response: any) => {
        console.log('Brand found by website:', response);
        // Handle the response as needed
      },
      error: (error) => {
        console.error('Error finding brand by website:', error);
      }
    });
  }

  /**
   * Extract brand data from URL
   */
  extractBrandData(url: string): void {
    this.authService.extractBrandData(url).subscribe({
      next: (response: any) => {
        console.log('Brand data extracted:', response);
        // Refresh the brand data after extraction
        this.loadBrandData();
      },
      error: (error) => {
        console.error('Error extracting brand data:', error);
      }
    });
  }

  /**
   * Claim a brand
   */
  claimBrand(brandId: number): void {
    this.authService.claimBrand(brandId).subscribe({
      next: (response: any) => {
        console.log('Brand claimed successfully:', response);
        // Refresh the brand data after claiming
        this.loadBrandData();
      },
      error: (error) => {
        console.error('Error claiming brand:', error);
      }
    });
  }

  /**
   * Get brand asset URL
   */
  getBrandAssetUrl(assetId: number): string {
    return this.authService.getBrandAssetUrl(assetId);
  }

  /**
   * Get brand image URL
   */
  getBrandImageUrl(imageId: number): string {
    return this.authService.getBrandImageUrl(imageId);
  }

  /**
   * Filter brands by industry
   */
  filterBrandsByIndustry(industry: string): void {
    this.isLoadingBrands = true;
    this.authService.searchBrandsByIndustry(industry, 0, 50).subscribe({
      next: (response: any) => {
        this.brandData = response.content || [];
        this.isLoadingBrands = false;
        console.log('Brands filtered by industry:', this.brandData);
      },
      error: (error) => {
        console.error('Error filtering brands by industry:', error);
        this.isLoadingBrands = false;
      }
    });
  }

  /**
   * Filter brands by location
   */
  filterBrandsByLocation(location: string): void {
    this.isLoadingBrands = true;
    this.authService.searchBrandsByLocation(location, 0, 50).subscribe({
      next: (response: any) => {
        this.brandData = response.content || [];
        this.isLoadingBrands = false;
        console.log('Brands filtered by location:', this.brandData);
      },
      error: (error) => {
        console.error('Error filtering brands by location:', error);
        this.isLoadingBrands = false;
      }
    });
  }

  /**
   * Get claimed brands only
   */
  getClaimedBrands(): void {
    this.isLoadingBrands = true;
    this.authService.getClaimedBrands(0, 50).subscribe({
      next: (response: any) => {
        this.brandData = response.content || [];
        this.isLoadingBrands = false;
        console.log('Claimed brands:', this.brandData);
      },
      error: (error) => {
        console.error('Error getting claimed brands:', error);
        this.isLoadingBrands = false;
      }
    });
  }

  /**
   * Get unclaimed brands only
   */
  getUnclaimedBrands(): void {
    this.isLoadingBrands = true;
    this.authService.getUnclaimedBrands(0, 50).subscribe({
      next: (response: any) => {
        this.brandData = response.content || [];
        this.isLoadingBrands = false;
        console.log('Unclaimed brands:', this.brandData);
      },
      error: (error) => {
        console.error('Error getting unclaimed brands:', error);
        this.isLoadingBrands = false;
      }
    });
  }

  /**
   * Get recently updated brands
   */
  getRecentlyUpdatedBrands(): void {
    this.isLoadingBrands = true;
    this.authService.getRecentlyUpdatedBrands(0, 50).subscribe({
      next: (response: any) => {
        this.brandData = response.content || [];
        this.isLoadingBrands = false;
        console.log('Recently updated brands:', this.brandData);
      },
      error: (error) => {
        console.error('Error getting recently updated brands:', error);
        this.isLoadingBrands = false;
      }
    });
  }

  /**
   * Check if a brand is claimed
   */
  async checkIfBrandIsClaimed(brandId: number): Promise<boolean> {
    try {
      return await this.authService.isBrandClaimed(brandId);
    } catch (error) {
      console.error('Error checking brand claim status:', error);
      return false;
    }
  }

  /**
   * Get brand freshness score
   */
  async getBrandFreshnessScore(brandId: number): Promise<number> {
    try {
      return await this.authService.getBrandFreshnessScore(brandId);
    } catch (error) {
      console.error('Error getting brand freshness score:', error);
      return 0;
    }
  }

  /**
   * Get brand colors
   */
  async getBrandColors(brandId: number): Promise<any[]> {
    try {
      return await this.authService.getBrandColors(brandId);
    } catch (error) {
      console.error('Error getting brand colors:', error);
      return [];
    }
  }

  /**
   * Get brand fonts
   */
  async getBrandFonts(brandId: number): Promise<any[]> {
    try {
      return await this.authService.getBrandFonts(brandId);
    } catch (error) {
      console.error('Error getting brand fonts:', error);
      return [];
    }
  }

  /**
   * Get brand social links
   */
  async getBrandSocialLinks(brandId: number): Promise<any[]> {
    try {
      return await this.authService.getBrandSocialLinks(brandId);
    } catch (error) {
      console.error('Error getting brand social links:', error);
      return [];
    }
  }

  /**
   * Get brand assets
   */
  async getBrandAssets(brandId: number): Promise<any[]> {
    try {
      return await this.authService.getBrandAssets(brandId);
    } catch (error) {
      console.error('Error getting brand assets:', error);
      return [];
    }
  }

  /**
   * Get brand images
   */
  async getBrandImages(brandId: number): Promise<any[]> {
    try {
      return await this.authService.getBrandImages(brandId);
    } catch (error) {
      console.error('Error getting brand images:', error);
      return [];
    }
  }

  /**
   * Enhanced brand search with filters
   */
  searchBrandsWithFilters(filters: BrandSearchFilters): void {
    this.isLoadingBrands = true;
    this.brandSearchFilters = filters;
    
    // You can extend this to use different search endpoints based on filters
    let searchObservable;
    
    if (filters.industry) {
      searchObservable = this.authService.searchBrandsByIndustry(filters.industry, 0, 50);
    } else if (filters.location) {
      searchObservable = this.authService.searchBrandsByLocation(filters.location, 0, 50);
    } else if (filters.companyType) {
      searchObservable = this.authService.searchBrandsByCompanyType(filters.companyType, 0, 50);
    } else if (filters.isClaimed === true) {
      searchObservable = this.authService.getClaimedBrands(0, 50);
    } else if (filters.isClaimed === false) {
      searchObservable = this.authService.getUnclaimedBrands(0, 50);
    } else {
      searchObservable = this.authService.getAllBrands(0, 50);
    }
    
    searchObservable.subscribe({
      next: (response: any) => {
        this.brandData = response.content || [];
        this.isLoadingBrands = false;
        console.log('Brands filtered:', this.brandData);
      },
      error: (error) => {
        console.error('Error filtering brands:', error);
        this.isLoadingBrands = false;
      }
    });
  }

  /**
   * Reset brand filters
   */
  resetBrandFilters(): void {
    this.brandSearchFilters = {};
    this.loadBrandData();
  }
}

