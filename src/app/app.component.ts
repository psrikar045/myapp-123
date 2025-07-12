import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common'; // For AsyncPipe
import { CoreModule } from './core/core.module'; // Imports SpinnerComponent
import { SpinnerService } from './core/services/spinner.service';
import { FooterComponent } from './shared/footer/footer.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, CoreModule, FooterComponent], // Add FooterComponent
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  constructor(public spinnerService: SpinnerService, private router: Router) {} // Inject Router

  isAuthRoute(): boolean {
    const url = this.router.url;
    return url.startsWith('/login') || url.startsWith('/reset-password');
  }
}
