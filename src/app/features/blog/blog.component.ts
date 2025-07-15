import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarService } from '../../shared/services/toolbar.service';
import { Router } from '@angular/router';

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
  imports: [CommonModule],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css'
})
export class BlogComponent implements OnInit {
  private toolbar = inject(ToolbarService);
  private router = inject(Router);

  blogs: BlogCard[] = [
    {
      img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
      author: 'Tracey Wilson',
      date: 'August 20, 2022',
      title: 'The Impact of Technology on the Workplace: How Technology is Changing',
      category: 'Technology',
      authorAvatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
      author: 'Jason Francisco',
      date: 'August 20, 2022',
      title: 'How Cartoons Influence Modern Culture',
      category: 'Entertainment',
      authorAvatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      img: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
      author: 'Elizabeth Slavin',
      date: 'August 20, 2022',
      title: 'The Rise of Animation in the Digital Age',
      category: 'Animation',
      authorAvatar: 'https://randomuser.me/api/portraits/women/65.jpg'
    },
    {
      img: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80',
      author: 'Ernie Smith',
      date: 'August 20, 2022',
      title: 'Classic Cartoons: A Nostalgic Journey',
      category: 'Entertainment',
      authorAvatar: 'https://randomuser.me/api/portraits/men/43.jpg'
    },
    {
      img: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80',
      author: 'Eric Smith',
      date: 'August 20, 2022',
      title: 'Tex Avery: The Genius Behind the Laughter',
      category: 'Animation',
      authorAvatar: 'https://randomuser.me/api/portraits/men/36.jpg'
    },
    {
      img: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
      author: 'Tracey Wilson',
      date: 'August 20, 2022',
      title: 'The Impact of Technology on the Workplace: How Technology is Changing',
      category: 'Technology',
      authorAvatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
      author: 'Jason Francisco',
      date: 'August 20, 2022',
      title: 'Cartoon Classics Vol.1',
      category: 'Entertainment',
      authorAvatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
      author: 'Elizabeth Slavin',
      date: 'August 20, 2022',
      title: 'Donald Duck: The Iconic Character',
      category: 'Animation',
      authorAvatar: 'https://randomuser.me/api/portraits/women/65.jpg'
    },
    {
      img: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80',
      author: 'Ernie Smith',
      date: 'August 20, 2022',
      title: 'Gaming and Technology: The New Era',
      category: 'Technology',
      authorAvatar: 'https://randomuser.me/api/portraits/men/43.jpg'
    },
    {
      img: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80',
      author: 'Jason Francisco',
      date: 'August 20, 2022',
      title: 'Smart Devices in Everyday Life',
      category: 'Technology',
      authorAvatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      img: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
      author: 'Elizabeth Slavin',
      date: 'August 20, 2022',
      title: 'Travel and Leisure: The Best Destinations',
      category: 'Travel',
      authorAvatar: 'https://randomuser.me/api/portraits/women/65.jpg'
    },
    {
      img: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80',
      author: 'Ernie Smith',
      date: 'August 20, 2022',
      title: 'Gaming and Technology: The New Era',
      category: 'Technology',
      authorAvatar: 'https://randomuser.me/api/portraits/men/43.jpg'
    }
  ];

  ngOnInit(): void {
    this.toolbar.setLoggedOutToolbar();
  }
}
