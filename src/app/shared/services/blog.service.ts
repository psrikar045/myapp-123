import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BlogCard } from '../interfaces/blog-card.interface';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  // Centralized blog data
  private readonly blogs: BlogCard[] = [
    {
      img: 'assets/images/Image (1).jpg',
      author: 'Tracey Wilson',
      date: 'june 20, 2025',
      title: 'Introducing Marketify: The Ultimate API to Access Brand Assets by Domain',
      summary:'Learn how Marketify simplifies brand asset retrieval with a powerful REST API, real-time caching, and developer-first features. Built on Java + Angular, its faster and more flexible than Brandfetch.',
      category: 'Technology',
      authorAvatar: 'assets/author1.png'
    },
    {
      img: 'assets/images/Image.jpg ',
      author: 'John Smith',
      date: 'june 28, 2025',
      title: '5 Reasons Marketify Is the Perfect Alternative to Brandfetch',
      summary:' Tired of limitations or API bottlenecks with Brandfetch? Discover why Marketify is the next-gen brand intelligence tool your dev team will love — from API control to self-hosted flexibility.',
      category: 'Design',
      authorAvatar: 'assets/author2.png'
    },
    {
      img: 'assets/images/Image (2).jpg',
      author: 'july 20, 2025',
      date: 'August 15, 2022',
      title: 'How to Automatically Fetch Logos, Brand Colors & Fonts Using Marketify API',
      summary:'Step-by-step guide on how to integrate Marketify with your application and automatically pull visual brand assets from any domain in seconds.',
      category: 'Development',
      authorAvatar: 'assets/author3.png'
    },
    {
      img: 'assets/images/Image (3).jpg',
      author: 'Mike Johnson',
      date: 'june 20, 2025',
      title: 'Building a CRM That Auto-Fills Brand Profiles Using Marketify',
      summary:'Discover how to enrich your CRM by using Marketifys API to auto-fill company logos, industries, and social links — giving your sales and marketing teams an edge.',
      category: 'UX/UI',
      authorAvatar: 'assets/author4.png'
    },
    {
      img: 'assets/images/Image (1).jpg',
      author: 'John Smith',
      date: 'April 18, 2022',
      title: 'From Domain to Design: Using Marketify for Instant Brand Kits',
      summary:'Designers and marketers can now generate instant brand kits using just a domain. Learn how Marketify helps streamline your creative workflow.',
      category: 'Design',
      authorAvatar: 'assets/author2.png'
    },
    {
      img: 'assets/images/Image.jpg',
      author: 'Tracey Wilson',
      date: 'May 20, 2022',
      title: 'Developers, Heres How You Can Use Marketify in 5 Minutes or Less',
      summary:'A developer-focused quick-start tutorial on consuming Marketifys REST API using Java, Angular, or Postman — ideal for devs who want speed without bloated SDKs.',
      category: 'Technology',
      authorAvatar: 'assets/author1.png'
    },
    {
      img: 'assets/images/Image (1).jpg',
      author: 'John Smith',
      date: 'July 18, 2022',
      title: 'Behind the Scenes: How Marketify Builds a Fast, Accurate Brand Lookup Engine',
      summary:'Dive into the architecture of Marketify — including Java Spring Boot backend, PostgreSQL data modeling, caching, and asset delivery — built for performance.',
      category: 'Design',
      authorAvatar: 'assets/author2.jpg'
    },
    {
      img: 'assets/images/Image (2).jpg',
      author: 'Jane Doe',
      date: 'June 15, 2022',
      title: 'Marketify vs. Brandfetch: Detailed Feature-by-Feature Comparison (2025)',
      summary:'A clear comparison of pricing, speed, API structure, customization options, and integration capabilities between Marketify and Brandfetch.',
      category: 'Development',
      authorAvatar: 'assets/author3.png'
    },
    {
      img: 'assets/images/Image (3).jpg',
      author: 'Mike Johnson',
      date: 'July 12, 2022',
      title: 'How Agencies Can Save Hours with Marketifys Brand Asset Automation',
      summary:'Agencies often waste hours hunting down logos and brand data. See how Marketify reduces that to seconds — with batch uploads, asset management, and client branding tools.',
      category: 'UX/UI',
      authorAvatar: 'assets/author4.png'
    },
    {
      img: 'assets/images/Image.jpg',
      author: 'John Smith',
      date: 'June 18, 2022',
      title: 'Boost Your Pitch Decks & Reports with Branded Content from Marketify',
      summary:'Learn how you can use Marketify to enhance investor decks, reports, or presentations by auto-embedding verified brand assets using only a company domain.',
      category: 'Design',
      authorAvatar: 'assets/author2.png'
    },
    {
      img: 'assets/images/Image (1).jpg',
      author: 'John Smith',
      date: 'July 18, 2022',
      title: 'Behind the Scenes: How Marketify Builds a Fast, Accurate Brand Lookup Engine',
      summary:'Dive into the architecture of Marketify — including Java Spring Boot backend, PostgreSQL data modeling, caching, and asset delivery — built for performance.',
      category: 'Design',
      authorAvatar: 'assets/author2.jpg'
    },
    {
      img: 'assets/images/Image (3).jpg',
      author: 'John Smith',
      date: 'July 18, 2022',
      title: 'Behind the Scenes: How Marketify Builds a Fast, Accurate Brand Lookup Engine',
      summary:'Dive into the architecture of Marketify — including Java Spring Boot backend, PostgreSQL data modeling, caching, and asset delivery — built for performance.',
      category: 'Design',
      authorAvatar: 'assets/author2.jpg'
    }
  ];

  // Pagination context - stores info about current page
  private paginationContextSubject = new BehaviorSubject<{
    currentPage: number;
    pageSize: number;
    pagedBlogIds: number[];
  }>({
    currentPage: 1,
    pageSize: 5,
    pagedBlogIds: []
  });

  public paginationContext$ = this.paginationContextSubject.asObservable();

  // Get all blogs
  getAllBlogs(): BlogCard[] {
    return [...this.blogs];
  }

  // Get blog by index
  getBlog(index: number): BlogCard | null {
    return this.blogs[index] || null;
  }

  // Get paginated blogs
  getPagedBlogs(currentPage: number, pageSize: number): BlogCard[] {
    const start = (currentPage - 1) * pageSize;
    return this.blogs.slice(start, start + pageSize);
  }

  // Get total pages
  getTotalPages(pageSize: number): number {
    return Math.ceil(this.blogs.length / pageSize) || 1;
  }

  // Set pagination context (called from Blog component when navigating to details)
  setPaginationContext(currentPage: number, pageSize: number): void {
    const start = (currentPage - 1) * pageSize;
    const pagedBlogIds = Array.from({ length: pageSize }, (_, i) => start + i).filter(id => id < this.blogs.length);
    
    this.paginationContextSubject.next({
      currentPage,
      pageSize,
      pagedBlogIds
    });
  }

  // Get current pagination context
  getCurrentPaginationContext() {
    return this.paginationContextSubject.value;
  }
}