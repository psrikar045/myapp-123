import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent {
 constructor(private router: Router) {}

  brands = [
    {
      name: 'Apple',
      icon: 'apple', // placeholder, using inline SVG in template
      verified: true
    }
  ];

  clearAll() {
    this.brands = [];
  }

  removeBrand(index: number) {
    this.brands.splice(index, 1);
  }

  goToResults(brand: string) {
    this.router.navigate(['/search-view', brand.toLowerCase()]);
  }
}
