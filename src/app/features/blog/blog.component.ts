import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ToolbarService } from '../../shared/services/toolbar.service';
import { HeaderComponent } from '../header/header.component';
import { BlogCard } from '../../shared/interfaces/blog-card.interface';
import { BlogService } from '../../shared/services/blog.service';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css'
})
export class BlogComponent implements OnInit {
  private toolbar = inject(ToolbarService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private blogService = inject(BlogService);
  
  // Pagination properties (matching AllCategoriesComponent)
  currentPage = 1;
  pageSize = 5; // 5 items per page as requested

  blogs: BlogCard[] = [];

  sidebarCategories = [
    {
      id: 1,
      img: '/images/Image.jpg',
      author: 'Siva kumar',
      date: 'June 20, 2025',
      title: 'Chatbot for Marketing',
      description: 'Provide recommendations and process transactions at a chat.'
    },
    {
      id: 1,
      img: '/images/Image (1).jpg',
      author: 'Siva kumar',
      date: 'June 20, 2025',
      title: 'Chatbot for Marketing',
      description: 'Provide recommendations and process transactions at a chat.'
    },
    {
      id:2,
      img: '/images/Image (2).jpg',
      author: 'Siva kumar',
      date: 'June 20, 2025',
      title: 'Chatbot for Marketing',
      description: 'Provide recommendations and process transactions at a chat.'
    },
    {
      id:3,
      img: '/images/Image (3).jpg',
      author: 'Siva kumar',
      date: 'June 20, 2025',
      title: 'Chatbot for Marketing',
      description: 'Provide recommendations and process transactions at a chat.'
    },
    {
      id:4,
      img: '/images/Image.jpg',
      author: 'Siva kumar',
      date: 'June 20, 2025',
      title: 'Chatbot for Marketing',
      description: 'Provide recommendations and process transactions at a chat.'
    },
    {
      id:5,
      img: '/images/Image (1).jpg',
      author: 'Siva kumar',
      date: 'June 20, 2025',
      title: 'Chatbot for Marketing',
      description: 'Provide recommendations and process transactions at a chat.'
    },
    {
      id:6,
      img: '/images/Image (2).jpg',
      author: 'Siva kumar',
      date: 'June 20, 2025',
      title: 'Chatbot for Marketing',
      description: 'Provide recommendations and process transactions at a chat.'
    },
    {
      id:7,
      img: '/images/Image (3).jpg',
      author: 'Siva kumar',
      date: 'June 20, 2025',
      title: 'Chatbot for Marketing',
      description: 'Provide recommendations and process transactions at a chat.'
    }
  ];

  ngOnInit(): void {
    // this.toolbar.setLoggedOutToolbar();
    // Load blogs from service
    this.blogs = this.blogService.getAllBlogs();
    
    // Check if returning from blog details with a specific page
    this.route.queryParams.subscribe(queryParams => {
      if (queryParams['page']) {
        this.currentPage = +queryParams['page'];
      }
    });
  }

  // Pagination methods (matching AllCategoriesComponent)
  get pagedBlogs() {
    return this.blogService.getPagedBlogs(this.currentPage, this.pageSize);
  }

  get totalPages() {
    return this.blogService.getTotalPages(this.pageSize);
  }

  get pages() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  selectPage(page: number) {
    this.currentPage = page;
  }

  navigateToBlogDetails(blogIndex: number): void {
    // Calculate the actual index in the full blogs array
    const actualIndex = (this.currentPage - 1) * this.pageSize + blogIndex;
    
    // Set pagination context in the service so BlogDetails knows which blogs to navigate within
    this.blogService.setPaginationContext(this.currentPage, this.pageSize);
    
    // Navigate with the actual index and pagination context
    this.router.navigate(['/blog-details', actualIndex], {
      queryParams: {
        page: this.currentPage,
        pageSize: this.pageSize
      }
    });
  }

  navigateToBlogDetailsFromSidebar(index: number): void {
    // For sidebar navigation, navigate to the blog details
    this.router.navigate(['/blog-details', index]);
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

  testPageClick(pageNumber: number): void {
    console.log('Test page click called with:', pageNumber);
    alert(`Page ${pageNumber} clicked!`);
  }
}