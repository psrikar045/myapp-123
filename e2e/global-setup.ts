import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup for AI-enhanced testing...');
  
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('⏳ Waiting for Angular application to be ready...');
    await page.goto('http://localhost:4200', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    // Wait for Angular to bootstrap
    await page.waitForFunction(() => {
      return window.hasOwnProperty('ng') || document.querySelector('app-root');
    }, { timeout: 30000 });
    
    console.log('✅ Angular application is ready for testing');
    
    // Create test data directories
    const fs = require('fs');
    const path = require('path');
    
    const dirs = [
      'e2e/.auth',
      'e2e/screenshots',
      'e2e/test-data',
      'allure-results',
      'playwright-report'
    ];
    
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

export default globalSetup;