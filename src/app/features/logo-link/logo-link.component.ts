import { Component } from '@angular/core';
import { HeaderComponent } from '../../features/header/header.component';

@Component({
  selector: 'app-logo-link',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './logo-link.component.html',
  styleUrl: './logo-link.component.css'
})
export class LogoLinkComponent {}
