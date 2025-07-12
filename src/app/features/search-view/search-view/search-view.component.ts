import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-search-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-view.component.html',
  styleUrl: './search-view.component.css'
})
export class SearchViewComponent {
 brand: string = '';
  brandData: any;

  brandsData: Record<string, any> = {
    apple: {
      name: 'Apple',
      logos: [
        { type: 'Light', src: 'apple-light', svg: true },
        { type: 'Dark', src: 'apple-dark', svg: true }
      ],
      illustrations: [
        { title: 'Illustration Type 01', desc: 'Use for App Store Template Google...', img: 'illustration-1' },
        { title: 'Illustration Type 02', desc: 'Use for onboarding, empty state...', img: 'illustration-2' },
        { title: 'Illustration Type 03', desc: 'Use for dashboard, analytics...', img: 'illustration-3' }
      ],
      colors: {
        full: [
          { name: 'Blue', code: '#2563EB' },
          { name: 'Indigo', code: '#3730A3' },
          { name: 'Green', code: '#22A06B' },
          { name: 'Orange', code: '#F59E42' },
          { name: 'Red', code: '#F43F5E' },
          { name: 'Navy', code: '#1E293B' },
          { name: 'Slate', code: '#64748B' },
          { name: 'Gray', code: '#E5E7EB' }
        ],
        light: [
          { name: 'Light Blue', code: '#EFF6FF' },
          { name: 'Light Indigo', code: '#EEF2FF' },
          { name: 'Light Green', code: '#ECFDF5' },
          { name: 'Light Orange', code: '#FFF7ED' },
          { name: 'Light Red', code: '#FEF2F2' },
          { name: 'Light Navy', code: '#F1F5F9' },
          { name: 'Light Slate', code: '#F8FAFC' },
          { name: 'Light Gray', code: '#F3F4F6' }
        ]
      },
      typography: [
        { category: 'H1', typeface: 'SF Pro Display', font: 'Bold', size: '56px', spacing: '-2%' },
        { category: 'H2', typeface: 'SF Pro Display', font: 'Semibold', size: '40px', spacing: '-2%' },
        { category: 'H3', typeface: 'SF Pro Display', font: 'Medium', size: '32px', spacing: '-2%' },
        { category: 'H4', typeface: 'SF Pro Display', font: 'Regular', size: '24px', spacing: '-2%' },
        { category: 'H5', typeface: 'SF Pro Display', font: 'Regular', size: '20px', spacing: '-2%' },
        { category: 'H6', typeface: 'SF Pro Display', font: 'Regular', size: '16px', spacing: '-2%' },
        { category: 'Body', typeface: 'SF Pro Text', font: 'Regular', size: '16px', spacing: '0%' },
        { category: 'Caption', typeface: 'SF Pro Text', font: 'Regular', size: '12px', spacing: '0%' }
      ],
      iconography: {
        filled: Array(20).fill('filled-icon'),
        outline: Array(20).fill('outline-icon')
      },
      buttons: [
        { label: 'Primary', style: 'primary' },
        { label: 'Info', style: 'info' },
        { label: 'Success', style: 'success' },
        { label: 'Warning', style: 'warning' },
        { label: 'Danger', style: 'danger' },
        { label: 'Default', style: 'default' }
      ],
      form: {
        fields: [
          { label: 'First Name', type: 'text', placeholder: 'First' },
          { label: 'Last Name', type: 'text', placeholder: 'Last' },
          { label: 'Email', type: 'email', placeholder: 'Email' },
          { label: 'Phone', type: 'text', placeholder: 'Phone' }
        ]
      }
    }
  };

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.brand = params.get('brand') || '';
      this.brandData = this.brandsData[this.brand];
    });
  }
}
