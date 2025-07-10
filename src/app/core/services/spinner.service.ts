import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public readonly loading$ = this.loadingSubject.asObservable();

  constructor() {
    // Constructor can be empty if no immediate DI needs,
    // or can inject other services if necessary for its logic.
  }

  show(): void {
    this.loadingSubject.next(true);
  }

  hide(): void {
    this.loadingSubject.next(false);
  }
}
