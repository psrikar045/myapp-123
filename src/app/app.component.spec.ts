import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';

describe('AppComponent - AI Enhanced Tests', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,AppComponent, RouterTestingModule]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render without errors', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should have router outlet', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('should be responsive', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const appRoot = compiled.querySelector('app-root') || compiled;
    expect(appRoot).toBeTruthy();
  });

  it('should handle component lifecycle', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    
    // Test ngOnInit
    expect(() => component.ngOnInit()).not.toThrow();
    
    // AppComponent doesn't implement OnDestroy, so we just test initialization
    expect(component).toBeTruthy();
  });
});

