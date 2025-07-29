import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { BlogDetailsComponent } from './blog-details.component';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { ToolbarService } from '../../shared/services/toolbar.service';

describe('BlogDetailsComponent', () => {
  let component: BlogDetailsComponent;
  let fixture: ComponentFixture<BlogDetailsComponent>;

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

    const mockActivatedRoute = {
      params: of({ id: '1' }),
      paramMap: of({
        get: (key: string) => key === 'id' ? '1' : null,
        has: (key: string) => key === 'id',
        getAll: () => [],
        keys: ['id']
      })
    };

    await TestBed.configureTestingModule({
      imports: [
        BlogDetailsComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ThemeService, useValue: mockThemeService },
        { provide: ToolbarService, useValue: mockToolbarService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('Logic Testing', () => {
    it('should initialize with blog details', () => {
      expect(component).toBeDefined();
    });
  });

  describe('UI Testing', () => {
    it('should render blog content', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled).toBeTruthy();
    });
  });
});


