import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface SearchedBrand {
  name: string;
  url: string;
  searchedAt: Date;
  verified: boolean;
  icon?: string;
  domain?: string;
  favicon?: string;
  faviconError?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SearchHistoryService {
  private readonly maxHistoryItems = 10; // Limit history to 10 items
  private searchHistorySubject = new BehaviorSubject<SearchedBrand[]>([]);

  public searchHistory$: Observable<SearchedBrand[]> = this.searchHistorySubject.asObservable();

  constructor() {}

  /**
   * Add a new searched website to history
   */
  addToHistory(brandData: Partial<SearchedBrand> & { name: string; url: string }): void {
    const currentHistory = this.searchHistorySubject.value;
    
    // Check if URL already exists in history
    const existingIndex = currentHistory.findIndex(item => 
      item.url.toLowerCase() === brandData.url.toLowerCase() || 
      item.name.toLowerCase() === brandData.name.toLowerCase()
    );

    const searchedBrand: SearchedBrand = {
      name: brandData.name,
      url: brandData.url,
      domain: this.extractDomain(brandData.url),
      searchedAt: new Date(),
      verified: brandData.verified || false,
      icon: brandData.icon || this.generateIconFromName(brandData.name),
      favicon: brandData.favicon
    };

    let newHistory: SearchedBrand[];

    if (existingIndex !== -1) {
      // Update existing item and move to top
      newHistory = [searchedBrand, ...currentHistory.filter((_, index) => index !== existingIndex)];
    } else {
      // Add new item to top
      newHistory = [searchedBrand, ...currentHistory];
    }

    // Limit to max items
    if (newHistory.length > this.maxHistoryItems) {
      newHistory = newHistory.slice(0, this.maxHistoryItems);
    }

    this.searchHistorySubject.next(newHistory);
  }

  /**
   * Remove item from history by index
   */
  removeFromHistory(index: number): void {
    const currentHistory = this.searchHistorySubject.value;
    if (index >= 0 && index < currentHistory.length) {
      const newHistory = currentHistory.filter((_, i) => i !== index);
      this.searchHistorySubject.next(newHistory);
    }
  }

  /**
   * Clear all history
   */
  clearHistory(): void {
    this.searchHistorySubject.next([]);
  }

  /**
   * Get current history
   */
  getCurrentHistory(): SearchedBrand[] {
    return this.searchHistorySubject.value;
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  }

  /**
   * Generate a simple icon identifier from brand name
   */
  private generateIconFromName(name: string): string {
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleanName || 'generic';
  }

  /**
   * Check if a brand already exists in history
   */
  brandExists(name: string, url: string): boolean {
    const currentHistory = this.searchHistorySubject.value;
    return currentHistory.some(item => 
      item.name.toLowerCase() === name.toLowerCase() || 
      item.url.toLowerCase() === url.toLowerCase()
    );
  }

  /**
   * Get brand by name
   */
  getBrandByName(name: string): SearchedBrand | undefined {
    const currentHistory = this.searchHistorySubject.value;
    return currentHistory.find(item => item.name.toLowerCase() === name.toLowerCase());
  }

  /**
   * Update an existing brand's verification status
   */
  updateBrandVerification(name: string, verified: boolean): void {
    const currentHistory = this.searchHistorySubject.value;
    const updatedHistory = currentHistory.map(item => 
      item.name.toLowerCase() === name.toLowerCase() 
        ? { ...item, verified } 
        : item
    );
    this.searchHistorySubject.next(updatedHistory);
  }
}