import { Injectable, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, shareReplay } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private breakpointObserver = inject(BreakpointObserver);

  // Predefined breakpoints from Angular Material
  // You can customize these as needed.
  // Using strings like '(max-width: 599.98px)' for custom queries.
  // We'll use a mobile-first approach, so min-width queries are generally preferred.

  public isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset) // Typically (max-width: 599.98px) and (orientation: portrait), (max-width: 959.98px) and (orientation: landscape)
    .pipe(
      map(result => result.matches),
      shareReplay(1)
    );

  public isTablet$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Tablet) // Typically (min-width: 600px) and (max-width: 839.98px) and (orientation: portrait), (min-width: 960px) and (max-width: 1279.98px) and (orientation: landscape)
    .pipe(
      map(result => result.matches),
      shareReplay(1)
    );

  public isWeb$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Web) // Typically (min-width: 840px) and (orientation: portrait), (min-width: 1280px) and (orientation: landscape)
    .pipe(
      map(result => result.matches),
      shareReplay(1)
    );

  // Custom breakpoints for a mobile-first approach
  // These can be more granular and align with the global CSS breakpoints.

  // Mobile: screens < 600px wide
  public isMobile$: Observable<boolean> = this.breakpointObserver
    .observe('(max-width: 599.98px)')
    .pipe(
      map(result => result.matches),
      shareReplay(1)
    );

  // Tablet: screens >= 600px and < 960px
  public isTabletPortrait$: Observable<boolean> = this.breakpointObserver
    .observe('(min-width: 600px) and (max-width: 959.98px)')
    .pipe(
      map(result => result.matches),
      shareReplay(1)
    );

  // Desktop: screens >= 960px
  public isDesktop$: Observable<boolean> = this.breakpointObserver
    .observe('(min-width: 960px)')
    .pipe(
      map(result => result.matches),
      shareReplay(1)
    );

  // Example of combining: Is Small Screen (Mobile or Tablet Portrait from Breakpoints.Handset)
  public isSmallScreen$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.Handset, Breakpoints.TabletPortrait])
    .pipe(
      map(result => result.matches),
      shareReplay(1)
    );
}
