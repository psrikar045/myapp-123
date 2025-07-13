import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-company-data',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './company-data.component.html',
  styleUrl: './company-data.component.css'
})
export class CompanyDataComponent {
  showBrandDetails = false;
  activeTab = 0;
  tabs = ['Company', 'Logo', 'Colors', 'Fonts', 'Images'];

  onAnalyzeClick() {
    this.showBrandDetails = true;
  }

  setActiveTab(idx: number) {
    this.activeTab = idx;
  }
}
