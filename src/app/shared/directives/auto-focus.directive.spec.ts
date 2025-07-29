import { AutoFocusDirective } from './auto-focus.directive';
import { ElementRef } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';

describe('AutoFocusDirective', () => {
  let elementRefMock: ElementRef;
  let platformIdMock: Object;

  beforeEach(() => {
    // Mock ElementRef
    const mockNativeElement = {
      focus: jest.fn()
    };
    elementRefMock = {
      nativeElement: mockNativeElement
    } as any; // Use 'as any' to simplify mock structure for ElementRef<HTMLElement>

    // Mock PLATFORM_ID (typically 'browser' or 'server')
    // platformIdMock will be set per test or as a general 'browser'
  });

  it('should create an instance', () => {
    const directive = new AutoFocusDirective(elementRefMock, 'browser' as unknown as object);
    expect(directive).toBeTruthy();
  });

  it('should call focus on ngAfterViewInit if in browser', () => {
    const directive = new AutoFocusDirective(elementRefMock, 'browser' as unknown as object);
    directive.ngAfterViewInit();
    expect(elementRefMock.nativeElement.focus).toHaveBeenCalled();
  });

  it('should not call focus on ngAfterViewInit if not in browser', () => {
    const directive = new AutoFocusDirective(elementRefMock, 'server' as unknown as object);
    directive.ngAfterViewInit();
    expect(elementRefMock.nativeElement.focus).not.toHaveBeenCalled();
  });

  it('should call focus after delay if appAutoFocusDelay is set', (done) => {
    const directive = new AutoFocusDirective(elementRefMock, 'browser' as unknown as object);
    directive.appAutoFocusDelay = 10;
    directive.ngAfterViewInit();
    expect(elementRefMock.nativeElement.focus).not.toHaveBeenCalled(); // Should not be called immediately
    setTimeout(() => {
      expect(elementRefMock.nativeElement.focus).toHaveBeenCalled();
      done();
    }, 20); // Wait a bit longer than the delay
  });
});

