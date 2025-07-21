import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogCard } from '../../shared/interfaces/blog-card.interface';
import { HeaderComponent } from '../header/header.component';
import { BlogService } from '../../shared/services/blog.service';

@Component({
  selector: 'app-blog-details',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './blog-details.component.html',
  styleUrl: './blog-details.component.css'
})
export class BlogDetailsComponent implements OnInit {
  selectedBlog: BlogCard | null = null;
  currentIndex: number = 0;
  prevBlog: BlogCard | null = null;
  nextBlog: BlogCard | null = null;
  
  // Pagination context - contains the IDs of blogs in current page
  pagedBlogIds: number[] = [];
  currentPagedIndex: number = 0; // Position within the current page
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  sidebarCategories = [
    {
      img: '/images/Image.jpg',
      author: 'John Smith',
      title: 'Lorem Ipsum is simply dummy text dummy text ?'
    },
    {
      img: '/images/Image (3).jpg',
      author: 'John Smith',
      title: 'Lorem Ipsum is simply dummy text dummy text ?'
    },
    {
      img: '/images/Image (2).jpg',
      author: 'John Smith',
      title: 'Lorem Ipsum is simply dummy text dummy text ?'
    },
    {
      img: '/images/Image (1).jpg',
      author: 'John Smith',
      title: 'Lorem Ipsum is simply dummy text dummy text ?'
    }
  ];

  advertisements = [
    {
      img: '/images/Image.jpg',
      author: 'John Smith',
      title: 'Lorem Ipsum is simply dummy text dummy text ?'
    }
  ];

  popularTags = [
    'Best Diploma Course For Fashion',
    'Best Fashion Academy In Hyderabad',
    'Best Fashion Courses',
    'Best Fashion Design Training',
    'Best Fashion Institute',
    'Best Fashion Trends',
    'Boutique Business',
    'Certificate Course In Boutique Management',
    'Certificate Course In Fashion Design',
    'Certification Course For Fashion',
    'Certification Course For Fashion Designing',
    'Diploma In Fashion',
    'Diploma In Fashion Design',
    'Diploma In Fashion Designing',
    'Fashion',
    'Fashion Design',
    'Fashion Design Course',
    'Fashion Design Courses',
    'Fashion Design Course Training',
    'Fashion Design Curriculum',
    'Fashion Designer',
    'Fashion Designers With Technical Skills',
    'Fashion Designing Colleges In Hyderabad',
    'Fashion Designing In India',
    'Fashion Design Training',
    'Fashion Journalism',
    'Fashion Quotes',
    'Fashion Trends',
    'Global Certification In Fashion Design',
    'Global Certified Fashion Designers',
    'Hitmls',
    'Hyderabad\'s Best Fashion Institute',
    'Hyderabad\'s Best Interior Designing Course Institute',
    'Importance Of Photography In The Digital Era',
    'Interior Designing Institute',
    'International Certified Fashion Design Course',
    'Masters In Fashion Designing',
    'Pg Diploma In Fashion Designing',
    'Style',
    'The Fashion Industry'
  ];

  ngOnInit(): void {
    // Get the blog ID from route parameters
    this.route.params.subscribe(params => {
      const blogId = +params['id'];
      this.currentIndex = blogId;
      this.selectedBlog = this.blogService.getBlog(blogId) || this.blogService.getBlog(0);
      
      // Get pagination context from route params or service
      this.route.queryParams.subscribe(queryParams => {
        if (queryParams['page'] && queryParams['pageSize']) {
          // Use query params to set pagination context
          const page = +queryParams['page'];
          const pageSize = +queryParams['pageSize'];
          this.blogService.setPaginationContext(page, pageSize);
        }
        
        // Get pagination context and set up navigation
        const paginationContext = this.blogService.getCurrentPaginationContext();
        this.pagedBlogIds = paginationContext.pagedBlogIds;
        this.updateNavigation();
      });
    });
    
    // Force scroll to top when component initializes
    this.forceTopPosition();
  }

  updateNavigation(): void {
    // Find current position within the paginated data
    this.currentPagedIndex = this.pagedBlogIds.indexOf(this.currentIndex);
    
    if (this.currentPagedIndex === -1) {
      // If current blog is not in paginated context, allow navigation through all blogs
      this.prevBlog = this.currentIndex > 0 ? this.blogService.getBlog(this.currentIndex - 1) : null;
      this.nextBlog = this.blogService.getBlog(this.currentIndex + 1);
    } else {
      // Navigate only within the current page's blogs
      const prevIndex = this.currentPagedIndex > 0 ? this.pagedBlogIds[this.currentPagedIndex - 1] : -1;
      const nextIndex = this.currentPagedIndex < this.pagedBlogIds.length - 1 ? this.pagedBlogIds[this.currentPagedIndex + 1] : -1;
      
      this.prevBlog = prevIndex >= 0 ? this.blogService.getBlog(prevIndex) : null;
      this.nextBlog = nextIndex >= 0 ? this.blogService.getBlog(nextIndex) : null;
    }
  }

  navigateToBlog(index: number): void {
    this.router.navigate(['/blog-details', index]).then(() => {
      this.currentIndex = index;
      this.selectedBlog = this.blogService.getBlog(index) || this.blogService.getBlog(0);
      this.updateNavigation();
      this.forceTopPosition();
    });
  }

  navigateToPrevious(): void {
    if (this.currentPagedIndex > 0) {
      const prevIndex = this.pagedBlogIds[this.currentPagedIndex - 1];
      this.navigateToBlog(prevIndex);
    }
  }

  navigateToNext(): void {
    if (this.currentPagedIndex < this.pagedBlogIds.length - 1) {
      const nextIndex = this.pagedBlogIds[this.currentPagedIndex + 1];
      this.navigateToBlog(nextIndex);
    }
  }

  onBackToList(): void {
    // Get current pagination context to return to correct page
    const paginationContext = this.blogService.getCurrentPaginationContext();
    this.router.navigate(['/blog'], {
      queryParams: { 
        page: paginationContext.currentPage 
      }
    });
  }

  private forceTopPosition(): void {
    // Only execute in browser environment
    if (isPlatformBrowser(this.platformId)) {
      try {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      } catch (error) {
        // Silently handle any scroll errors
      }
    }
  }
}