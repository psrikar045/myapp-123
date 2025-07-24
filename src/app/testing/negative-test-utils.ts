/**
 * Comprehensive Negative Testing Utilities
 * 
 * This utility provides standardized test patterns for negative scenarios
 * across all components in the application.
 * 
 * Compatible with Jest testing framework.
 */

export interface SecurityTestInput {
  input: string;
  description: string;
  expectedBehavior: 'reject' | 'sanitize' | 'escape' | 'ignore';
  vulnerabilityType: 'xss' | 'sql_injection' | 'buffer_overflow' | 'path_traversal' | 'unicode' | 'null_byte' | 'format_string';
}

export interface NetworkFailureScenario {
  errorType: string;
  statusCode?: number;
  message: string;
  expectedUserMessage: string;
  retryable: boolean;
}

export interface AccessibilityTestCase {
  element: string;
  action: string;
  expectedAriaAttribute: string;
  expectedBehavior: string;
}

export class NegativeTestUtils {
  
  /**
   * Common malicious inputs for security testing
   */
  static readonly SECURITY_TEST_INPUTS: SecurityTestInput[] = [
    // XSS Attacks
    {
      input: '<script>alert("xss")</script>',
      description: 'Basic XSS script injection',
      expectedBehavior: 'escape',
      vulnerabilityType: 'xss'
    },
    {
      input: '<img src=x onerror=alert("xss")>',
      description: 'XSS via image error event',
      expectedBehavior: 'escape',
      vulnerabilityType: 'xss'
    },
    {
      input: 'javascript:alert("xss")',
      description: 'JavaScript protocol XSS',
      expectedBehavior: 'reject',
      vulnerabilityType: 'xss'
    },
    {
      input: 'data:text/html,<script>alert("xss")</script>',
      description: 'Data URL XSS',
      expectedBehavior: 'reject',
      vulnerabilityType: 'xss'
    },
    {
      input: '<svg onload=alert("xss")>',
      description: 'SVG-based XSS',
      expectedBehavior: 'escape',
      vulnerabilityType: 'xss'
    },

    // SQL Injection Attacks
    {
      input: '\'; DROP TABLE users; --',
      description: 'Basic SQL injection with table drop',
      expectedBehavior: 'escape',
      vulnerabilityType: 'sql_injection'
    },
    {
      input: 'admin\'; INSERT INTO users VALUES (\'hacker\', \'password\'); --',
      description: 'SQL injection with data insertion',
      expectedBehavior: 'escape',
      vulnerabilityType: 'sql_injection'
    },
    {
      input: '\' OR \'1\'=\'1\' --',
      description: 'SQL injection bypass authentication',
      expectedBehavior: 'escape',
      vulnerabilityType: 'sql_injection'
    },
    {
      input: 'UNION SELECT password FROM users WHERE username=\'admin\'--',
      description: 'SQL injection with UNION attack',
      expectedBehavior: 'escape',
      vulnerabilityType: 'sql_injection'
    },

    // Buffer Overflow Tests
    {
      input: 'A'.repeat(10000),
      description: 'Very long string buffer overflow test',
      expectedBehavior: 'sanitize',
      vulnerabilityType: 'buffer_overflow'
    },
    {
      input: 'x'.repeat(100000),
      description: 'Extremely long string memory test',
      expectedBehavior: 'sanitize',
      vulnerabilityType: 'buffer_overflow'
    },

    // Path Traversal Attacks
    {
      input: '../../../../etc/passwd',
      description: 'Unix path traversal attack',
      expectedBehavior: 'reject',
      vulnerabilityType: 'path_traversal'
    },
    {
      input: '..\\..\\..\\windows\\system32\\config\\sam',
      description: 'Windows path traversal attack',
      expectedBehavior: 'reject',
      vulnerabilityType: 'path_traversal'
    },

    // Unicode and Encoding Attacks
    {
      input: 'пользователь@домен.рф',
      description: 'Unicode characters in email',
      expectedBehavior: 'sanitize',
      vulnerabilityType: 'unicode'
    },
    {
      input: '\u200B\u200C\u200D\uFEFF',
      description: 'Zero-width characters',
      expectedBehavior: 'sanitize',
      vulnerabilityType: 'unicode'
    },
    {
      input: '🔥💀👻🎃🚀💻🔐',
      description: 'Emoji-only input',
      expectedBehavior: 'sanitize',
      vulnerabilityType: 'unicode'
    },

    // Null Byte Attacks
    {
      input: 'test\x00injection',
      description: 'Null byte injection',
      expectedBehavior: 'sanitize',
      vulnerabilityType: 'null_byte'
    },
    {
      input: 'file.txt\x00.exe',
      description: 'Null byte file extension bypass',
      expectedBehavior: 'reject',
      vulnerabilityType: 'null_byte'
    },

    // Format String Attacks
    {
      input: '%s%s%s%s%s%s%s%s%s%s',
      description: 'Format string attack',
      expectedBehavior: 'escape',
      vulnerabilityType: 'format_string'
    },
    {
      input: '%x%x%x%x%x%x%x%x%x%x',
      description: 'Format string memory read',
      expectedBehavior: 'escape',
      vulnerabilityType: 'format_string'
    }
  ];

  /**
   * Common network failure scenarios
   */
  static readonly NETWORK_FAILURE_SCENARIOS: NetworkFailureScenario[] = [
    {
      errorType: 'TimeoutError',
      message: 'Network timeout',
      expectedUserMessage: 'Request timed out. Please try again.',
      retryable: true
    },
    {
      errorType: 'NetworkError',
      message: 'Network Error',
      expectedUserMessage: 'Network connection failed. Please check your internet connection.',
      retryable: true
    },
    {
      errorType: 'ServerError',
      statusCode: 500,
      message: 'Internal Server Error',
      expectedUserMessage: 'Server error occurred. Please try again later.',
      retryable: true
    },
    {
      errorType: 'BadRequest',
      statusCode: 400,
      message: 'Bad Request',
      expectedUserMessage: 'Invalid request. Please check your input.',
      retryable: false
    },
    {
      errorType: 'Unauthorized',
      statusCode: 401,
      message: 'Unauthorized',
      expectedUserMessage: 'Authentication failed. Please login again.',
      retryable: false
    },
    {
      errorType: 'Forbidden',
      statusCode: 403,
      message: 'Forbidden',
      expectedUserMessage: 'You do not have permission to perform this action.',
      retryable: false
    },
    {
      errorType: 'NotFound',
      statusCode: 404,
      message: 'Not Found',
      expectedUserMessage: 'The requested resource was not found.',
      retryable: false
    },
    {
      errorType: 'TooManyRequests',
      statusCode: 429,
      message: 'Too Many Requests',
      expectedUserMessage: 'Too many requests. Please wait before trying again.',
      retryable: true
    },
    {
      errorType: 'CorsError',
      statusCode: 0,
      message: 'CORS policy error',
      expectedUserMessage: 'Request blocked by browser policy.',
      retryable: false
    }
  ];

  /**
   * Email validation test cases
   */
  static readonly INVALID_EMAILS: string[] = [
    '',
    ' ',
    'invalid',
    '@domain.com',
    'user@',
    'user@@domain.com',
    'user@domain..com',
    'user@.domain.com',
    '.user@domain.com',
    'user.@domain.com',
    'user@domain.',
    'user@domain.c',
    'user name@domain.com',
    'user@domain com',
    'user@domain.com.',
    'user@-domain.com',
    'user@domain-.com',
    'user@domain.com-',
    'user@[192.168.1.1]',
    'user@192.168.1.1',
    'very-very-very-very-very-very-very-very-very-very-very-long-email-address@very-very-very-very-very-very-very-very-very-very-very-long-domain-name.com'
  ];

  /**
   * Phone number validation test cases
   */
  static readonly INVALID_PHONE_NUMBERS: string[] = [
    '',
    ' ',
    'abc',
    '123',
    '12345',
    '123456789012345',
    '+1234567890',
    '123-456-7890',
    '(123) 456-7890',
    '123.456.7890',
    '123 456 7890',
    '0000000000',
    '1111111111',
    '123abc7890',
    'phone',
    '123-abc-7890'
  ];

  /**
   * Password strength test cases
   */
  static readonly PASSWORD_TEST_CASES = {
    weak: [
      '123456',
      'password',
      'abc123',
      'qwerty',
      '111111',
      'password123'
    ],
    medium: [
      'Password1',
      'abc123DEF',
      'myPassword',
      'Test1234',
      'user123!'
    ],
    strong: [
      'MyStr0ng!P@ssw0rd',
      'C0mpl3x#P@ssw0rd!',
      'S3cur3!P@ss#123',
      'R@nd0m$Str1ng!',
      'Ungu3ss@bl3!P@ss'
    ]
  };

  /**
   * Accessibility test cases
   */
  static readonly ACCESSIBILITY_TESTS: AccessibilityTestCase[] = [
    {
      element: 'input[type="email"]',
      action: 'focus',
      expectedAriaAttribute: 'aria-label',
      expectedBehavior: 'Should announce field purpose to screen readers'
    },
    {
      element: 'input[type="password"]',
      action: 'focus',
      expectedAriaAttribute: 'aria-label',
      expectedBehavior: 'Should announce password field to screen readers'
    },
    {
      element: 'button[type="submit"]',
      action: 'focus',
      expectedAriaAttribute: 'aria-label',
      expectedBehavior: 'Should announce button action to screen readers'
    },
    {
      element: 'mat-error',
      action: 'display',
      expectedAriaAttribute: 'role',
      expectedBehavior: 'Should announce errors to screen readers'
    },
    {
      element: '[role="alert"]',
      action: 'display',
      expectedAriaAttribute: 'aria-live',
      expectedBehavior: 'Should immediately announce alerts'
    }
  ];

  /**
   * Generate malicious input test for a specific vulnerability type
   */
  static generateSecurityTest(
    vulnerabilityType: SecurityTestInput['vulnerabilityType'],
    testCallback: (input: SecurityTestInput) => void
  ): void {
    const relevantInputs = this.SECURITY_TEST_INPUTS.filter(
      input => input.vulnerabilityType === vulnerabilityType
    );

    relevantInputs.forEach((testInput, index) => {
      it(`should handle ${vulnerabilityType} attack #${index + 1}: ${testInput.description}`, () => {
        testCallback(testInput);
      });
    });
  }

  /**
   * Generate network failure tests
   */
  static generateNetworkFailureTests(
    testCallback: (scenario: NetworkFailureScenario) => void
  ): void {
    this.NETWORK_FAILURE_SCENARIOS.forEach((scenario, index) => {
      it(`should handle ${scenario.errorType} network failure`, () => {
        testCallback(scenario);
      });
    });
  }

  /**
   * Generate email validation tests
   */
  static generateEmailValidationTests(
    testCallback: (email: string) => void
  ): void {
    this.INVALID_EMAILS.forEach((email, index) => {
      it(`should reject invalid email #${index + 1}: "${email}"`, () => {
        testCallback(email);
      });
    });
  }

  /**
   * Generate phone validation tests
   */
  static generatePhoneValidationTests(
    testCallback: (phone: string) => void
  ): void {
    this.INVALID_PHONE_NUMBERS.forEach((phone, index) => {
      it(`should reject invalid phone #${index + 1}: "${phone}"`, () => {
        testCallback(phone);
      });
    });
  }

  /**
   * Generate password strength tests
   */
  static generatePasswordStrengthTests(
    testCallbacks: {
      weak: (password: string) => void;
      medium: (password: string) => void;
      strong: (password: string) => void;
    }
  ): void {
    Object.entries(this.PASSWORD_TEST_CASES).forEach(([strength, passwords]) => {
      passwords.forEach((password, index) => {
        it(`should detect ${strength} password #${index + 1}: "${password}"`, () => {
          testCallbacks[strength as keyof typeof testCallbacks](password);
        });
      });
    });
  }

  /**
   * Generate accessibility tests
   */
  static generateAccessibilityTests(
    fixture: any,
    testCallback: (testCase: AccessibilityTestCase, element: HTMLElement) => void
  ): void {
    this.ACCESSIBILITY_TESTS.forEach((testCase, index) => {
      it(`should meet accessibility requirement #${index + 1}: ${testCase.expectedBehavior}`, () => {
        const element = fixture.nativeElement.querySelector(testCase.element);
        if (element) {
          testCallback(testCase, element);
        }
      });
    });
  }

  /**
   * Simulate rapid user interactions
   */
  static simulateRapidInteractions(
    actions: Array<() => void>,
    iterations: number = 10
  ): void {
    for (let i = 0; i < iterations; i++) {
      actions.forEach(action => {
        expect(() => action()).not.toThrow();
      });
    }
  }

  /**
   * Simulate memory pressure scenarios
   */
  static simulateMemoryPressure(
    componentAction: () => void,
    iterations: number = 1000
  ): void {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    for (let i = 0; i < iterations; i++) {
      componentAction();
    }
    
    // Force garbage collection if available
    if ((window as any).gc) {
      (window as any).gc();
    }
    
    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be reasonable (less than 50MB for 1000 iterations)
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
  }

  /**
   * Test form validation edge cases
   */
  static testFormValidationEdgeCases(
    form: any,
    fieldName: string,
    validValue: string,
    invalidValues: string[]
  ): void {
    describe(`${fieldName} validation edge cases`, () => {
      invalidValues.forEach((invalidValue, index) => {
        it(`should reject invalid ${fieldName} #${index + 1}: "${invalidValue}"`, () => {
          form.patchValue({ [fieldName]: invalidValue });
          expect(form.get(fieldName)?.invalid).toBe(true);
        });
      });

      it(`should accept valid ${fieldName}: "${validValue}"`, () => {
        form.patchValue({ [fieldName]: validValue });
        expect(form.get(fieldName)?.valid).toBe(true);
      });
    });
  }

  /**
   * Test component destruction cleanup
   */
  static testComponentCleanup(
    component: any,
    subscriptionProperties: string[] = ['subscription', 'themeSubscription', 'passwordSubscription'],
    intervalProperties: string[] = ['intervalId', 'countdownInterval', 'carouselIntervalId']
  ): void {
    it('should cleanup subscriptions and intervals on destroy', () => {
      // Check subscriptions
      subscriptionProperties.forEach(prop => {
        const subscription = component[prop];
        if (subscription && typeof subscription.unsubscribe === 'function') {
          expect(subscription.closed).toBeDefined();
        }
      });

      // Check intervals
      intervalProperties.forEach(prop => {
        const intervalId = component[prop];
        if (intervalId) {
          expect(() => clearInterval(intervalId)).not.toThrow();
        }
      });

      // Trigger cleanup
      component.ngOnDestroy();

      // Verify cleanup
      subscriptionProperties.forEach(prop => {
        const subscription = component[prop];
        if (subscription && typeof subscription.unsubscribe === 'function') {
          expect(subscription.closed).toBe(true);
        }
      });

      intervalProperties.forEach(prop => {
        const intervalId = component[prop];
        if (intervalId !== undefined) {
          expect(component[prop]).toBeNull();
        }
      });
    });
  }

  /**
   * Create mock error responses
   */
  static createMockError(scenario: NetworkFailureScenario): Error {
    const error = new Error(scenario.message);
    error.name = scenario.errorType;
    (error as any).status = scenario.statusCode;
    return error;
  }

  /**
   * Validate error handling response
   */
  static validateErrorHandling(
    component: any,
    mockSnackBar: any,
    scenario: NetworkFailureScenario
  ): void {
    expect(component.isLoading).toBe(false);
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      expect.stringContaining(scenario.message),
      scenario.retryable ? 'Retry' : 'Close',
      expect.any(Object)
    );
  }

  /**
   * Test browser compatibility edge cases
   */
  static testBrowserCompatibility(
    fixture: any,
    actions: Array<() => void>
  ): void {
    describe('Browser Compatibility Edge Cases', () => {
      it('should handle missing browser APIs gracefully', () => {
        // Backup original APIs
        const originalConsole = window.console;
        const originalLocalStorage = window.localStorage;
        const originalSessionStorage = window.sessionStorage;

        try {
          // Simulate missing APIs
          (window as any).console = undefined;
          (window as any).localStorage = undefined;
          (window as any).sessionStorage = undefined;

          actions.forEach((action, index) => {
            expect(() => action()).not.toThrow();
          });

          fixture.detectChanges();
        } finally {
          // Restore original APIs
          window.console = originalConsole;
          (window as any).localStorage = originalLocalStorage;
          (window as any).sessionStorage = originalSessionStorage;
        }
      });

      it('should handle old browser event handling', () => {
        const oldEventSupport = !window.addEventListener;
        
        if (oldEventSupport) {
          // Test legacy event handling
          actions.forEach(action => {
            expect(() => action()).not.toThrow();
          });
        }
      });
    });
  }
}