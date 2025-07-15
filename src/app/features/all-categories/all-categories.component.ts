import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
  expandedCategory: string = 'All';
  selectedSubCategory: string = '';

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
    // Education
    { name: 'Google Drive', user: 'theshaaer', color: 'linear-gradient(135deg, #FFF6B7 0%, #F6416C 100%)', category: 'Education', subCategory: 'Resume' },
    { name: 'Github', user: 'theshaaer', color: 'linear-gradient(135deg, #232526 0%, #414345 100%)', category: 'Education', subCategory: 'Science' },
    { name: 'Behance', user: 'theshaaer', color: 'linear-gradient(135deg, #00C6FB 0%, #005BEA 100%)', category: 'Education', subCategory: 'Science' },
    { name: 'Instagram', user: 'theshaaer', color: 'linear-gradient(135deg, #F6416C 0%, #FFB199 100%)', category: 'Education', subCategory: 'Social media' },
    { name: 'Layers', user: 'theshaaer', color: 'linear-gradient(135deg, #232526 0%, #414345 100%)', category: 'Education', subCategory: 'Physics' },
    { name: 'Email', user: 'theshaaer', color: 'linear-gradient(135deg, #232526 0%, #005BEA 100%)', category: 'Education', subCategory: 'Math’s' },
    { name: 'Reddit', user: 'theshaaer', color: 'linear-gradient(135deg, #F6416C 0%, #FFB199 100%)', category: 'Education', subCategory: 'Social media' },
    { name: 'Discord', user: 'theshaaer', color: 'linear-gradient(135deg, #00C6FB 0%, #005BEA 100%)', category: 'Education', subCategory: 'Social media' },
    { name: 'Facebook', user: 'theshaaer', color: 'linear-gradient(135deg, #00C6FB 0%, #005BEA 100%)', category: 'Education', subCategory: 'Social media' },
    { name: 'Medium', user: 'theshaaer', color: 'linear-gradient(135deg, #e0e0e0 0%, #ffffff 100%)', category: 'Education', subCategory: 'Science' },
    { name: 'Twitter', user: 'theshaaer', color: 'linear-gradient(135deg, #232526 0%, #414345 100%)', category: 'Education', subCategory: 'Social media' },
    { name: 'Figma', user: 'theshaaer', color: 'linear-gradient(135deg, #232526 0%, #414345 100%)', category: 'Education', subCategory: 'Science' },
    // Entertainment
    { name: 'Netflix', user: 'netflix', color: 'linear-gradient(135deg, #e50914 0%, #221f1f 100%)', category: 'Entertainment', subCategory: 'Movie tickets' },
    { name: 'Spotify', user: 'spotify', color: 'linear-gradient(135deg, #1db954 0%, #191414 100%)', category: 'Entertainment', subCategory: 'Dance studios' },
    { name: 'YouTube', user: 'youtube', color: 'linear-gradient(135deg, #ff0000 0%, #282828 100%)', category: 'Entertainment', subCategory: 'Photograph' },
    // Games
    { name: 'Steam', user: 'steam', color: 'linear-gradient(135deg, #00c6fb 0%, #005bea 100%)', category: 'Games', subCategory: 'Video Games' },
    { name: 'Epic Games', user: 'epicgames', color: 'linear-gradient(135deg, #232526 0%, #414345 100%)', category: 'Games', subCategory: 'Board Games' },
    { name: 'Twitch', user: 'twitch', color: 'linear-gradient(135deg, #6441a5 0%, #2a0845 100%)', category: 'Games', subCategory: 'Mobile Games' },
    // Music & Video
    { name: 'Apple Music', user: 'applemusic', color: 'linear-gradient(135deg, #f3e6ff 0%, #ffb199 100%)', category: 'Music & Video', subCategory: 'Music' },
    { name: 'SoundCloud', user: 'soundcloud', color: 'linear-gradient(135deg, #ff5500 0%, #ffb199 100%)', category: 'Music & Video', subCategory: 'Music' },
    // Fitness
    { name: 'Fitbit', user: 'fitbit', color: 'linear-gradient(135deg, #00c6fb 0%, #005bea 100%)', category: 'Fitness', subCategory: 'Gyms' },
    { name: 'Nike Training', user: 'niketraining', color: 'linear-gradient(135deg, #232526 0%, #414345 100%)', category: 'Fitness', subCategory: 'Gyms' },
    // Hospitals
    { name: 'Mayo Clinic', user: 'mayoclinic', color: 'linear-gradient(135deg, #00c6fb 0%, #005bea 100%)', category: 'Hospitals', subCategory: 'General' },
    { name: 'Cleveland Clinic', user: 'clevelandclinic', color: 'linear-gradient(135deg, #232526 0%, #414345 100%)', category: 'Hospitals', subCategory: 'General' },
    // Add more as needed for other categories/subcategories
  ];

  searchTerm = '';
  filteredCategories = this.categories;

  constructor(private router: Router) {}

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

  // Filter brands by selected category and subcategory
  get brands() {
    if (this.selectedCategory === 'All') {
      return this.allBrands;
    }
    let filtered = this.allBrands.filter(b => b.category === this.selectedCategory);
    if (this.selectedSubCategory) {
      filtered = filtered.filter(b => b.subCategory === this.selectedSubCategory);
    }
    return filtered;
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
    this.selectedSubCategory = '';
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

  // When a subcategory is clicked, filter by it
  goToSubCategory(sub: string) {
    if (this.selectedCategory === 'All') {
      this.selectedSubCategory = '';
      return;
    }
    this.selectedSubCategory = sub;
    this.currentPage = 1;
  }

  // Accordion logic for sidebar
  toggleCategoryAccordion(category: string) {
    if (category === 'All') {
      this.expandedCategory = this.expandedCategory === 'All' ? '' : 'All';
      this.selectedSubCategory = '';
    } else {
      this.expandedCategory = this.expandedCategory === category ? '' : category;
      this.selectedSubCategory = '';
    }
  }

  // Explore categories button stub
  exploreCategories() {
    alert('Explore categories clicked!');
  }

  goToBrand(brand: any) {
    const brandName = encodeURIComponent(brand.name);
    this.router.navigate(['/search-view', brandName]);
  }
}
