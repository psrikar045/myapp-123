import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgStyle } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { MyPlanComponent } from '../my-plan/my-plan.component';
import { ChoosePlanComponent } from '../choose-plan/choose-plan.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, NgStyle, HeaderComponent, MyPlanComponent, ChoosePlanComponent],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.css'
})
export class MyProfileComponent {
  sidebarMenu = [
    { label: 'Edit Profile', active: true, disabled: false },
    { label: 'Notifications', active: false, disabled: false },
    { label: 'My Plan', active: false, disabled: false },
    { label: 'Choose Plan', active: false, disabled: false },
    { label: 'Password & Security', active: false, disabled: false }
  ];

  selectedSidebarIndex = 0;

  constructor(private router: Router) {}

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
    phoneCountry: '+98',
    phoneNumber: '',
    country: '',
    city: 'software'
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
    // Save logic here (e.g., show a message or log the form)
    alert('Profile saved!');
    console.log(this.profileForm);
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
