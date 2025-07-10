import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { SpinnerService } from '../../services/spinner.service';
// CommonModule and MatProgressSpinnerModule will be imported in CoreModule

@Component({
  selector: 'app-spinner',
  standalone: false, // Changed to false
  // imports: [], // Removed for non-standalone
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.css'] // Changed to styleUrls
})
export class SpinnerComponent {
  isLoading$: Observable<boolean>;

  constructor(private spinnerService: SpinnerService) {
    this.isLoading$ = this.spinnerService.loading$;
  }
}
