import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
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
  selector: 'app-blog-details',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './blog-details.component.html',
  styleUrl: './blog-details.component.css'
})
export class BlogDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  blogId: number = 0;
  selectedBlog: BlogCard | null = null;

  // Same blog data as in the blog component (ideally this would come from a service)
  blogs: BlogCard[] = [
    {
      img: '/images/image6.jpg',
      author: 'John Smithhh',
      date: 'August 18, 2022',
      title: 'Introducing Marketify: The Ultimate API to Access Brand Assets by Domain',
      category: 'Design',
      authorAvatar: 'assets/author2.png'
    }
    ,
    {
      img: '/images/image6.jpg',
      author: 'John Smith',
      date: 'August 18, 2022',
      title: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
      category: 'Design',
      authorAvatar: 'assets/author2.png'
    },
    {
      img: '/images/image6.jpg',
      author: 'Jane Doe',
      date: 'August 15, 2022',
      title: 'Another interesting blog post title goes here',
      category: 'Development',
      authorAvatar: 'assets/author3.png'
    },
    {
      img: '/images/image6.jpg',
      author: 'Mike Johnson',
      date: 'August 12, 2022',
      title: 'How to create amazing user experiences',
      category: 'UX/UI',
      authorAvatar: 'assets/author4.png'
    },
    {
      img: '/images/image6.jpg',
      author: 'John Smith',
      date: 'August 18, 2022',
      title: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
      category: 'Design',
      authorAvatar: 'assets/author2.png'
    },
    {
      img: '/images/image6.jpg',
      author: 'Tracey Wilson',
      date: 'August 20, 2022',
      title: '1. "Introducing Marketify: The Ultimate API to Access Brand Assets by Domain" Summary: Learn how Marketify simplifies brand asset retrieval with a powerful REST API, real-time caching, and developer-first features. Built on Java + Angular, it',
      category: 'Technology',
      authorAvatar: 'assets/author1.png'
    },
    {
      img: '/images/image6.jpg',
      author: 'John Smith',
      date: 'August 18, 2022',
      title: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
      category: 'Design',
      authorAvatar: 'assets/author2.png'
    },
    {
      img: '/images/image6.jpg',
      author: 'Jane Doe',
      date: 'August 15, 2022',
      title: 'Another interesting blog post title goes here',
      category: 'Development',
      authorAvatar: 'assets/author3.png'
    },
    {
      img: '/images/image6.jpg',
      author: 'Mike Johnson',
      date: 'August 12, 2022',
      title: 'How to create amazing user experiences',
      category: 'UX/UI',
      authorAvatar: 'assets/author4.png'
    },
    {
      img: '/images/image6.jpg',
      author: 'John Smith',
      date: 'August 18, 2022',
      title: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
      category: 'Design',
      authorAvatar: 'assets/author2.png'
    }
  ];

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

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.blogId = Number(params.get('id'));
      this.selectedBlog = this.blogs[this.blogId] || null;
    });
  }
}
