import { Directive, ElementRef, AfterViewInit, Input, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appAutoFocus]',
  standalone: true
})
export class AutoFocusDirective implements AfterViewInit {
  @Input() appAutoFocusDelay = 0; // Optional delay in ms, type inferred

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    @Inject(PLATFORM_ID) private platformId: object // Changed to object
  ) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.appAutoFocusDelay > 0) {
        setTimeout(() => this.focusElement(), this.appAutoFocusDelay);
      } else {
        this.focusElement();
      }
    }
  }

  private focusElement(): void {
    if (this.elementRef.nativeElement && typeof this.elementRef.nativeElement.focus === 'function') {
      this.elementRef.nativeElement.focus();
    }
  }
}
