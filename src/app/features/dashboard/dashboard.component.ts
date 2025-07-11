import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button'; // Import MatButtonModule
import { AuthService } from '../../core/services/auth.service'; // Adjust path as needed

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule // Add MatButtonModule here
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  private authService = inject(AuthService); // Inject AuthService

  logout(): void {
    this.authService.logout(); // Call the logout method from AuthService
  }
}
