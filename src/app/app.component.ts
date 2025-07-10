import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common'; // For AsyncPipe
import { CoreModule } from './core/core.module'; // Imports SpinnerComponent
import { SpinnerService } from './core/services/spinner.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, CoreModule], // Add CommonModule and CoreModule
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  constructor(public spinnerService: SpinnerService) {} // Inject SpinnerService
}
