import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[appInfiniteScroll]',
  standalone: true
})
export class InfiniteScrollDirective {
  @Input() threshold = 100;
  @Input() throttle = 300;
  @Output() scrolled = new EventEmitter<void>();

  private lastScrollTime = 0;

  constructor(private el: ElementRef) {}

  @HostListener('scroll', ['$event'])
  onScroll(): void {
    const now = Date.now();
    if (now - this.lastScrollTime < this.throttle) {
      return;
    }

    this.lastScrollTime = now;

    const element = this.el.nativeElement;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const offsetHeight = element.offsetHeight;

    if (scrollTop + offsetHeight + this.threshold >= scrollHeight) {
      this.scrolled.emit();
    }
  }
}