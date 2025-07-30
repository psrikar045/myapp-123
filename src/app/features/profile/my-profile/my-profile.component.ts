import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../layout/header/header.component';
import { MyPlanComponent } from '../../pricing/my-plan/my-plan.component';
import { ChoosePlanComponent } from '../../pricing/choose-plan/choose-plan.component';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import {  NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ToolbarService } from '../../../shared/services/toolbar.service';
import { UserProfileUpdateRequest } from '../../../shared/models/user-profile.model';
// Removed Angular Material dependency - using custom toast service instead
import { PhoneService } from '../../../shared/services/phone.service';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MyPlanComponent, 
    ChoosePlanComponent
  ],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.scss'
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
  isProfileLoading = true;
  private readonly authService = inject(AuthService);
  // Removed MatSnackBar dependency
  private readonly phoneService = inject(PhoneService);
    constructor(private router: Router, private toolbarService: ToolbarService) {
    // Listen for route changes and set logged-in toolbar if on /my-profile
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      if (event.urlAfterRedirects.startsWith('/my-profile')) {
        this.toolbarService.setLoggedInToolbar();
      }
    });
    
    // Set default values
    this.profileForm.country = 'India';
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
        console.log('User profile fetched successfully:', response);
        this.userProfile = response;
        this.profile.avatar = response.profilePictureUrl || 'assets/images/user-small-1.png';
        this.toolbarService.setProfileAvatar(this.profile.avatar); // Update header avatar
        this.profile.name = (response.firstName && response.lastName) 
          ? `${response.firstName} ${response.lastName}` 
          : (response.firstName || response.lastName || 'User');
        this.profile.email = response.email || '';
        this.profile.phone = response.phoneNumber ? `${response.futureV2 || '+91'} ${response.phoneNumber}` : '';
        this.profile.location = response.futureV4 && response.futureV3 ? `${response.futureV4}, ${response.futureV3}` : (response.futureV3 || '');
        this.profile.joinDate = response.createdAt ? new Date(response.createdAt).toLocaleDateString() : '';
        this.profile.lastLogin = response.lastLoginAt ? new Date(response.lastLoginAt).toLocaleDateString() : '';
        this.profile.emailVerified = response.emailVerified || false;
        this.profile.accountType = response.accountType || 'Standard';
        
        // Calculate profile completion percentage
        this.profile.profileCompletion = this.calculateProfileCompletion(response);
        this.isProfileLoading = false;
        
        console.log('Profile data after setting:', {
          name: this.profile.name,
          email: this.profile.email,
          phone: this.profile.phone,
          location: this.profile.location,
          completion: this.profile.profileCompletion
        });
        this.profileForm.firstName = response.firstName || '';
        this.profileForm.surname = response.lastName || '';
        this.profileForm.nationalCode = response.futureI1 || '';
        this.profileForm.dob = response.futureT1 || '';
        this.dobShow = response.futureT1 ? new Date(response.futureT1) : null; // Initialize date picker
        this.profileForm.email = response.email || '';
        this.profileForm.phoneCountry = response.futureV2 || '+91';
        this.profileForm.phoneNumber = response.phoneNumber || '';
        
        // Set country based on phone code using comprehensive service
        const countryFromPhoneCode = this.phoneService.getCountryByCode(response.futureV2 || '+91');
        this.profileForm.country = response.futureV3 || countryFromPhoneCode || 'India';
        this.profileForm.city = response.futureV4 || '';
        this.profileForm.updatedAt = response.updatedAt || new Date().toISOString();
        this.profileForm.username = response.username || '';
        this.profileForm.emailVerified = response.emailVerified || false;
        this.profileForm.authProvider = response.authProvider || '';
      },
      error: (error: any) => {
        console.error('Error fetching user profile:', error);
        this.isProfileLoading = false;
        // Set fallback data
        this.profile.name = 'User';
        this.profile.email = '';
        this.profile.phone = '';
        this.profile.location = '';
        this.profile.profileCompletion = 0;
      }
    });
  }

  onSidebarSelect(index: number) {
    this.sidebarMenu.forEach((item, i) => item.active = i === index);
    this.selectedSidebarIndex = index;
  }

  calculateProfileCompletion(response: any): number {
    const fields = [
      response.firstName,
      response.lastName,
      response.email,
      response.phoneNumber,
      response.futureV3, // country
      response.futureV4, // city
      response.futureI1, // national code
      response.profilePictureUrl
    ];
    
    const completedFields = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((completedFields / fields.length) * 100);
  }

  profile = {
    avatar: '/landing/user.jfif',
    name: '',
    status: 'Your account is ready, you can now apply for advice.',
    email: '',
    phone: '',
    location: '',
    joinDate: '',
    lastLogin: '',
    accountType: 'Standard',
    emailVerified: false,
    profileCompletion: 0
  };
  dobShow: Date | null = null;
  
  // Getter for date input - converts Date to YYYY-MM-DD string format
  get dobForInput(): string {
    if (!this.dobShow) return '';
    const year = this.dobShow.getFullYear();
    const month = String(this.dobShow.getMonth() + 1).padStart(2, '0');
    const day = String(this.dobShow.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Setter for date input - converts YYYY-MM-DD string to Date
  set dobForInput(value: string) {
    if (value) {
      this.dobShow = new Date(value);
    } else {
      this.dobShow = null;
    }
  }
  profileForm = {
    firstName: '',
    surname: '',
    nationalCode: '',
    dob: '',
    email: '',
    phoneCountry: '+91',
    phoneNumber: '',
    country: 'India',
    city: '',
    updatedAt: new Date().toISOString(),
    username:'',
    emailVerified: false,
    authProvider: '',
  };

  // Get all phone codes - supports 150+ countries!
  get allPhoneCodes() {
    // Get all countries with India first, then rest alphabetically
    const allCodes = this.phoneService.getPhoneCodes();
    const indiaCode = allCodes.find(pc => pc.country === 'India');
    const otherCodes = allCodes.filter(pc => pc.country !== 'India');
    
    return indiaCode ? [indiaCode, ...otherCodes] : allCodes;
  }



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

  // Handle phone code change using comprehensive service
  onPhoneCodeChange(phoneCode: string) {
    this.profileForm.phoneCountry = phoneCode;
    
    // Use service to get country name - supports 150+ countries
    const countryName = this.phoneService.getCountryByCode(phoneCode);
    if (countryName) {
      this.profileForm.country = countryName;
    }
  }

  // Handle country change and update phone code automatically
  onCountryChange(countryName: string) {
    this.profileForm.country = countryName;
    
    // Use service to get phone code for this country
    const phoneCode = this.phoneService.getCodeByCountry(countryName);
    if (phoneCode) {
      this.profileForm.phoneCountry = phoneCode;
    }
  }

  // Get all countries for country dropdown
  get allCountries(): string[] {
    return this.phoneService.getPhoneCodes()
      .map(pc => pc.country)
      .filter((country, index, arr) => arr.indexOf(country) === index) // Remove duplicates
      .sort((a, b) => {
        // Put India first, then sort alphabetically
        if (a === 'India') return -1;
        if (b === 'India') return 1;
        return a.localeCompare(b);
      });
  }
getIdFromLocalStorage(){
  let data = localStorage.getItem('user_details') || '';
  if (data) {
    try {
      const parsedData = JSON.parse(data);
      return parsedData.userId || '';
    } catch (e) {
      console.error('Error parsing user details from localStorage:', e);
      return '';
    }
  }
}
  onSave() {
    const data = this.profileForm;
    let id = this.getIdFromLocalStorage(); // Assuming you have a method to get user ID from local storage
let dobToSend = null;
if (this.dobShow) {
  // Create a new Date object from the existing one to avoid modifying the original
  const date = new Date(this.dobShow);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, '0');

  dobToSend = `${year}-${month}-${day}`;
}
    const updateRequest: UserProfileUpdateRequest = {
      firstName: this.profileForm.firstName,
      surname: this.profileForm.surname, // Maps to backend's lastName
      nationalCode: this.profileForm.nationalCode,
      // educationLevel: this.profileForm.educationLevel,
      phoneCountry: this.profileForm.phoneCountry,
      phoneNumber: this.profileForm.phoneNumber,
      country: this.profileForm.country,
      city: this.profileForm.city,
      username: this.profileForm.username,
      dob: dobToSend,
      id: id
    };
 this.authService.userProfileUpdate( updateRequest).subscribe({
      next: (response: any) => {
       this.showToast('Profile update successful!', 'success');
       this.profileForm.updatedAt = response.updatedAt || new Date().toISOString(); // Update timestamp
        // Optionally, re-fetch profile to ensure UI reflects latest state or update form values
        // this.fetchUserProfile(this.userId!);
      },
      error: (err) => {
        console.error('Failed to update user profile:', err);
        // Handle specific error codes or validation errors from backend
        if (err.status === 400 && err.error && err.error.message) {
          this.showToast(`Update failed: ${err.error.message}`, 'error');
        } else if (err.status === 404) {
          this.showToast('User not found for update.', 'error');
        } else {
          this.showToast('Failed to update profile. Please try again.', 'error');
        }
      }
    });
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
  // Custom toast notification using Bootstrap
  showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    // Create toast element
    const toastContainer = document.getElementById('toast-container') || this.createToastContainer();
    const toastId = 'toast-' + Date.now();
    
    const toastHtml = `
      <div id="${toastId}" class="toast align-items-center text-white bg-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'primary'} border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">
            <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
            ${message}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    // Initialize and show toast
    const toastElement = document.getElementById(toastId);
    if (toastElement) {
      const toast = new (window as any).bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 4000
      });
      toast.show();
      
      // Remove toast element after it's hidden
      toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
      });
    }
  }
  
  private createToastContainer(): HTMLElement {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
  }
}
