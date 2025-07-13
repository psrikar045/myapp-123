import { Component } from '@angular/core';
import { HeaderComponent } from '../../features/header/header.component';

@Component({
  selector: 'app-search-api',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './search-api.component.html',
  styleUrl: './search-api.component.css'
})
export class SearchApiComponent {}
