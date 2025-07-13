import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [SpinnerComponent],
  imports: [CommonModule, MatProgressSpinnerModule, SharedModule],
  exports: [SpinnerComponent],
  providers: [
    // Note: HTTP interceptors are now provided in app.config.ts for standalone apps
    // This is kept for reference if needed for module-based components
  ]
})
export class CoreModule {}
