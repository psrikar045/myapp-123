import { Component, OnInit, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ToolbarService } from '../../shared/services/toolbar.service';
import { LayoutService } from '../../core/services/layout.service';
import { BlogCard } from '../../shared/interfaces/blog-card.interface';
import { BlogService } from '../../shared/services/blog.service';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.scss'
})
export class BlogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();
  private toolbar = inject(ToolbarService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private blogService = inject(BlogService);
  private layoutService = inject(LayoutService);
  
  // Make Math available in template
  Math = Math;
  
  // Pagination properties (matching AllCategoriesComponent)
  currentPage = 1;
  pageSize = 5;

  // Sidebar management properties
  showAllSidebarCategories = false;
  
  // Search and filter properties
  searchTerm = '';
  selectedCategory = 'All Categories';
  selectedSort = 'Latest';
  filteredBlogs: BlogCard[] = [];
  isSearching = false;
  isSearchFocused = false;

  blogs: BlogCard[] = [];
 hero = {
    title: 'Discover Marketing Insights & Trends',
    subtitle: 'Stay ahead with expert insights, industry trends, and actionable strategies to grow your business and enhance your marketing efforts.'
  };
  sidebarCategories = [
    {
      id: 1,
      img: 'assets/images/Image.jpg',
      author: 'Siva kumar',
      date: 'June 20, 2025',
      title: 'Chatbot for Marketing',
      description: 'Provide recommendations and process transactions at a chat.'
    },
    {
      id: 1,
      img: 'assets/images/Image (1).jpg',
      author: 'Siva kumar',
      date: 'June 20, 2025',
      title: 'Chatbot for Marketing',
      description: 'Provide recommendations and process transactions at a chat.'
    },
    {
      id:2,
      img: 'assets/images/Image (2).jpg',
      author: 'Siva kumar',
      date: 'June 20, 2025',
      title: 'Chatbot for Marketing',
      description: 'Provide recommendations and process transactions at a chat.'
    },
    {
      id:3,
      img: 'assets/images/Image (3).jpg',
      author: 'Siva kumar',
      date: 'June 20, 2025',
      title: 'Chatbot for Marketing',
      description: 'Provide recommendations and process transactions at a chat.'
    },
    {
      id:4,
      img: 'assets/images/Image.jpg',
      author: 'Siva kumar',
      date: 'June 20, 2025',
      title: 'Chatbot for Marketing',
      description: 'Provide recommendations and process transactions at a chat.'
    },
    {
      id:5,
      img: 'assets/images/Image (1).jpg',
      author: 'Siva kumar',
      date: 'June 20, 2025',
      title: 'Chatbot for Marketing',
      description: 'Provide recommendations and process transactions at a chat.'
    },
    {
      id:6,
      img: 'assets/images/Image (2).jpg',
      author: 'Siva kumar',
      date: 'June 20, 2025',
      title: 'Chatbot for Marketing',
      description: 'Provide recommendations and process transactions at a chat.'
    },
    {
      id:7,
      img: 'assets/images/Image (3).jpg',
      author: 'Siva kumar',
      date: 'June 20, 2025',
      title: 'Chatbot for Marketing',
      description: 'Provide recommendations and process transactions at a chat.'
    }
  ];

  ngOnInit(): void {
    // Set layout configuration for blog page
    this.layoutService.setLayoutConfig({
      showHeader: true,
      showFooter: true,
      containerClass: 'container-fluid',
      headerType: 'default'
    });
    
    // Load blogs from service
    this.blogs = this.blogService.getAllBlogs();
    this.filteredBlogs = [...this.blogs]; // Initialize filtered blogs
    
    // Setup search debouncing
    this.searchSubject$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.searchTerm = searchTerm;
        this.applyFilters();
        this.isSearching = false;
      });
    
    // Check if returning from blog details with a specific page
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(queryParams => {
        if (queryParams['page']) {
          this.currentPage = +queryParams['page'];
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  // Search and filter methods
  onSearch(): void {
    this.isSearching = true;
    this.searchSubject$.next(this.searchTerm);
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.isSearching = true;
    this.searchSubject$.next(target.value);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.isSearching = false;
    this.applyFilters();
  }

  onSearchFocus(): void {
    this.isSearchFocused = true;
  }

  onSearchBlur(): void {
    this.isSearchFocused = false;
  }
  
  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }
  
  onSortChange(sort: string): void {
    this.selectedSort = sort;
    this.applyFilters();
  }
  
  private applyFilters(): void {
    let filtered = [...this.blogs];
    
    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter((blog:any) => 
        blog.title.toLowerCase().includes(searchLower) ||
        blog.summary.toLowerCase().includes(searchLower) ||
        blog.author.toLowerCase().includes(searchLower) ||
        (blog.category && blog.category.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply category filter
    if (this.selectedCategory !== 'All Categories') {
      filtered = filtered.filter(blog => 
        blog.category === this.selectedCategory
      );
    }
    
    // Apply sorting
    switch (this.selectedSort) {
      case 'Latest':
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'Popular':
        // Sort by a popularity metric (you can implement this based on your needs)
        filtered.sort((a, b) => (b.title.length) - (a.title.length)); // Placeholder
        break;
      case 'Oldest':
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
    }
    
    this.filteredBlogs = filtered;
    this.currentPage = 1; // Reset to first page when filters change
  }
  
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 'All Categories';
    this.selectedSort = 'Latest';
    this.isSearching = false;
    this.applyFilters();
  }

  // Pagination methods (matching AllCategoriesComponent)
  get pagedBlogs() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredBlogs.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.filteredBlogs.length / this.pageSize) || 1;
  }

  get pages() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getVisiblePages(): number[] {
    const totalPages = this.totalPages;
    const currentPage = this.currentPage;
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      return this.pages;
    }
    
    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }

  selectPage(page: number) {
    this.currentPage = page;
    // Reset the sidebar toggle when changing pages
    this.showAllSidebarCategories = false;
  }

  navigateToBlogDetails(blogIndex: number): void {
    // Calculate the actual index in the full blogs array
    const actualIndex = (this.currentPage - 1) * this.pageSize + blogIndex;
    
    // Set pagination context in the service so BlogDetails knows which blogs to navigate within
    this.blogService.setPaginationContext(this.currentPage, this.pageSize);
    
    // Navigate with the actual index and pagination context
    this.router.navigate(['/blog', actualIndex], {
      queryParams: {
        page: this.currentPage,
        pageSize: this.pageSize
      }
    });
  }

  navigateToBlogDetailsFromSidebar(index: number): void {
    // For sidebar navigation, navigate to the blog details
    this.router.navigate(['/blog', index]);
  }

  private resetScrollPosition(): void {
    // Simple immediate positioning
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      try {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      } catch (error) {
        // Silently handle any scroll errors
      }
    }
  }

  trackByBlog(index: number, blog: BlogCard): string {
    return blog.title + index;
  }

  // Sidebar category management
  get displayedSidebarCategories() {
    const leftSideCount = this.pagedBlogs.length;
    const rightSideCount = this.sidebarCategories.length;
    const isLastPage = this.currentPage === this.totalPages;
    
    // Only limit on the last page
    if (isLastPage && !this.showAllSidebarCategories && rightSideCount > leftSideCount) {
      return this.sidebarCategories.slice(0, leftSideCount);
    }
    return this.sidebarCategories;
  }

  get shouldShowMoreButton(): boolean {
    const leftSideCount = this.pagedBlogs.length;
    const rightSideCount = this.sidebarCategories.length;
    const isLastPage = this.currentPage === this.totalPages;
    
    // Only show button on last page when right side has more cards than left
    return isLastPage && rightSideCount > leftSideCount;
  }

  get hasMoreCategories(): boolean {
    const leftSideCount = this.pagedBlogs.length;
    const rightSideCount = this.sidebarCategories.length;
    const isLastPage = this.currentPage === this.totalPages;
    
    return isLastPage && rightSideCount > leftSideCount && !this.showAllSidebarCategories;
  }

  toggleSidebarCategories(): void {
    this.showAllSidebarCategories = !this.showAllSidebarCategories;
  }

  testPageClick(pageNumber: number): void {
    console.log('Test page click called with:', pageNumber);
    alert(`Page ${pageNumber} clicked!`);
  }
}