import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-all-categories',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FormsModule],
  templateUrl: './all-categories.component.html',
  styleUrl: './all-categories.component.css'
})
export class AllCategoriesComponent {
  categories = [
    { label: 'All' },
    { label: 'Arts and Entertainment' },
    { label: 'Community and Society' },
    { label: 'E-commerce and Shopping' },
    { label: 'Food and Drink' },
    { label: 'Games' },
    { label: 'Heavy Industry and Engineering' },
    { label: 'Home and Garden' },
    { label: 'Law and Government' },
    { label: 'Luxury' },
    { label: 'Pets and Animals' },
    { label: 'Science and Education' },
    { label: 'Travel and Tourism' },
    { label: 'Business and Consumer Services' },
    { label: 'Computers Electronics and Technology' },
    { label: 'Finance' },
    { label: 'Gambling' },
    { label: 'Health' },
    { label: 'Hobbies and Leisure' },
    { label: 'Jobs and Career' },
    { label: 'Lifestyle' },
    { label: 'News and Media' },
    { label: 'Reference Materials' },
    { label: 'Sports' },
    { label: 'Vehicles' }
  ];
  selectedCategory = 'All';

  subCategoryMap: { [key: string]: string[] } = {
    'Arts and Entertainment': ['Music', 'Movies', 'Performing Arts', 'Visual Arts', 'Events'],
    'Community and Society': ['Nonprofits', 'Religion', 'Social Networks', 'Philanthropy'],
    'E-commerce and Shopping': ['Online Stores', 'Marketplaces', 'Coupons', 'Reviews'],
    'Food and Drink': ['Restaurants', 'Recipes', 'Beverages', 'Nutrition'],
    'Games': ['Video Games', 'Board Games', 'Mobile Games', 'Game Development'],
    'Heavy Industry and Engineering': ['Manufacturing', 'Construction', 'Mining', 'Energy'],
    'Home and Garden': ['Home Improvement', 'Gardening', 'Interior Design', 'DIY'],
    'Law and Government': ['Legal Services', 'Government Agencies', 'Politics', 'Public Safety'],
    'Luxury': ['Watches', 'Jewelry', 'Fashion', 'Travel'],
    'Pets and Animals': ['Pet Care', 'Animal Shelters', 'Wildlife', 'Pet Food'],
    'Science and Education': ['Schools', 'Universities', 'Research', 'Online Learning'],
    'Travel and Tourism': ['Destinations', 'Hotels', 'Flights', 'Travel Guides'],
    'Business and Consumer Services': ['Consulting', 'Marketing', 'Customer Service', 'B2B'],
    'Computers Electronics and Technology': ['Software', 'Hardware', 'Gadgets', 'Programming'],
    'Finance': ['Banking', 'Investing', 'Insurance', 'Personal Finance'],
    'Gambling': ['Casinos', 'Betting', 'Lotteries', 'Poker'],
    'Health': ['Fitness', 'Nutrition', 'Mental Health', 'Medical Services'],
    'Hobbies and Leisure': ['Collecting', 'Crafts', 'Outdoors', 'Photography'],
    'Jobs and Career': ['Job Search', 'Recruitment', 'Career Advice', 'Freelancing'],
    'Lifestyle': ['Fashion', 'Beauty', 'Relationships', 'Wellness'],
    'News and Media': ['News', 'Magazines', 'Podcasts', 'Broadcasting'],
    'Reference Materials': ['Dictionaries', 'Encyclopedias', 'Maps', 'Statistics'],
    'Sports': ['Football', 'Basketball', 'Tennis', 'Running'],
    'Vehicles': ['Cars', 'Motorcycles', 'Boats', 'Auto Parts']
  };

  allBrands = [
    { name: 'Google', user: 'google.com', color: '#ffe9b3', category: 'Technology' },
    { name: 'Slack', user: 'slack.com', color: '#e0ffe0', category: 'Productivity' },
    { name: 'Figma', user: 'figma.com', color: '#e0d6ff', category: 'Design' },
    { name: 'Spotify', user: 'spotify.com', color: '#d4f7d4', category: 'Music & Video' },
    { name: 'YouTube', user: 'youtube.com', color: '#ffe5e5', category: 'Music & Video' },
    { name: 'Notion', user: 'notion.so', color: '#f5f5f5', category: 'Productivity' },
    { name: 'Instagram', user: 'instagram.com', color: '#ffd1e3', category: 'Social Media' },
    { name: 'Twitter', user: 'twitter.com', color: '#e0f7fa', category: 'Social Media' },
    { name: 'Dropbox', user: 'dropbox.com', color: '#b3e0ff', category: 'Productivity' },
    { name: 'Adobe XD', user: 'adobe.com/xd', color: '#ffe0f0', category: 'Design' },
    { name: 'Discord', user: 'discord.com', color: '#d6eaff', category: 'Social Media' },
    { name: 'Trello', user: 'trello.com', color: '#b3c6e7', category: 'Productivity' },
    { name: 'Behance', user: 'behance.net', color: '#cce0ff', category: 'Design' },
    { name: 'Apple Music', user: 'music.apple.com', color: '#f3e6ff', category: 'Music & Video' },
    { name: 'GitHub', user: 'github.com', color: '#d3d3e7', category: 'Technology' },
    { name: 'Facebook', user: 'facebook.com', color: '#f0f0f0', category: 'Social Media' },
    { name: 'Zoom', user: 'zoom.us', color: '#b3e6ff', category: 'Productivity' },
    { name: 'Canva', user: 'canva.com', color: '#e0ffe0', category: 'Design' },
    { name: 'Netflix', user: 'netflix.com', color: '#ffe0e0', category: 'Music & Video' },
    { name: 'Microsoft Teams', user: 'teams.microsoft.com', color: '#b3c6e7', category: 'Productivity' },
    { name: 'SoundCloud', user: 'soundcloud.com', color: '#ffd6cc', category: 'Music & Video' },
    { name: 'Pinterest', user: 'pinterest.com', color: '#ffe0e0', category: 'Design' },
    { name: 'Snapchat', user: 'snapchat.com', color: '#fff6b3', category: 'Social Media' },
    { name: 'AWS', user: 'aws.amazon.com', color: '#f5f5f5', category: 'Technology' }
  ];

  searchTerm = '';
  filteredCategories = this.categories;

  get tags() {
    if (this.selectedCategory === 'All') return [];
    return this.subCategoryMap[this.selectedCategory] || [];
  }

  getDisplayTags(): string[] {
    if (!this.tags.length) return [];
    if (this.tags.length >= 10) return this.tags;
    // Repeat or generate placeholder subcategories to reach at least 10
    const result = [...this.tags];
    let i = 1;
    while (result.length < 10) {
      result.push(`${this.tags[result.length % this.tags.length]} ${i}`);
      i++;
    }
    return result;
  }

  get brands() {
    if (this.selectedCategory === 'All') {
      return this.allBrands;
    }
    return this.allBrands.filter(b => b.category === this.selectedCategory);
  }

  currentPage = 1;
  pageSize = 10;

  get pagedBrands() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.brands.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.brands.length / this.pageSize) || 1;
  }

  get pages() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  onSearch() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredCategories = this.categories;
    } else {
      this.filteredCategories = this.categories.filter(cat =>
        cat.label.toLowerCase().includes(term)
      );
    }
    // Optionally reset selection if not in filtered list
    if (!this.filteredCategories.some(cat => cat.label === this.selectedCategory)) {
      this.selectedCategory = this.filteredCategories.length ? this.filteredCategories[0].label : '';
    }
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.currentPage = 1;
    // Reset search and filtered categories to show all
    this.searchTerm = '';
    this.filteredCategories = this.categories;
  }

  selectPage(page: number) {
    this.currentPage = page;
  }

  subCategoryColors: { [key: string]: string } = {
    'Arts and Entertainment': '#fff7e6',
    'Community and Society': '#e6f7ff',
    'E-commerce and Shopping': '#f0fff4',
    'Food and Drink': '#fff0f6',
    'Games': '#f9f0ff',
    'Heavy Industry and Engineering': '#f6ffed',
    'Home and Garden': '#f0f5ff',
    'Law and Government': '#f9fafb',
    'Luxury': '#fffbe6',
    'Pets and Animals': '#f6fffa',
    'Science and Education': '#f0f5ff',
    'Travel and Tourism': '#e6fffb',
    'Business and Consumer Services': '#f0f5ff',
    'Computers Electronics and Technology': '#e6f7ff',
    'Finance': '#f6ffed',
    'Gambling': '#fff0f6',
    'Health': '#f0fff4',
    'Hobbies and Leisure': '#fffbe6',
    'Jobs and Career': '#f9fafb',
    'Lifestyle': '#fff7e6',
    'News and Media': '#f0f5ff',
    'Reference Materials': '#f9f0ff',
    'Sports': '#e6fffb',
    'Vehicles': '#f0f5ff'
  };

  getSubCardBgColor(): string {
    return this.subCategoryColors[this.selectedCategory] || '#fafbfc';
  }
}
