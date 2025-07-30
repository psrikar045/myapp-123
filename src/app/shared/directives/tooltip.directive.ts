import { Directive, ElementRef, HostListener, Input, Renderer2, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective {
  private platformId = inject(PLATFORM_ID);
  @Input('appTooltip') tooltipText = '';
  @Input() placement: 'top' | 'bottom' | 'left' | 'right' = 'top';
  @Input() delay = 0;

  private tooltip?: HTMLElement;
  private offset = 10;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (!this.tooltipText) return;

    this.tooltip = this.renderer.createElement('div');
    this.renderer.appendChild(
      this.tooltip,
      this.renderer.createText(this.tooltipText)
    );

    this.renderer.appendChild(document.body, this.tooltip);
    this.renderer.addClass(this.tooltip, 'tooltip');
    this.renderer.addClass(this.tooltip, `tooltip-${this.placement}`);

    this.setPosition();
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (this.tooltip) {
      this.renderer.removeChild(document.body, this.tooltip);
      this.tooltip = undefined;
    }
  }

  private setPosition(): void {
    if (!this.tooltip) return;

    const hostPos = this.el.nativeElement.getBoundingClientRect();
    const tooltipPos = this.tooltip.getBoundingClientRect();
    const scrollPos = isPlatformBrowser(this.platformId) ? 
      (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0) : 0;

    let top: number, left: number;

    switch (this.placement) {
      case 'top':
        top = hostPos.top - tooltipPos.height - this.offset;
        left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;
        break;
      case 'bottom':
        top = hostPos.bottom + this.offset;
        left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;
        break;
      case 'left':
        top = hostPos.top + (hostPos.height - tooltipPos.height) / 2;
        left = hostPos.left - tooltipPos.width - this.offset;
        break;
      case 'right':
        top = hostPos.top + (hostPos.height - tooltipPos.height) / 2;
        left = hostPos.right + this.offset;
        break;
      default:
        top = hostPos.top - tooltipPos.height - this.offset;
        left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;
    }

    this.renderer.setStyle(this.tooltip, 'position', 'absolute');
    this.renderer.setStyle(this.tooltip, 'top', `${top + scrollPos}px`);
    this.renderer.setStyle(this.tooltip, 'left', `${left}px`);
  }
}