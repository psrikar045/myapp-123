import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('authInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService, // Provide real AuthService or a mock
        provideHttpClient(withInterceptors([authInterceptor])),
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
    spyOn(authService, 'getToken').and.returnValue('test-token');

    httpClient.get('/test').subscribe();

    const httpRequest = httpMock.expectOne('/test');
    expect(httpRequest.request.headers.has('Authorization')).toEqual(true);
    expect(httpRequest.request.headers.get('Authorization')).toBe('Bearer test-token');
  });

  it('should not add an Authorization header when no token is present', () => {
    spyOn(authService, 'getToken').and.returnValue(null);

    httpClient.get('/test').subscribe();

    const httpRequest = httpMock.expectOne('/test');
    expect(httpRequest.request.headers.has('Authorization')).toEqual(false);
  });
});
