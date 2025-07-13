import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { ThemeService } from '../../core/services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-company-data',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './company-data.component.html',
  styleUrl: './company-data.component.css'
})
export class CompanyDataComponent implements OnInit, OnDestroy {
  showBrandDetails = false;
  activeTab = 0;
  tabs = ['Company', 'Logo', 'Colors', 'Fonts', 'Images'];
  
  isDarkMode = false;
  private themeSubscription!: Subscription;
  private readonly themeService = inject(ThemeService);

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
}
