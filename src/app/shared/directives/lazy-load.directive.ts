import { Directive, ElementRef, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';

@Directive({
  selector: '[appLazyLoad]',
  standalone: true
})
export class LazyLoadDirective implements OnInit, OnDestroy {
  @Output() lazyLoad = new EventEmitter<void>();

  private observer?: IntersectionObserver;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.lazyLoad.emit();
              this.observer?.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: '50px'
        }
      );

      this.observer.observe(this.elementRef.nativeElement);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.lazyLoad.emit();
    }
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}