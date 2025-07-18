import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogCard } from '../../shared/interfaces/blog-card.interface';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-blog-details',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './blog-details.component.html',
  styleUrl: './blog-details.component.css'
})
export class BlogDetailsComponent implements OnInit {
  selectedBlog: BlogCard | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
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

  // Blog data - same as in BlogComponent
  blogs: BlogCard[] = [
    {
      img: '/images/Image (1).jpg',
      author: 'Tracey Wilson',
      date: 'june 20, 2025',
      title: 'Introducing Marketify: The Ultimate API to Access Brand Assets by Domain',
      summary: 'Learn how Marketify simplifies brand asset retrieval with a powerful REST API, real-time caching, and developer-first features. Built on Java + Angular, it is faster and more flexible than Brandfetch.',
      category: 'Technology',
      authorAvatar: 'assets/author1.png'
    },
    {
      img: '/images/Image.jpg',
      author: 'John Smith',
      date: 'june 28, 2025',
      title: '5 Reasons Marketify Is the Perfect Alternative to Brandfetch',
      summary: 'Tired of limitations or API bottlenecks with Brandfetch? Discover why Marketify is the next-gen brand intelligence tool your dev team will love — from API control to self-hosted flexibility.',
      category: 'Design',
      authorAvatar: 'assets/author2.png'
    },
    {
      img: '/images/Image (2).jpg',
      author: 'july 20, 2025',
      date: 'August 15, 2022',
      title: 'How to Automatically Fetch Logos, Brand Colors & Fonts Using Marketify API',
      summary: 'Step-by-step guide on how to integrate Marketify with your application and automatically pull visual brand assets from any domain in seconds.',
      category: 'Development',
      authorAvatar: 'assets/author3.png'
    },
    {
      img: '/images/Image (3).jpg',
      author: 'Mike Johnson',
      date: 'june 20, 2025',
      title: 'Building a CRM That Auto-Fills Brand Profiles Using Marketify',
      summary: 'Discover how to enrich your CRM by using Marketify API to auto-fill company logos, industries, and social links — giving your sales and marketing teams an edge.',
      category: 'UX/UI',
      authorAvatar: 'assets/author4.png'
    },
    {
      img: '/images/Image (1).jpg',
      author: 'John Smith',
      date: 'April 18, 2022',
      title: 'From Domain to Design: Using Marketify for Instant Brand Kits',
      summary: 'Designers and marketers can now generate instant brand kits using just a domain. Learn how Marketify helps streamline your creative workflow.',
      category: 'Design',
      authorAvatar: 'assets/author2.png'
    }
  ];

  ngOnInit(): void {
    // Get the blog ID from route parameters
    this.route.params.subscribe(params => {
      const blogId = +params['id'];
      this.selectedBlog = this.blogs[blogId] || this.blogs[0];
    });
    
    // Force scroll to top when component initializes
    this.forceTopPosition();
  }

  onBackToList(): void {
    this.router.navigate(['/blog']);
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