export const environment = {
  production: false,
  baseApiUrl: 'http://202.65.155.125:8080/myapp',// deployed
  // baseApiUrl: 'http://localhost:8080/myapp',// local
  logLevel: 'error', // Typically 'error' or 'warn' for production
  appVersion: '0.0.1',
  
  // Theme System Configuration
  theme: {
    enableAdvancedTheme: true,
    enableDeviceCompatibility: true,
    enableCustomColors: true,
    enableThemePresets: true,
    requireAuthentication: true // Theme features only available after login
  }
};
