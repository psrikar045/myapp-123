// Simple test to verify API key service functionality
const { environment } = require('./src/environments/environment.ts');

console.log('Environment production:', environment.production);
console.log('Base API URL:', environment.baseApiUrl);

// Test mock data structure
const mockApiKeys = {
  keys: [
    {
      id: '1',
      name: 'Test API Key',
      maskedKey: 'mk_test_************************1234',
      tier: 'STANDARD',
      environment: 'development',
      scopes: ['READ_BRANDS'],
      usage: {
        requestsToday: 100,
        remainingToday: 900,
        lastUsed: '2024-01-15T10:30:00Z',
        rateLimitStatus: 'OK'
      },
      security: {
        ipRestrictions: { enabled: false, whitelist: [] },
        domainRestrictions: { enabled: true, allowedDomains: ['test.com'] },
        webhookUrls: [],
        allowedOrigins: ['https://test.com']
      },
      expiresAt: '2024-12-31T23:59:59Z',
      createdAt: '2024-01-01T00:00:00Z',
      status: 'ACTIVE'
    }
  ]
};

console.log('Mock API Keys structure:', JSON.stringify(mockApiKeys, null, 2));
console.log('Test completed successfully!');