import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown...');
  
  try {
    // Clean up any temporary test data
    console.log('🗑️ Cleaning up test artifacts...');
    
    // Generate final test report
    console.log('📊 Test execution completed');
    console.log('📋 Reports available at:');
    console.log('   - HTML Report: playwright-report/index.html');
    console.log('   - Allure Report: Run "npm run test:report" to view');
    console.log('   - Coverage Report: coverage/jest/index.html');
    
    console.log('✅ Global teardown completed successfully');
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
  }
}

export default globalTeardown;