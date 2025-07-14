// Example: How to use the Search Modal in any component

import { Component, inject } from '@angular/core';
import { SearchModalService } from './src/app/shared';
import { SearchModalComponent } from './src/app/shared/components/search-modal/search-modal.component';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [SearchModalComponent], // Import the modal component
  template: `
    <button (click)="startDefaultSearch()">Default Animation</button>
    <button (click)="startCardBasedSearch()">Card-based Animation</button>
    <button (click)="startMinimalistSearch()">Minimalist Animation</button>
    <app-search-modal></app-search-modal> <!-- Add the modal -->
  `
})
export class ExampleComponent {
  private searchModalService = inject(SearchModalService);

  startDefaultSearch() {
    // Default Animation - Original smooth progress
    this.searchModalService.showModal({
      url: 'https://example.com',
      title: '🔍 Default Search Animation',
      description: 'We are doing analysis with smooth progress...',
      estimatedTime: 'This will take 2-3 minutes...',
      isDarkMode: false,
      animationType: 'default'
    });

    this.simulateProgress();
  }

  startCardBasedSearch() {
    // Card-based Animation - Step-by-step progress cards
    this.searchModalService.showModal({
      url: 'https://example.com',
      title: '🎯 Brand Detective',
      description: 'We\'re investigating example.com for you!',
      estimatedTime: 'Estimated time: 3-5 minutes',
      isDarkMode: false,
      animationType: 'card-based'
    });

    this.simulateProgress();
  }

  startMinimalistSearch() {
    // Minimalist Animation - Clean circular progress with pulse
    this.searchModalService.showModal({
      url: 'https://example.com',
      title: '✨ Processing',
      description: 'Analyzing your request with precision...',
      estimatedTime: 'Usually takes 3-5 minutes',
      isDarkMode: false,
      animationType: 'minimalist'
    });

    this.simulateProgress();
  }

  private simulateProgress() {
    // Update progress during your process
    setTimeout(() => {
      this.searchModalService.updateProgress('URL Analysis complete...', 25);
    }, 1000);

    setTimeout(() => {
      this.searchModalService.updateProgress('Website check complete...', 50);
    }, 2000);

    setTimeout(() => {
      this.searchModalService.updateProgress('Brand extraction complete...', 75);
    }, 3000);

    setTimeout(() => {
      this.searchModalService.updateProgress('Data processing complete...', 100);
      
      // Hide modal when done
      setTimeout(() => {
        this.searchModalService.hideModal();
      }, 500);
    }, 4000);
  }

  // Toggle theme anytime
  toggleTheme() {
    this.searchModalService.toggleTheme();
  }

  // Set specific theme
  setDarkMode() {
    this.searchModalService.setTheme(true);
  }
}