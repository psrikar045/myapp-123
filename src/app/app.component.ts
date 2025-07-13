import { Component, OnInit } from '@angular/core';
import { NavigationEnd, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common'; // For AsyncPipe
import { CoreModule } from './core/core.module'; // Imports SpinnerComponent
import { SpinnerService } from './core/services/spinner.service';
import { FooterComponent } from './shared/footer/footer.component';
import { Router } from '@angular/router';
import { filter, map, Observable } from 'rxjs';
import { ToolbarService } from './shared/services/toolbar.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, CoreModule, FooterComponent], // Add FooterComponent
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  showFooter$: Observable<boolean>;
  constructor(public spinnerService: SpinnerService, private router: Router, private toolbarService: ToolbarService,) {
     // Initialize the showFooter$ observable from the service
    this.showFooter$ = this.toolbarService.showFooter$;
  } // Inject Router
ngOnInit() {
    // Logic to update footer visibility based on route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => (event as NavigationEnd).urlAfterRedirects)
    ).subscribe(url => {
      // Define routes where footer should be hidden (e.g., login, signup)
      const authRoutes = ['/login', '/reset-password', '/forgot-password', '/search', '/search-view', '/my-profile', '/home']; // Add more routes if needed
      const hideFooter = authRoutes.some(route => url.includes(route));
      this.toolbarService.setShowFooter(!hideFooter); // Update the service's state
    });
  }
  isAuthRoute(): boolean {
    const url = this.router.url;
    return url.startsWith('/login') || url.startsWith('/reset-password') || url.startsWith('/forgot-password');
  }
}
