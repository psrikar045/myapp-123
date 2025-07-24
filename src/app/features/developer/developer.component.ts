import { AfterViewInit, Component, OnInit, Pipe, PipeTransform, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../layout/header/header.component';
import { ToolbarService } from '../../shared/services/toolbar.service';
import { AuthService } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';



@Component({
  selector: 'app-developer',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './developer.component.html',
  styleUrl: './developer.component.css'
})
export class DeveloperComponent implements AfterViewInit {
  isLoggedIn = false;

  login() {
    this.isLoggedIn = true;
  }

  logout() {
    this.isLoggedIn = false;
  }

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Animate feature cards on scroll
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.opacity = '1';
            (entry.target as HTMLElement).style.transform = 'translateY(0)';
          }
        });
      }, observerOptions);

      // Initially hide elements for animation
      const animateElements = document.querySelectorAll('.feature-card, .tool-card');
      animateElements.forEach(el => {
        (el as HTMLElement).style.opacity = '0';
        (el as HTMLElement).style.transform = 'translateY(20px)';
        (el as HTMLElement).style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
      });

      // Add typing effect to code editor
      const codeLines = document.querySelectorAll('.code-line');
      codeLines.forEach((line, index) => {
        (line as HTMLElement).style.opacity = '0';
        (line as HTMLElement).style.animation = `fadeInUp 0.3s ease forwards ${index * 0.1}s`;
      });

      // Add CSS animation keyframes
      const style = document.createElement('style');
      style.textContent = `
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `;
      document.head.appendChild(style);
    }
  }
}