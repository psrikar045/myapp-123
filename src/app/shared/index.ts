/**
 * Shared Module Barrel Exports
 */

// Shared Module
export * from './shared.module';

// Components
export * from './components/loading-spinner/loading-spinner.component';
export * from './components/search-modal/search-modal.component';
export * from './components/confirmation-dialog/confirmation-dialog.component';
export * from './footer/footer.component';

// Services
export * from './services/util.service';
export * from './services/theme-utils.service';
export * from './services/toolbar.service';
export * from './services/search-modal.service';
export * from './services/search-history.service';
export * from './services/dialog.service';

// Directives
export * from './directives/auto-focus.directive';
export * from './directives/click-outside.directive';
export * from './directives/permission-check.directive';
export * from './directives/lazy-load.directive';
export * from './directives/debounce-click.directive';
export * from './directives/tooltip.directive';
export * from './directives/infinite-scroll.directive';

// Pipes
export * from './pipes/truncate.pipe';
export * from './pipes/safe-html.pipe';
export * from './pipes/capitalize.pipe';
export * from './pipes/time-ago.pipe';
export * from './pipes/file-size.pipe';
export * from './pipes/highlight.pipe';
export * from './pipes/filter.pipe';

// Models
export * from './models/api.models';
export * from './models/user.models';
export * from './models/common.models';

// Constants
export * from './constants/api-endpoints';
export * from './constants/app-constants';
export * from './constants/validation-messages';

// Utilities
export * from './utils/common-functions';
export * from './utils/form-utils';

// Types
export type { AnimationType, SearchModalConfig, ProgressStep, SearchModalState } from './services/search-modal.service';