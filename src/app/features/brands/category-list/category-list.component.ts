import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Brand {
  name: string;
  website: string;
  description: string;
  logo: string;
  verified?: boolean;
}

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.css'
})
export class CategoryListComponent implements OnInit {
  subcategory: string = '';
  subcategories: string[] = [
    'Animation and Comics',
    'Arts and Entertainment',
    'Books and Literature',
    'Humor',
    'Music',
    'Performing Arts',
    'TV Movies and Streaming',
    'Visual Arts and Design'
  ];
  brands: Brand[] = [];
  allBrands: { [key: string]: Brand[] } = {
    'Animation and Comics': [
      { name: 'Boords', website: 'boords.com', description: 'Our secure cloud-based software helps you quickly create storyboards and animatics, gather client...', logo: 'public/company/img1.svg', verified: true },
      { name: 'Aardman', website: 'aardman.com', description: 'Aardman is the world famous, four times Academy Award® winning animation studio, creators of...', logo: 'public/company/img2.svg' },
      { name: 'DNEG', website: 'dneg.com', description: 'DNEG is one of the world\'s leading visual effects and animation studios for feature film and...', logo: 'public/company/img3.svg' },
      { name: 'Framestore', website: 'framestore.com', description: 'Known globally for our visual effects, we have a proud history creating extraordinary images and...', logo: 'public/company/img4.svg' }
    ],
    // Add mock data for other subcategories as needed
  };

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.subcategory = params.get('subcategory') || this.subcategories[0];
      this.updateBrands();
    });
  }

  selectSubcategory(sub: string) {
    this.subcategory = sub;
    this.updateBrands();
  }

  updateBrands() {
    this.brands = this.allBrands[this.subcategory] || [];
  }

  goBack() {
    this.router.navigate(['/all-categories']);
  }
}
