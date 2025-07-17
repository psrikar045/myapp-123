import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BrandDataResponse, BrandSearchFilters, BrandDataSummary } from '../../shared/models/api.models';

@Component({
  selector: 'app-all-categories',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FormsModule],
  templateUrl: './all-categories.component.html',
  styleUrl: './all-categories.component.css'
})
export class AllCategoriesComponent {
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

  // Static brand data for fallback/demo purposes
  allBrands = [
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
private readonly authService = inject(AuthService);
  constructor(private router: Router) {
    console.log('AllCategoriesComponent constructor called');
    
    // Initialize with default categories immediately
    this.setDefaultCategories();
    
    // Then try to load from API
    try {
      this.getAllCategories();
      this.loadBrandData();
      // this.loadBrandStatistics();
    } catch (error) {
      console.error('Error in AllCategoriesComponent constructor:', error);
    }
  }
setDefaultCategories() {
    // Set default categories for public access
    this.categories = [
      { label: 'All' },
      { id: 1, label: 'Education' },
      { id: 2, label: 'Entertainment' },
      { id: 3, label: 'Games' },
      { id: 4, label: 'Music & Video' },
      { id: 5, label: 'Fitness' },
      { id: 6, label: 'Hospitals' },
      { id: 7, label: 'Business' },
      { id: 8, label: 'Technology' },
      { id: 9, label: 'Food & Drink' },
      { id: 10, label: 'Travel' }
    ];
    
    // Set default subcategories
    this.subCategoryMap = {
      'Education': [
        { id: 1, name: 'Resume' },
        { id: 2, name: 'Science' },
        { id: 3, name: 'Social media' },
        { id: 4, name: 'Physics' },
        { id: 5, name: 'Math\'s' }
      ],
      'Entertainment': [
        { id: 6, name: 'Movie tickets' },
        { id: 7, name: 'Dance studios' },
        { id: 8, name: 'Photograph' }
      ],
      'Games': [
        { id: 9, name: 'Video Games' },
        { id: 10, name: 'Board Games' },
        { id: 11, name: 'Mobile Games' }
      ],
      'Music & Video': [
        { id: 12, name: 'Music' },
        { id: 13, name: 'Streaming' },
        { id: 14, name: 'Podcasts' }
      ],
      'Fitness': [
        { id: 15, name: 'Gyms' },
        { id: 16, name: 'Personal Training' },
        { id: 17, name: 'Yoga' }
      ],
      'Hospitals': [
        { id: 18, name: 'General' },
        { id: 19, name: 'Specialized' },
        { id: 20, name: 'Emergency' }
      ],
      'Business': [
        { id: 21, name: 'Services' },
        { id: 22, name: 'Consulting' },
        { id: 23, name: 'Finance' }
      ],
      'Technology': [
        { id: 24, name: 'Software' },
        { id: 25, name: 'Hardware' },
        { id: 26, name: 'AI/ML' }
      ],
      'Food & Drink': [
        { id: 27, name: 'Restaurants' },
        { id: 28, name: 'Cafes' },
        { id: 29, name: 'Delivery' }
      ],
      'Travel': [
        { id: 30, name: 'Hotels' },
        { id: 31, name: 'Airlines' },
        { id: 32, name: 'Tourism' }
      ]
    };
    
    this.filteredCategories = this.categories;
  }

getAllCategories() {
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
        // Default categories are already set, so no need to do anything
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
    let filtered = this.allBrands.filter(b => b.category === this.selectedCategory);
    if (this.selectedSubCategory) {
      filtered = filtered.filter(b => b.subCategory === this.selectedSubCategory);
    }
    return filtered;
  }

  currentPage = 1;
  pageSize = 10;

  get pagedBrands() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.brands.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.brands.length / this.pageSize) || 1;
  }

  get pages() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  onSearch() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredCategories = this.categories;
    } else {
      this.filteredCategories = this.categories.filter((cat:any) =>
        cat.label.toLowerCase().includes(term)
      );
    }
    // Optionally reset selection if not in filtered list
    if (!this.filteredCategories.some((cat:any) => cat.label === this.selectedCategory)) {
      this.selectedCategory = this.filteredCategories.length ? this.filteredCategories[0].label : '';
    }
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.currentPage = 1;
    this.selectedSubCategory = '';
    // Reset search and filtered categories to show all
    this.searchTerm = '';
    this.filteredCategories = this.categories;
  }

  selectPage(page: number) {
    this.currentPage = page;
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
    if (this.selectedCategory === 'All') {
      this.selectedSubCategory = '';
      return;
    }
    this.selectedSubCategory = sub;
    this.currentPage = 1;
  }

  // Accordion logic for sidebar
  toggleCategoryAccordion(category: string) {
    if (category === 'All') {
      this.expandedCategory = this.expandedCategory === 'All' ? '' : 'All';
      this.selectedSubCategory = '';
    } else {
      this.expandedCategory = this.expandedCategory === category ? '' : category;
      this.selectedSubCategory = '';
    }
  }

  // Explore categories button stub
  exploreCategories() {
    alert('Explore categories clicked!');
  }

  goToBrand(brand: any) {
    const brandName = encodeURIComponent(brand.name);
    this.router.navigate(['/search-view', brandName]);
  }

  // ==================== NEW BRAND DATA API METHODS ====================

  /**
   * Load brand data from API
   */
  loadBrandData(): void {
    this.isLoadingBrands = true;
    this.authService.getAllBrands(0, 20).subscribe({
      next: (response: any) => {
        this.brandData = response.content || [];
        this.isLoadingBrands = false;
        console.log('Brand data loaded from API:', this.brandData);
      },
      error: (error) => {
        console.error('Error loading brand data:', error);
        this.isLoadingBrands = false;
        console.log('Using static brand data due to API error');
        // The component already has static brand data from the allBrands array
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
function next(value: any): void {
  throw new Error('Function not implemented.');
}

