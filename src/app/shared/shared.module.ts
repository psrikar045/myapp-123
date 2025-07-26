import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Shared Components
import { FooterComponent } from './footer/footer.component';
import { SearchModalComponent } from './components/search-modal/search-modal.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { DataTableComponent } from './components/data-table/data-table.component';

// Shared Directives
import { AutoFocusDirective } from './directives/auto-focus.directive';
import { PermissionCheckDirective } from './directives/permission-check.directive';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { LazyLoadDirective } from './directives/lazy-load.directive';
import { DebounceClickDirective } from './directives/debounce-click.directive';
import { TooltipDirective } from './directives/tooltip.directive';
import { InfiniteScrollDirective } from './directives/infinite-scroll.directive';

// Shared Pipes
import { TruncatePipe } from './pipes/truncate.pipe';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { CapitalizePipe } from './pipes/capitalize.pipe';
import { TimeAgoPipe } from './pipes/time-ago.pipe';
import { FileSizePipe } from './pipes/file-size.pipe';
import { HighlightPipe } from './pipes/highlight.pipe';
import { FilterPipe } from './pipes/filter.pipe';

// Shared Services
import { UtilService } from './services/util.service';

import { ToolbarService } from './services/toolbar.service';
import { SearchModalService } from './services/search-modal.service';
import { SearchHistoryService } from './services/search-history.service';
import { DialogService } from './services/dialog.service';
import { ErrorHandlerService } from './services/error-handler.service';

@NgModule({
  declarations: [
    // Only declare non-standalone components here
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    
    // Import standalone components
    FooterComponent,
    SearchModalComponent,
    LoadingSpinnerComponent,
    ConfirmationDialogComponent,
    DataTableComponent,
    
    // Import standalone directives
    AutoFocusDirective,
    PermissionCheckDirective,
    ClickOutsideDirective,
    LazyLoadDirective,
    DebounceClickDirective,
    TooltipDirective,
    InfiniteScrollDirective,
    
    // Import standalone pipes
    TruncatePipe,
    SafeHtmlPipe,
    CapitalizePipe,
    TimeAgoPipe,
    FileSizePipe,
    HighlightPipe,
    FilterPipe
  ],
  exports: [
    // Angular modules
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    
    // Standalone components
    FooterComponent,
    SearchModalComponent,
    LoadingSpinnerComponent,
    ConfirmationDialogComponent,
    DataTableComponent,
    
    // Standalone directives
    AutoFocusDirective,
    PermissionCheckDirective,
    ClickOutsideDirective,
    LazyLoadDirective,
    DebounceClickDirective,
    TooltipDirective,
    InfiniteScrollDirective,
    
    // Standalone pipes
    TruncatePipe,
    SafeHtmlPipe,
    CapitalizePipe,
    TimeAgoPipe,
    FileSizePipe,
    HighlightPipe,
    FilterPipe
  ],
  providers: [
    // Shared services
    UtilService,
    ToolbarService,
    SearchModalService,
    SearchHistoryService,
    DialogService,
    ErrorHandlerService
  ]
})
export class SharedModule {}
