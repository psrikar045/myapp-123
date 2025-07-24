/**
 * Test Documentation and Artifact Management
 * Enhanced video recording and screenshot capture for team presentations
 */

import { test, expect, Page } from '@playwright/test';
import { promises as fs } from 'fs';
import * as path from 'path';

export class TestDocumentation {
  
  /**
   * Capture screenshot with descriptive name for team documentation
   */
  static async captureTestStep(page: Page, stepName: string, testName: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${testName}-${stepName}-${timestamp}.png`;
    
    await page.screenshot({ 
      path: `test-results/screenshots/${fileName}`,
      fullPage: true 
    });
    
    console.log(`📸 Screenshot captured: ${fileName}`);
  }

  /**
   * Start video recording for test execution documentation
   */
  static async startVideoRecording(page: Page, testName: string) {
    // Video recording is automatically handled by Playwright config
    // This function logs the start for documentation
    console.log(`🎬 Video recording started for: ${testName}`);
  }

  /**
   * Log test step for comprehensive documentation
   */
  static async logTestStep(step: string, status: 'START' | 'SUCCESS' | 'WARNING' | 'ERROR' = 'START') {
    const timestamp = new Date().toISOString();
    const statusIcon = {
      'START': '🚀',
      'SUCCESS': '✅', 
      'WARNING': '⚠️',
      'ERROR': '❌'
    }[status];
    
    console.log(`${statusIcon} [${timestamp}] ${step}`);
  }

  /**
   * Create test summary for team presentation
   */
  static async createTestSummary(testResults: any) {
    const summaryPath = 'test-results/test-execution-summary.json';
    
    const summary = {
      timestamp: new Date().toISOString(),
      totalTests: testResults.totalTests,
      passedTests: testResults.passedTests,
      failedTests: testResults.failedTests,
      skippedTests: testResults.skippedTests,
      executionTime: testResults.executionTime,
      browsers: testResults.browsers,
      artifactsGenerated: {
        videos: true,
        screenshots: true,
        htmlReport: true,
        traces: true
      }
    };
    
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`📋 Test summary created: ${summaryPath}`);
  }

  /**
   * Enhanced error documentation with context
   */
  static async documentFailure(page: Page, error: Error, testName: string, step: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Capture failure screenshot
    await page.screenshot({ 
      path: `test-results/failures/${testName}-${step}-failure-${timestamp}.png`,
      fullPage: true 
    });
    
    // Capture page context
    const pageContent = await page.content();
    const contextPath = `test-results/failures/${testName}-${step}-context-${timestamp}.html`;
    await fs.writeFile(contextPath, pageContent);
    
    // Log detailed failure information
    const failureInfo = {
      testName,
      step,
      timestamp,
      error: error.message,
      stack: error.stack,
      url: page.url(),
      artifacts: {
        screenshot: `${testName}-${step}-failure-${timestamp}.png`,
        context: `${testName}-${step}-context-${timestamp}.html`
      }
    };
    
    const failureLogPath = `test-results/failures/${testName}-${step}-failure-log-${timestamp}.json`;
    await fs.writeFile(failureLogPath, JSON.stringify(failureInfo, null, 2));
    
    console.log(`📄 Failure documented: ${failureLogPath}`);
  }
}

/**
 * Enhanced test wrapper with automatic documentation
 */
export function enhancedTest(testName: string, testFn: (page: Page) => Promise<void>) {
  return test(testName, async ({ page }) => {
    
    // Start documentation
    await TestDocumentation.startVideoRecording(page, testName);
    await TestDocumentation.logTestStep(`Starting test: ${testName}`, 'START');
    
    try {
      // Execute the actual test
      await testFn(page);
      
      // Success documentation
      await TestDocumentation.logTestStep(`Test completed successfully: ${testName}`, 'SUCCESS');
      await TestDocumentation.captureTestStep(page, 'final-success', testName);
      
    } catch (error:any) {
      // Failure documentation
      await TestDocumentation.logTestStep(`Test failed: ${testName} - ${error?.message}`, 'ERROR');
      await TestDocumentation.documentFailure(page, error as Error, testName, 'execution');
      
      // Re-throw the error to maintain test failure status
      throw error;
    }
  });
}