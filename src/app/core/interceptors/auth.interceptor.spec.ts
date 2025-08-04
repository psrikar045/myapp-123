import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

describe('authInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let authService: AuthService;
  let mockRouter: any;

  beforeEach(() => {
    mockRouter = {
      navigate: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: {
            getToken: jest.fn(),
            getBrandId: jest.fn(),
            getRefreshToken: jest.fn(),
            refreshToken: jest.fn(),
            logout: jest.fn(),
          },
        },
        { provide: Router, useValue: mockRouter },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add an Authorization header when a token is present', () => {
    (authService.getToken as jest.Mock).mockReturnValue('test-token');
    (authService.getBrandId as jest.Mock).mockReturnValue(null);

    httpClient.get('/api/protected/test').subscribe();

    const httpRequest = httpMock.expectOne('/api/protected/test');
    expect(httpRequest.request.headers.has('Authorization')).toEqual(true);
    expect(httpRequest.request.headers.get('Authorization')).toBe('Bearer test-token');
    httpRequest.flush({});
  });

  it('should not add an Authorization header when no token is present', () => {
    (authService.getToken as jest.Mock).mockReturnValue(null);
    (authService.getBrandId as jest.Mock).mockReturnValue(null);

    httpClient.get('/api/protected/test').subscribe();

    const httpRequest = httpMock.expectOne('/api/protected/test');
    expect(httpRequest.request.headers.has('Authorization')).toEqual(false);
    httpRequest.flush({});
  });

  it('should not add headers for public URLs', () => {
    (authService.getToken as jest.Mock).mockReturnValue('test-token');
    (authService.getBrandId as jest.Mock).mockReturnValue(null);

    httpClient.get('/auth/login').subscribe();

    const httpRequest = httpMock.expectOne('/auth/login');
    expect(httpRequest.request.headers.has('Authorization')).toEqual(false);
    httpRequest.flush({});
  });
});

