import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import { SearchModalService, SearchModalState } from '../../services/search-modal.service';

@Component({
  selector: 'app-search-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-modal.component.html',
  styleUrls: ['./search-modal.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(-30px) scale(0.9)', opacity: 0 }),
        animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)', 
               style({ transform: 'translateY(0) scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', 
               style({ transform: 'translateY(-30px) scale(0.9)', opacity: 0 }))
      ])
    ])
  ]
})
export class SearchModalComponent implements OnInit, OnDestroy {
  modalState: SearchModalState = {
    isVisible: false,
    progress: 0,
    currentStep: '',
    config: null,
    progressSteps: []
  };

  private destroy$ = new Subject<void>();

  constructor(public searchModalService: SearchModalService) {}

  ngOnInit(): void {
    this.searchModalService.modalState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.modalState = state;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onToggleTheme(): void {
    this.searchModalService.toggleTheme();
  }

  onCloseModal(): void {
    // Optionally allow manual close (you can disable this for mandatory operations)
    // this.searchModalService.hideModal();
  }

  getThemeClass(): string {
    return this.modalState.config?.isDarkMode ? 'dark-theme' : 'light-theme';
  }

  getProgressColor(): string {
    if (this.modalState.config?.isDarkMode) {
      return 'linear-gradient(90deg, #60a5fa, #a855f7)';
    }
    return 'linear-gradient(90deg, #3b82f6, #8b5cf6)';
  }

  getElapsedTime(): string {
    // You can add elapsed time calculation here if needed
    return '';
  }

  // Check if current animation type is card-based
  isCardBasedAnimation(): boolean {
    return this.modalState.config?.animationType === 'card-based';
  }

  // Check if current animation type is minimalist
  isMinimalistAnimation(): boolean {
    return this.modalState.config?.animationType === 'minimalist';
  }

  // Check if current animation type is default
  isDefaultAnimation(): boolean {
    return this.modalState.config?.animationType === 'default' || !this.modalState.config?.animationType;
  }

  // Get status icon for progress steps
  getStepStatusIcon(status: string): string {
    switch (status) {
      case 'complete':
        return '✅';
      case 'in-progress':
        return '🔄';
      case 'pending':
      default:
        return '⏳';
    }
  }

  // Get status text for progress steps
  getStepStatusText(status: string): string {
    switch (status) {
      case 'complete':
        return 'Complete';
      case 'in-progress':
        return 'In Progress';
      case 'pending':
      default:
        return 'Pending';
    }
  }
}