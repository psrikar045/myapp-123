import { GlobalErrorHandler } from './global-error-handler';
import { Injector } from '@angular/core';
import { LoggingService } from '../services/logging.service';
import { SpinnerService } from '../services/spinner.service';

describe('GlobalErrorHandler', () => {
  let injectorMock: Injector;
  let loggingServiceMock: Partial<LoggingService>;
  let spinnerServiceMock: Partial<SpinnerService>;

  beforeEach(() => {
    loggingServiceMock = {
      error: jest.fn()
    };
    spinnerServiceMock = {
      hide: jest.fn()
    };
    injectorMock = Injector.create({
      providers: [
        { provide: LoggingService, useValue: loggingServiceMock, deps: [] },
        { provide: SpinnerService, useValue: spinnerServiceMock, deps: [] }
      ]
    });
  });

  it('should create an instance', () => {
    expect(new GlobalErrorHandler(injectorMock)).toBeTruthy();
  });

  it('should call spinnerService.hide() and loggingService.error()', () => {
    const handler = new GlobalErrorHandler(injectorMock);
    const error = new Error('Test error');
    handler.handleError(error);
    expect(spinnerServiceMock.hide).toHaveBeenCalled();
    expect(loggingServiceMock.error).toHaveBeenCalledWith(expect.stringMatching(/Test error/), error.stack);
  });
});

