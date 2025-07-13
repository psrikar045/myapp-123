import { Component, Input, OnInit } from '@angular/core';
import { ToolbarService, ToolbarLogo, ToolbarNavItem, ToolbarAction } from '../../shared/services/toolbar.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  logo$: Observable<ToolbarLogo>;
  navItems$: Observable<ToolbarNavItem[]>;
  actions$: Observable<ToolbarAction[]>;
  @Input() showNavigation = true;

  constructor(
    private toolbarService: ToolbarService,
    private authService: AuthService
  ) {
    this.logo$ = this.toolbarService.logo;
    this.navItems$ = this.toolbarService.navItems;
    this.actions$ = this.toolbarService.actions;
  }

  ngOnInit(): void {
    // this.authService.isAuthenticated$.subscribe(isAuthenticated => {
    //   if (isAuthenticated) {
    //     this.toolbarService.setLoggedInToolbar();
    //   } else {
    //     this.toolbarService.setLoggedOutToolbar();
    //   }
    // });
    
  }
}
