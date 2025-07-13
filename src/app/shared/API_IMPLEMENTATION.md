# Swagger API Implementation

This document describes the comprehensive implementation of the Swagger API endpoints in the Angular application.

## Overview

The implementation includes:
- Complete API service based on Swagger documentation
- Enhanced authentication service with new endpoints
- Specialized services for different API categories
- Improved HTTP interceptor with error handling and token refresh
- Proper module organization with HttpClient in SharedModule

## Architecture

### Module Structure

```
CoreModule
├── imports: [SharedModule]
├── services: [AuthService, ApiService, ...]
└── interceptors: [authInterceptor]

SharedModule
├── imports: [HttpClientModule]
├── exports: [HttpClientModule]
└── services: [UserAuthService, BrandApiService, IdGeneratorApiService, ...]
```

### Services Overview

1. **UserAuthService** - Main API service implementing authentication endpoints
2. **BrandApiService** - API service for brand data operations
3. **IdGeneratorApiService** - API service for ID generation endpoints
4. **TfaService** - Two-factor authentication service
5. **ProtectedResourceService** - Service for protected resource access
6. **ApiConfigService** - Configuration service for API endpoints

## API Endpoints Implementation

### Authentication Endpoints

| Endpoint | Method | Implementation | Description |
|----------|--------|----------------|-------------|
| `/auth/login/email` | POST | ✅ | Email-based login |
| `/auth/login/username` | POST | ✅ | Username-based login |
| `/auth/login` | POST | ✅ | Legacy login endpoint |
| `/auth/token` | POST | ✅ | Generate authentication token |
| `/auth/register` | POST | ✅ | User registration |
| `/auth/refresh` | POST | ✅ | Token refresh |
| `/auth/profile` | PUT | ✅ | Update user profile |
| `/auth/forgot-password` | POST | ✅ | Initiate password reset |
| `/auth/verify-reset-code` | POST | ✅ | Verify reset code |
| `/auth/set-new-password` | POST | ✅ | Set new password |
| `/auth/verify-email` | GET | ✅ | Email verification |
| `/auth/google` | POST | ✅ | Google Sign-In |
| `/auth/username-exists` | GET | ✅ | Check username existence |
| `/auth/check-email` | POST | ✅ | Check email existence |

### Two-Factor Authentication

| Endpoint | Method | Implementation | Description |
|----------|--------|----------------|-------------|
| `/auth/tfa/setup` | POST | ✅ | Setup 2FA |
| `/auth/tfa/enable` | POST | ✅ | Enable 2FA |
| `/auth/tfa/disable` | POST | ✅ | Disable 2FA |
| `/auth/tfa/verify` | POST | ✅ | Verify 2FA code |
| `/auth/tfa/qr-code` | GET | ✅ | Get QR code |
| `/auth/tfa/current-code` | GET | ✅ | Get current TOTP |

### Brand Data Endpoints

| Endpoint | Method | Implementation | Description |
|----------|--------|----------------|-------------|
| `/api/brands` | GET | ✅ | Get all brands (paginated) |
| `/api/brands/{id}` | GET | ✅ | Get brand by ID |
| `/api/brands/search` | GET | ✅ | Search brands |
| `/api/brands/by-website` | GET | ✅ | Get brand by website |
| `/api/brands/by-name` | GET | ✅ | Get brand by name |
| `/api/brands/by-domain` | GET | ✅ | Get brands by domain |
| `/api/brands/statistics` | GET | ✅ | Get brand statistics |
| `/api/brands/{id}/claim` | PUT | ✅ | Claim a brand |
| `/api/brands/extract` | POST | ✅ | Extract brand data |
| `/api/brands/assets/{assetId}` | GET | ✅ | Serve brand asset |
| `/api/brands/images/{imageId}` | GET | ✅ | Serve brand image |

### ID Generator Endpoints

| Endpoint | Method | Implementation | Description |
|----------|--------|----------------|-------------|
| `/api/id-generator/generate` | POST | ✅ | Generate ID (default prefix) |
| `/api/id-generator/generate/{prefix}` | POST | ✅ | Generate ID (custom prefix) |
| `/api/id-generator/user-id/generate` | POST | ✅ | Generate DOMBR user ID |
| `/api/id-generator/user-id/simple` | GET | ✅ | Generate simple user ID |
| `/api/id-generator/preview` | GET | ✅ | Preview next ID |
| `/api/id-generator/prefixes` | GET | ✅ | Get all prefixes |
| `/api/id-generator/current/{prefix}` | GET | ✅ | Get current number |
| `/api/id-generator/reset/{prefix}` | POST | ✅ | Reset sequence |

### Protected Resources

| Endpoint | Method | Implementation | Description |
|----------|--------|----------------|-------------|
| `/api/protected` | GET | ✅ | Access protected resource |

## Authentication & Authorization

### Headers Required

1. **Authorization Header**: `Bearer <jwt_token>`
   - Required for all protected endpoints
   - Automatically added by the auth interceptor

2. **X-Brand-Id Header**: `<brand_id>`
   - Required for multi-tenant endpoints
   - Automatically added for relevant endpoints

### Token Management

- **Access Token**: Stored in localStorage as `jwt_token`
- **Refresh Token**: Stored in localStorage as `refresh_token`
- **Brand ID**: Stored in localStorage as `brand_id`
- **Automatic Refresh**: Handled by auth interceptor on 401 errors

## Usage Examples

### Basic Authentication

```typescript
// Email login
this.authService.loginWithEmailSwagger('user@example.com', 'password').subscribe({
  next: (response) => console.log('Login successful', response),
  error: (error) => console.error('Login failed', error)
});

// Username login
this.authService.loginWithUsernameSwagger('username', 'password').subscribe({
  next: (response) => console.log('Login successful', response),
  error: (error) => console.error('Login failed', error)
});
```

### Brand Operations

```typescript
// Get all brands
this.brandService.getAllBrands(0, 20).subscribe({
  next: (brands) => console.log('Brands:', brands),
  error: (error) => console.error('Error:', error)
});

// Search brands
this.brandService.searchBrands('technology').subscribe({
  next: (results) => console.log('Search results:', results),
  error: (error) => console.error('Search failed:', error)
});
```

### ID Generation

```typescript
// Generate ID with custom prefix
this.idGeneratorService.generateNextIdWithPrefix('MKTY').subscribe({
  next: (id) => console.log('Generated ID:', id),
  error: (error) => console.error('Generation failed:', error)
});
```

### Two-Factor Authentication

```typescript
// Setup 2FA
this.tfaService.setupTfa('username').subscribe({
  next: (response) => console.log('2FA setup:', response),
  error: (error) => console.error('Setup failed:', error)
});

// Get QR code
this.tfaService.getTfaQrCode('username').subscribe({
  next: (blob) => {
    // Convert to data URL for display
    this.tfaService.createQrCodeDataUrl(blob).then(dataUrl => {
      // Display QR code
    });
  }
});
```

## Error Handling

The implementation includes comprehensive error handling:

1. **HTTP Interceptor**: Handles 401 errors with automatic token refresh
2. **Service Level**: Each service has proper error handling with user-friendly messages
3. **Component Level**: Examples show how to handle different error scenarios

### Common Error Scenarios

- **401 Unauthorized**: Automatic token refresh or redirect to login
- **403 Forbidden**: Access denied message
- **404 Not Found**: Resource not found message
- **400 Bad Request**: Validation error messages
- **500 Server Error**: Generic server error message

## Configuration

### Environment Variables

```typescript
// environment.ts
export const environment = {
  production: true,
  baseApiUrl: 'http://202.65.155.125:8080/myapp',
  logLevel: 'error',
  appVersion: '0.0.1'
};
```

### API Configuration Service

The `ApiConfigService` provides centralized configuration for all endpoints:

```typescript
// Get authentication endpoints
const authEndpoints = this.apiConfigService.getAuthEndpoints();

// Check if endpoint requires authentication
const requiresAuth = this.apiConfigService.requiresAuthentication(url);

// Check if endpoint requires brand ID
const requiresBrandId = this.apiConfigService.requiresBrandId(url);
```

## Security Considerations

1. **Token Storage**: Tokens are stored in localStorage with platform checks
2. **HTTPS**: All API calls should use HTTPS in production
3. **Token Expiration**: Automatic token refresh prevents expired token issues
4. **Brand Isolation**: Multi-tenant support with brand ID headers
5. **Input Validation**: All user inputs are validated before API calls

## Testing

### Unit Tests

Each service includes comprehensive unit tests:

```bash
ng test
```

### Integration Tests

Test the complete flow with real API endpoints:

```bash
ng e2e
```

### API Testing

Use the provided examples in `api-usage.example.ts` to test API functionality.

## Deployment Considerations

1. **Environment Configuration**: Update `baseApiUrl` for different environments
2. **CORS**: Ensure backend allows requests from your domain
3. **SSL Certificates**: Use HTTPS in production
4. **Rate Limiting**: Be aware of API rate limits
5. **Error Monitoring**: Implement proper error logging and monitoring

## Maintenance

### Adding New Endpoints

1. Update the Swagger API models in `api.models.ts`
2. Add the endpoint to the appropriate API service (`UserAuthService`, `BrandApiService`, etc.)
3. Create specialized service if needed
4. Update the interceptor if special handling is required
5. Add usage examples

### Updating Existing Endpoints

1. Update the models if response structure changes
2. Update the service method implementation
3. Update any dependent services
4. Test thoroughly

## Support

For issues or questions:

1. Check the Swagger documentation: `http://202.65.155.125:8080/myapp/swagger-ui/index.html`
2. Review the API usage examples in `api-usage.example.ts`
3. Check the browser console for detailed error messages
4. Verify authentication tokens and brand ID headers

## Changelog

### Version 1.0.0
- Initial implementation of all Swagger API endpoints
- Complete authentication flow with token refresh
- Multi-tenant support with brand ID headers
- Comprehensive error handling
- Specialized services for different API categories
- Full TypeScript type safety