import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../header/header.component';
import { FooterComponent } from '../../../shared/footer/footer.component';
import { ThemeService } from '../../../core/services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search-view',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './search-view.component.html',
  styleUrl: './search-view.component.css'
})
export class SearchViewComponent implements OnInit, OnDestroy {
  showBrandDetails = false;
  activeTab = 0;
  tabs = ['Company', 'Logo', 'Colors', 'Fonts', 'Images'];
  
  isDarkMode = false;
  private themeSubscription!: Subscription;
  private readonly themeService = inject(ThemeService);

  filters = ['All', 'Logos', 'Colors', 'Images', 'Font', 'Icons'];
  activeFilter = 'All';

  // Mock data for demonstration
  logos = [
    { src: 'assets/images/logo.svg', label: 'Logo', type: 'SVG' },
    { src: 'assets/images/logo.svg', label: 'Logo', type: 'SVG' },
    { src: 'assets/images/logo.svg', label: 'Logo', type: 'SVG' },
    { src: 'assets/images/logo.svg', label: 'Logo', type: 'SVG' },
    { src: 'assets/images/logo.svg', label: 'Instagram', type: 'SVG' }
  ];
  colors = [
    { color: '#1555DB', label: 'Primary' },
    { color: '#3F598A', label: 'Secondary' },
    { color: '#36B37E', label: 'Success' },
    { color: '#00BBD9', label: 'Info' },
    { color: '#FAAD13', label: 'Warning' },
    { color: '#F16141', label: 'Danger' },
    { color: '#183B56', label: '' },
    { color: '#5A7184', label: '' },
    { color: '#B3BAC5', label: '' },
    { color: '#FFFFFF', label: '' }
  ];
  // Add similar mock arrays for images, font, icons if needed

  ngOnInit(): void {
    this.themeSubscription = this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
    this.isDarkMode = this.themeService.getIsDarkMode();
  }

  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  onAnalyzeClick() {
    this.showBrandDetails = true;
  }

  setActiveTab(idx: number) {
    this.activeTab = idx;
  }

  setFilter(filter: string) {
    this.activeFilter = filter;
  }

  showSection(section: string): boolean {
    return this.activeFilter === 'All' || this.activeFilter === section;
  }
}
