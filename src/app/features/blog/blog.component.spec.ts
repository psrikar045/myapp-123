import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { BlogComponent } from './blog.component';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { ToolbarService } from '../../shared/services/toolbar.service';

describe('BlogComponent', () => {
  let component: BlogComponent;
  let fixture: ComponentFixture<BlogComponent>;

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

    await TestBed.configureTestingModule({
      imports: [
        BlogComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ThemeService, useValue: mockThemeService },
        { provide: ToolbarService, useValue: mockToolbarService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


