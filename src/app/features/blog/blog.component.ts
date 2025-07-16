import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarService } from '../../shared/services/toolbar.service';
import { Router } from '@angular/router';
import { HeaderComponent } from '../header/header.component';

interface BlogCard {
  img: string;
  author: string;
  date: string;
  title: string;
  category: string;
  authorAvatar: string;
}

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule,HeaderComponent],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css'
})
export class BlogComponent implements OnInit {
  private toolbar = inject(ToolbarService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  // blogs: any[] = []; // Your full data list
  page: number = 1;  // Current page
  itemsPerPage: number = 5; // You can adjust this

  // Pagination properties
  currentPage: number = 1;
  // itemsPerPage: number = 5;
  totalPages: number = 0;
  paginatedBlogs: BlogCard[] = [];

  blogs: BlogCard[] = [
    {
      img: '/images/Image.jpg',
      author: 'Tracey Wilson',
      date: 'june 20, 2025',
      title: 'Introducing Marketify: The Ultimate API to Access Brand Assets by Domain',
      category: 'Technology',
      authorAvatar: 'assets/author1.png'
    },
    {
      img: '/images/Image (1).jpg',
      author: 'John Smith',
      date: 'june 28, 2025',
      title: '5 Reasons Marketify Is the Perfect Alternative to Brandfetch',
      category: 'Design',
      authorAvatar: 'assets/author2.png'
    },
    {
      img: '/images/Image (2).jpg',
      author: 'july 20, 2025',
      date: 'August 15, 2022',
      title: 'How to Automatically Fetch Logos, Brand Colors & Fonts Using Marketify API',
      category: 'Development',
      authorAvatar: 'assets/author3.png'
    },
    {
      img: '/images/Image (3).jpg',
      author: 'Mike Johnson',
      date: 'june 20, 2025',
      title: 'Building a CRM That Auto-Fills Brand Profiles Using Marketify',
      category: 'UX/UI',
      authorAvatar: 'assets/author4.png'
    },
    {
      img: '/images/Image (1).jpg',
      author: 'John Smith',
      date: 'April 18, 2022',
      title: 'From Domain to Design: Using Marketify for Instant Brand Kits',
      category: 'Design',
      authorAvatar: 'assets/author2.png'
    },
    {
      img: '/images/Image.jpg',
      author: 'Tracey Wilson',
      date: 'May 20, 2022',
      title: 'Developers, Here’s How You Can Use Marketify in 5 Minutes or Less',
      category: 'Technology',
      authorAvatar: 'assets/author1.png'
    },
    {
      img: '/images/Image (1).jpg',
      author: 'John Smith',
      date: 'July 18, 2022',
      title: 'Behind the Scenes: How Marketify Builds a Fast, Accurate Brand Lookup Engine',
      category: 'Design',
      authorAvatar: 'assets/author2.jpg'
    },
    {
      img: '/images/Image (2).jpg',
      author: 'Jane Doe',
      date: 'June 15, 2022',
      title: 'Marketify vs. Brandfetch: Detailed Feature-by-Feature Comparison (2025)',
      category: 'Development',
      authorAvatar: 'assets/author3.png'
    },
    {
      img: '/images/Image (3).jpg',
      author: 'Mike Johnson',
      date: 'July 12, 2022',
      title: 'How Agencies Can Save Hours with Marketify’s Brand Asset Automation',
      category: 'UX/UI',
      authorAvatar: 'assets/author4.png'
    },
    {
      img: '/images/Image (1).jpg',
      author: 'John Smith',
      date: 'June 18, 2022',
      title: 'Boost Your Pitch Decks & Reports with Branded Content from Marketify',
      category: 'Design',
      authorAvatar: 'assets/author2.png'
    }
  ];

  sidebarCategories = [
    {
      img: '/images/Image.jpg',
      author: 'Siva kumar',
      title: 'Boost Your Pitch Decks & Reports with Branded Content from Marketify'
    },
    {
      img: '/images/Image (1).jpg',
      author: 'Srikar',
      title: 'How Agencies Can Save Hours with Marketify’s Brand Asset Automation'
    },
    {
      img: '/images/Image (2).jpg',
      author: 'John Smith',
      title: '"Marketify vs. Brandfetch: Detailed Feature-by-Feature Comparison (2025)"'
    },
    {
      img: '/images/Image (3).jpg',
      author: 'John Smith',
      title: '"Behind the Scenes: How Marketify Builds a Fast, Accurate Brand Lookup Engine"'
    },
    {
      img: '/images/Image.jpg',
      author: 'John Smith',
      title: 'Boost Your Pitch Decks & Reports with Branded Content from Marketify'
    },
    {
      img: '/images/Image (1).jpg',
      author: 'John Smith',
      title: 'How Agencies Can Save Hours with Marketify’s Brand Asset Automation'
    },
    {
      img: '/images/Image (2).jpg',
      author: 'John Smith',
      title: '"Marketify vs. Brandfetch: Detailed Feature-by-Feature Comparison (2025)"'
    },
    {
      img: '/images/Image (3).jpg',
      author: 'John Smith',
      title: '"Behind the Scenes: How Marketify Builds a Fast, Accurate Brand Lookup Engine"'
    }
  ];

  ngOnInit(): void {
    // this.toolbar.setLoggedOutToolbar();
    this.calculateTotalPages();
    this.updatePaginatedBlogs();
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.blogs.length / this.itemsPerPage);
  }

  updatePaginatedBlogs(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedBlogs = this.blogs.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedBlogs();
      this.cdr.detectChanges(); // Force change detection
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedBlogs();
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedBlogs();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    console.log('getPageNumbers called, returning:', pages);
    return pages;
  }

  navigateToBlogDetails(blogIndex: number): void {
    // Calculate the actual index in the full blogs array
    const actualIndex = (this.currentPage - 1) * this.itemsPerPage + blogIndex;
    this.router.navigate(['/blog-details', actualIndex]);
  }

  trackByBlog(index: number, blog: BlogCard): string {
    return blog.title + index;
  }

  testPageClick(pageNumber: number): void {
    console.log('Test page click called with:', pageNumber);
    alert(`Page ${pageNumber} clicked!`);
  }
}
