import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { CompanyDataComponent } from './company-data.component';
import { SearchModalService } from '../../shared';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { ToolbarService } from '../../shared/services/toolbar.service';

describe('CompanyDataComponent', () => {
  let component: CompanyDataComponent;
  let fixture: ComponentFixture<CompanyDataComponent>;
  let mockSearchModalService: any;

  beforeEach(async () => {
    const mockAuthService = {
      isAuthenticated$: of(false),
      currentUser$: of(null),
      logout: jest.fn()
    };

    const mockThemeService = {
      isDarkMode$: of(false),
      getIsDarkMode: jest.fn().mockReturnValue(false),
      toggleDarkMode: jest.fn()
    };

    const mockToolbarService = {
      navItems: of([]),
      actions: of([]),
      setLoggedOutToolbar: jest.fn()
    };

    mockSearchModalService = {
      hideModal: jest.fn(),
      showModal: jest.fn(),
      startBrandAnalysis: jest.fn(),
      completeBrandAnalysis: jest.fn(),
      modalState$: of({
        isVisible: false,
        config: null,
        progressSteps: [],
        currentStep: 0,
        progress: 0,
        isComplete: false
      })
    } as any;

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        CompanyDataComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        { provide: SearchModalService, useValue: mockSearchModalService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ThemeService, useValue: mockThemeService },
        { provide: ToolbarService, useValue: mockToolbarService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


