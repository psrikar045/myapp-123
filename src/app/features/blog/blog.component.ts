import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToolbarService } from '../../shared/services/toolbar.service';
import { HeaderComponent } from '../header/header.component';
import { BlogCard } from '../../shared/interfaces/blog-card.interface';

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
  private cdr = inject(ChangeDetectorRef);
  // Pagination properties (matching AllCategoriesComponent)
  currentPage = 1;
  pageSize = 5; // 5 items per page as requested

  blogs: BlogCard[] = [
    {
      img: '/images/Image (1).jpg',
      author: 'Tracey Wilson',
      date: 'june 20, 2025',
      title: 'Introducing Marketify: The Ultimate API to Access Brand Assets by Domain',
      summary:'Learn how Marketify simplifies brand asset retrieval with a powerful REST API, real-time caching, and developer-first features. Built on Java + Angular, it’s faster and more flexible than Brandfetch.',
      category: 'Technology',
      authorAvatar: 'assets/author1.png'
    },
    {
      img: '/images/Image.jpg ',
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
      img: '/images/Image.jpg',
      author: 'John Smith',
      date: 'June 18, 2022',
      title: 'Boost Your Pitch Decks & Reports with Branded Content from Marketify',
      summary:'Learn how you can use Marketify to enhance investor decks, reports, or presentations by auto-embedding verified brand assets using only a company domain.',
      category: 'Design',
      authorAvatar: 'assets/author2.png'
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
      img: '/images/Image (3).jpg',
      author: 'John Smith',
      date: 'July 18, 2022',
      title: 'Behind the Scenes: How Marketify Builds a Fast, Accurate Brand Lookup Engine',
      summary:'Dive into the architecture of Marketify — including Java Spring Boot backend, PostgreSQL data modeling, caching, and asset delivery — built for performance.',
      category: 'Design',
      authorAvatar: 'assets/author2.jpg'
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
  }

  // Pagination methods (matching AllCategoriesComponent)
  get pagedBlogs() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.blogs.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.blogs.length / this.pageSize) || 1;
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
    this.router.navigate(['/blog-details', actualIndex]);
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
