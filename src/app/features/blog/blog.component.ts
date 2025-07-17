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
  summary?: string;
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
      summary:'Learn how Marketify simplifies brand asset retrieval with a powerful REST API, real-time caching, and developer-first features. Built on Java + Angular, it’s faster and more flexible than Brandfetch.',
      category: 'Technology',
      authorAvatar: 'assets/author1.png'
    },
    {
      img: '/images/Image (1).jpg',
      author: 'John Smith',
      date: 'june 28, 2025',
      title: '5 Reasons Marketify Is the Perfect Alternative to Brandfetch',
      summary:' Tired of limitations or API bottlenecks with Brandfetch? Discover why Marketify is the next-gen brand intelligence tool your dev team will love — from API control to self-hosted flexibility.',
      category: 'Design',
      authorAvatar: 'assets/author2.png'
    },
    {
      img: '/images/Image (2).jpg',
      author: 'july 20, 2025',
      date: 'August 15, 2022',
      title: 'How to Automatically Fetch Logos, Brand Colors & Fonts Using Marketify API',
      summary:'Step-by-step guide on how to integrate Marketify with your application and automatically pull visual brand assets from any domain in seconds.',
      category: 'Development',
      authorAvatar: 'assets/author3.png'
    },
    {
      img: '/images/Image (3).jpg',
      author: 'Mike Johnson',
      date: 'june 20, 2025',
      title: 'Building a CRM That Auto-Fills Brand Profiles Using Marketify',
      summary:'Discover how to enrich your CRM by using Marketify’s API to auto-fill company logos, industries, and social links — giving your sales and marketing teams an edge.',
      category: 'UX/UI',
      authorAvatar: 'assets/author4.png'
    },
    {
      img: '/images/Image (1).jpg',
      author: 'John Smith',
      date: 'April 18, 2022',
      title: 'From Domain to Design: Using Marketify for Instant Brand Kits',
      summary:'Designers and marketers can now generate instant brand kits using just a domain. Learn how Marketify helps streamline your creative workflow.',
      category: 'Design',
      authorAvatar: 'assets/author2.png'
    },
    {
      img: '/images/Image.jpg',
      author: 'Tracey Wilson',
      date: 'May 20, 2022',
      title: 'Developers, Here’s How You Can Use Marketify in 5 Minutes or Less',
      summary:'A developer-focused quick-start tutorial on consuming Marketify’s REST API using Java, Angular, or Postman — ideal for devs who want speed without bloated SDKs.',
      category: 'Technology',
      authorAvatar: 'assets/author1.png'
    },
    {
      img: '/images/Image (1).jpg',
      author: 'John Smith',
      date: 'July 18, 2022',
      title: 'Behind the Scenes: How Marketify Builds a Fast, Accurate Brand Lookup Engine',
      summary:'Dive into the architecture of Marketify — including Java Spring Boot backend, PostgreSQL data modeling, caching, and asset delivery — built for performance.',
      category: 'Design',
      authorAvatar: 'assets/author2.jpg'
    },
    {
      img: '/images/Image (2).jpg',
      author: 'Jane Doe',
      date: 'June 15, 2022',
      title: 'Marketify vs. Brandfetch: Detailed Feature-by-Feature Comparison (2025)',
      summary:'A clear comparison of pricing, speed, API structure, customization options, and integration capabilities between Marketify and Brandfetch.',
      category: 'Development',
      authorAvatar: 'assets/author3.png'
    },
    {
      img: '/images/Image (3).jpg',
      author: 'Mike Johnson',
      date: 'July 12, 2022',
      title: 'How Agencies Can Save Hours with Marketify’s Brand Asset Automation',
      summary:'Agencies often waste hours hunting down logos and brand data. See how Marketify reduces that to seconds — with batch uploads, asset management, and client branding tools.',
      category: 'UX/UI',
      authorAvatar: 'assets/author4.png'
    },
    {
      img: '/images/Image (1).jpg',
      author: 'John Smith',
      date: 'June 18, 2022',
      title: 'Boost Your Pitch Decks & Reports with Branded Content from Marketify',
      summary:'Learn how you can use Marketify to enhance investor decks, reports, or presentations by auto-embedding verified brand assets using only a company domain.',
      category: 'Design',
      authorAvatar: 'assets/author2.png'
    }
  ];

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
    // Immediate position to top before navigation
    this.resetScrollPosition();
    this.router.navigate(['/blog-details', actualIndex]);
  }

  navigateToBlogDetailsFromSidebar(categoryId: number): void {
    // Immediate position to top before navigation
    this.resetScrollPosition();
    this.router.navigate(['/blog-details', categoryId]);
  }

  private resetScrollPosition(): void {
    // Simple immediate positioning
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  trackByBlog(index: number, blog: BlogCard): string {
    return blog.title + index;
  }

  testPageClick(pageNumber: number): void {
    console.log('Test page click called with:', pageNumber);
    alert(`Page ${pageNumber} clicked!`);
  }
}
