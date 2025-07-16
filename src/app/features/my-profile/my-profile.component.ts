import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgStyle } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { MyPlanComponent } from '../my-plan/my-plan.component';
import { ChoosePlanComponent } from '../choose-plan/choose-plan.component';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import {  NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ToolbarService } from '../../shared/services/toolbar.service'

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, NgStyle, HeaderComponent, MyPlanComponent, ChoosePlanComponent],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.css'
})
export class MyProfileComponent implements OnInit {
  sidebarMenu = [
    { label: 'Edit Profile', active: true, disabled: false },
    { label: 'Notifications', active: false, disabled: false },
    { label: 'My Plan', active: false, disabled: false },
    { label: 'Choose Plan', active: false, disabled: false },
    { label: 'Password & Security', active: false, disabled: false }
  ];
userProfile: any;
  selectedSidebarIndex = 0;
private readonly authService = inject(AuthService);

    constructor(private router: Router, private toolbarService: ToolbarService) {
    // Listen for route changes and set logged-in toolbar if on /my-profile
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      if (event.urlAfterRedirects.startsWith('/my-profile')) {
        this.toolbarService.setLoggedInToolbar();
      }
    });
  }


  // ngOnInit(): void {
  //   this.fetchUserProfile();
  // }
    ngOnInit(): void {
      this.fetchUserProfile();
    this.toolbarService.setLoggedInToolbar();
  }

  fetchUserProfile() {
    this.authService.userProfileFetch().subscribe({
      next: (response: any) => {
        console.log('User profile fetched successfully:');
        this.userProfile = response;
        this.profile.avatar = response.profilePictureUrl || '/landing/user.jfif';
        this.profile.name= response.firstName + ' ' + response.lastName || 'User';
        this.profileForm.firstName = response.firstName || '';
        this.profileForm.surname = response.lastName || '';
        this.profileForm.nationalCode = response.futureI1 || '';
        this.profileForm.dob = response.futureT1 || '';
        this.profileForm.educationLevel = response.futureV1 || '';
        this.profileForm.email = response.email || '';
        this.profileForm.phoneCountry = response.futureV2 || '+91';
        this.profileForm.phoneNumber = response.phoneNumber || '';
        this.profileForm.country = response.futureV3 || '';
        this.profileForm.city = response.futureV4 || '';
        this.profileForm.updatedAt = response.updatedAt || new Date().toISOString();
        this.profileForm.username = response.username || '';
        this.profileForm.emailVerified = response.emailVerified || false;
        this.profileForm.authProvider = response.authProvider || '';
      },
      error: (error: any) => {
        console.error('Error fetching user profile:', error);
      }
    });
  }

  onSidebarSelect(index: number) {
    this.sidebarMenu.forEach((item, i) => item.active = i === index);
    this.selectedSidebarIndex = index;
  }

  profile = {
    avatar: '/landing/user.jfif',
    name: 'Mobina Mirbagheri',
    status: 'Your account is ready, you can now apply for advice.'
  };

  profileForm = {
    firstName: 'mobina',
    surname: 'Mir',
    nationalCode: '',
    dob: '',
    educationLevel: 'software',
    email: '',
    phoneCountry: '+91',
    phoneNumber: '',
    country: '',
    city: 'software',
    updatedAt: new Date().toISOString(),
    username:'',
    emailVerified: false,
    authProvider: '',
  };

  educationLevels = [
    { value: 'software', label: 'software' },
    { value: 'hardware', label: 'hardware' },
    { value: 'other', label: 'other' }
  ];

  countries = [
    { value: '', label: 'Select' },
    { value: 'iran', label: 'Iran' },
    { value: 'usa', label: 'USA' },
    { value: 'uk', label: 'UK' }
  ];

  cities = [
    { value: 'software', label: 'software' },
    { value: 'hardware', label: 'hardware' },
    { value: 'other', label: 'other' }
  ];

  onSave() {
    const data = this.profileForm;

    alert('Profile saved!');
    console.log(data);
  }

  goToResetPassword() {
    this.router.navigate(['/forgot-password'], { queryParams: { mode: 'profile' } });
  }

  // Method to handle upgrade button click from my-plan component
  onUpgradeClicked() {
    // Set selectedSidebarIndex to 3 to show "Choose Plan" section
    this.selectedSidebarIndex = 3;
    // Update sidebar menu active state
    this.sidebarMenu.forEach((item, i) => item.active = i === 3);
  }
}
