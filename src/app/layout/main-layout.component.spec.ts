import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { MainLayoutComponent } from './main-layout.component';
import { SpinnerService } from '../core/services/spinner.service';
import { LayoutService } from '../core/services/layout.service';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let mockSpinnerService: jest.Mocked<Partial<SpinnerService>>;
  let mockLayoutService: jest.Mocked<Partial<LayoutService>>;

  beforeEach(() => {
    // Create mock objects
    mockSpinnerService = {
      loading$: of(false)
    };
    
    mockLayoutService = {
      showHeader$: of(true),
      showFooter$: of(true)
    };
    
    TestBed.configureTestingModule({
      providers: [
        { provide: SpinnerService, useValue: mockSpinnerService },
        { provide: LayoutService, useValue: mockLayoutService },
      ]
    });

    component = new MainLayoutComponent();
    // Manually inject the services
    component.spinnerService = mockSpinnerService as SpinnerService;
    component['layoutService'] = mockLayoutService as LayoutService;
   
    
    // Initialize observables
    component.showHeader$ = mockLayoutService.showHeader$!;
    component.showFooter$ = mockLayoutService.showFooter$!;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with light theme', () => {
    expect(component.currentTheme).toBe('light');
  });

  it('should have showHeader$ observable', () => {
    expect(component.showHeader$).toBeDefined();
    component.showHeader$.subscribe(value => {
      expect(value).toBe(true);
    });
  });

  it('should have showFooter$ observable', () => {
    expect(component.showFooter$).toBeDefined();
    component.showFooter$.subscribe(value => {
      expect(value).toBe(true);
    });
  });

  it('should destroy subject on component destroy', () => {
    const nextSpy = jest.spyOn(component['destroy$'], 'next');
    const completeSpy = jest.spyOn(component['destroy$'], 'complete');
    
    component.ngOnDestroy();
    
    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});