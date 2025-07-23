import { Injectable } from '@angular/core';

export interface PhoneCode {
  code: string;
  country: string;
  flag: string;
  region?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PhoneService {
  private readonly phoneCodes: PhoneCode[] = [
    // Asia
    { code: '+91', country: 'India', flag: '🇮🇳', region: 'Asia' },
    { code: '+86', country: 'China', flag: '🇨🇳', region: 'Asia' },
    { code: '+81', country: 'Japan', flag: '🇯🇵', region: 'Asia' },
    { code: '+82', country: 'South Korea', flag: '🇰🇷', region: 'Asia' },
    { code: '+65', country: 'Singapore', flag: '🇸🇬', region: 'Asia' },
    { code: '+60', country: 'Malaysia', flag: '🇲🇾', region: 'Asia' },
    { code: '+66', country: 'Thailand', flag: '🇹🇭', region: 'Asia' },
    { code: '+84', country: 'Vietnam', flag: '🇻🇳', region: 'Asia' },
    { code: '+63', country: 'Philippines', flag: '🇵🇭', region: 'Asia' },
    { code: '+62', country: 'Indonesia', flag: '🇮🇩', region: 'Asia' },
    { code: '+880', country: 'Bangladesh', flag: '🇧🇩', region: 'Asia' },
    { code: '+94', country: 'Sri Lanka', flag: '🇱🇰', region: 'Asia' },
    { code: '+92', country: 'Pakistan', flag: '🇵🇰', region: 'Asia' },
    { code: '+93', country: 'Afghanistan', flag: '🇦🇫', region: 'Asia' },
    { code: '+95', country: 'Myanmar', flag: '🇲🇲', region: 'Asia' },
    { code: '+855', country: 'Cambodia', flag: '🇰🇭', region: 'Asia' },
    { code: '+856', country: 'Laos', flag: '🇱🇦', region: 'Asia' },
    { code: '+673', country: 'Brunei', flag: '🇧🇳', region: 'Asia' },
    { code: '+976', country: 'Mongolia', flag: '🇲🇳', region: 'Asia' },
    { code: '+852', country: 'Hong Kong', flag: '🇭🇰', region: 'Asia' },
    { code: '+853', country: 'Macau', flag: '🇲🇴', region: 'Asia' },
    { code: '+886', country: 'Taiwan', flag: '🇹🇼', region: 'Asia' },

    // Europe
    { code: '+44', country: 'United Kingdom', flag: '🇬🇧', region: 'Europe' },
    { code: '+49', country: 'Germany', flag: '🇩🇪', region: 'Europe' },
    { code: '+33', country: 'France', flag: '🇫🇷', region: 'Europe' },
    { code: '+39', country: 'Italy', flag: '🇮🇹', region: 'Europe' },
    { code: '+34', country: 'Spain', flag: '🇪🇸', region: 'Europe' },
    { code: '+31', country: 'Netherlands', flag: '🇳🇱', region: 'Europe' },
    { code: '+41', country: 'Switzerland', flag: '🇨🇭', region: 'Europe' },
    { code: '+43', country: 'Austria', flag: '🇦🇹', region: 'Europe' },
    { code: '+32', country: 'Belgium', flag: '🇧🇪', region: 'Europe' },
    { code: '+46', country: 'Sweden', flag: '🇸🇪', region: 'Europe' },
    { code: '+47', country: 'Norway', flag: '🇳🇴', region: 'Europe' },
    { code: '+45', country: 'Denmark', flag: '🇩🇰', region: 'Europe' },
    { code: '+358', country: 'Finland', flag: '🇫🇮', region: 'Europe' },
    { code: '+354', country: 'Iceland', flag: '🇮🇸', region: 'Europe' },
    { code: '+353', country: 'Ireland', flag: '🇮🇪', region: 'Europe' },
    { code: '+351', country: 'Portugal', flag: '🇵🇹', region: 'Europe' },
    { code: '+30', country: 'Greece', flag: '🇬🇷', region: 'Europe' },
    { code: '+48', country: 'Poland', flag: '🇵🇱', region: 'Europe' },
    { code: '+420', country: 'Czech Republic', flag: '🇨🇿', region: 'Europe' },
    { code: '+421', country: 'Slovakia', flag: '🇸🇰', region: 'Europe' },
    { code: '+36', country: 'Hungary', flag: '🇭🇺', region: 'Europe' },
    { code: '+40', country: 'Romania', flag: '🇷🇴', region: 'Europe' },
    { code: '+359', country: 'Bulgaria', flag: '🇧🇬', region: 'Europe' },
    { code: '+385', country: 'Croatia', flag: '🇭🇷', region: 'Europe' },
    { code: '+386', country: 'Slovenia', flag: '🇸🇮', region: 'Europe' },
    { code: '+381', country: 'Serbia', flag: '🇷🇸', region: 'Europe' },
    { code: '+382', country: 'Montenegro', flag: '🇲🇪', region: 'Europe' },
    { code: '+387', country: 'Bosnia and Herzegovina', flag: '🇧🇦', region: 'Europe' },
    { code: '+389', country: 'North Macedonia', flag: '🇲🇰', region: 'Europe' },
    { code: '+355', country: 'Albania', flag: '🇦🇱', region: 'Europe' },
    { code: '+383', country: 'Kosovo', flag: '🇽🇰', region: 'Europe' },
    { code: '+373', country: 'Moldova', flag: '🇲🇩', region: 'Europe' },
    { code: '+380', country: 'Ukraine', flag: '🇺🇦', region: 'Europe' },
    { code: '+375', country: 'Belarus', flag: '🇧🇾', region: 'Europe' },
    { code: '+370', country: 'Lithuania', flag: '🇱🇹', region: 'Europe' },
    { code: '+371', country: 'Latvia', flag: '🇱🇻', region: 'Europe' },
    { code: '+372', country: 'Estonia', flag: '🇪🇪', region: 'Europe' },
    { code: '+7', country: 'Russia', flag: '🇷🇺', region: 'Europe/Asia' },

    // North America
    { code: '+1', country: 'United States', flag: '🇺🇸', region: 'North America' },
    { code: '+1', country: 'Canada', flag: '🇨🇦', region: 'North America' },
    { code: '+52', country: 'Mexico', flag: '🇲🇽', region: 'North America' },

    // Central America & Caribbean
    { code: '+502', country: 'Guatemala', flag: '🇬🇹', region: 'Central America' },
    { code: '+503', country: 'El Salvador', flag: '🇸🇻', region: 'Central America' },
    { code: '+504', country: 'Honduras', flag: '🇭🇳', region: 'Central America' },
    { code: '+505', country: 'Nicaragua', flag: '🇳🇮', region: 'Central America' },
    { code: '+506', country: 'Costa Rica', flag: '🇨🇷', region: 'Central America' },
    { code: '+507', country: 'Panama', flag: '🇵🇦', region: 'Central America' },
    { code: '+501', country: 'Belize', flag: '🇧🇿', region: 'Central America' },
    { code: '+1', country: 'Jamaica', flag: '🇯🇲', region: 'Caribbean' },
    { code: '+1', country: 'Trinidad and Tobago', flag: '🇹🇹', region: 'Caribbean' },
    { code: '+1', country: 'Barbados', flag: '🇧🇧', region: 'Caribbean' },
    { code: '+53', country: 'Cuba', flag: '🇨🇺', region: 'Caribbean' },
    { code: '+1', country: 'Dominican Republic', flag: '🇩🇴', region: 'Caribbean' },
    { code: '+509', country: 'Haiti', flag: '🇭🇹', region: 'Caribbean' },

    // South America
    { code: '+55', country: 'Brazil', flag: '🇧🇷', region: 'South America' },
    { code: '+54', country: 'Argentina', flag: '🇦🇷', region: 'South America' },
    { code: '+56', country: 'Chile', flag: '🇨🇱', region: 'South America' },
    { code: '+57', country: 'Colombia', flag: '🇨🇴', region: 'South America' },
    { code: '+58', country: 'Venezuela', flag: '🇻🇪', region: 'South America' },
    { code: '+51', country: 'Peru', flag: '🇵🇪', region: 'South America' },
    { code: '+593', country: 'Ecuador', flag: '🇪🇨', region: 'South America' },
    { code: '+591', country: 'Bolivia', flag: '🇧🇴', region: 'South America' },
    { code: '+595', country: 'Paraguay', flag: '🇵🇾', region: 'South America' },
    { code: '+598', country: 'Uruguay', flag: '🇺🇾', region: 'South America' },
    { code: '+597', country: 'Suriname', flag: '🇸🇷', region: 'South America' },
    { code: '+594', country: 'French Guiana', flag: '🇬🇫', region: 'South America' },
    { code: '+592', country: 'Guyana', flag: '🇬🇾', region: 'South America' },

    // Africa
    { code: '+27', country: 'South Africa', flag: '🇿🇦', region: 'Africa' },
    { code: '+234', country: 'Nigeria', flag: '🇳🇬', region: 'Africa' },
    { code: '+20', country: 'Egypt', flag: '🇪🇬', region: 'Africa' },
    { code: '+254', country: 'Kenya', flag: '🇰🇪', region: 'Africa' },
    { code: '+233', country: 'Ghana', flag: '🇬🇭', region: 'Africa' },
    { code: '+212', country: 'Morocco', flag: '🇲🇦', region: 'Africa' },
    { code: '+216', country: 'Tunisia', flag: '🇹🇳', region: 'Africa' },
    { code: '+213', country: 'Algeria', flag: '🇩🇿', region: 'Africa' },
    { code: '+218', country: 'Libya', flag: '🇱🇾', region: 'Africa' },
    { code: '+249', country: 'Sudan', flag: '🇸🇩', region: 'Africa' },
    { code: '+251', country: 'Ethiopia', flag: '🇪🇹', region: 'Africa' },
    { code: '+256', country: 'Uganda', flag: '🇺🇬', region: 'Africa' },
    { code: '+255', country: 'Tanzania', flag: '🇹🇿', region: 'Africa' },
    { code: '+250', country: 'Rwanda', flag: '🇷🇼', region: 'Africa' },
    { code: '+257', country: 'Burundi', flag: '🇧🇮', region: 'Africa' },
    { code: '+260', country: 'Zambia', flag: '🇿🇲', region: 'Africa' },
    { code: '+263', country: 'Zimbabwe', flag: '🇿🇼', region: 'Africa' },
    { code: '+264', country: 'Namibia', flag: '🇳🇦', region: 'Africa' },
    { code: '+267', country: 'Botswana', flag: '🇧🇼', region: 'Africa' },
    { code: '+268', country: 'Eswatini', flag: '🇸🇿', region: 'Africa' },
    { code: '+266', country: 'Lesotho', flag: '🇱🇸', region: 'Africa' },
    { code: '+261', country: 'Madagascar', flag: '🇲🇬', region: 'Africa' },
    { code: '+230', country: 'Mauritius', flag: '🇲🇺', region: 'Africa' },
    { code: '+248', country: 'Seychelles', flag: '🇸🇨', region: 'Africa' },

    // Middle East
    { code: '+971', country: 'United Arab Emirates', flag: '🇦🇪', region: 'Middle East' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', region: 'Middle East' },
    { code: '+972', country: 'Israel', flag: '🇮🇱', region: 'Middle East' },
    { code: '+98', country: 'Iran', flag: '🇮🇷', region: 'Middle East' },
    { code: '+90', country: 'Turkey', flag: '🇹🇷', region: 'Middle East' },
    { code: '+962', country: 'Jordan', flag: '🇯🇴', region: 'Middle East' },
    { code: '+961', country: 'Lebanon', flag: '🇱🇧', region: 'Middle East' },
    { code: '+963', country: 'Syria', flag: '🇸🇾', region: 'Middle East' },
    { code: '+964', country: 'Iraq', flag: '🇮🇶', region: 'Middle East' },
    { code: '+965', country: 'Kuwait', flag: '🇰🇼', region: 'Middle East' },
    { code: '+968', country: 'Oman', flag: '🇴🇲', region: 'Middle East' },
    { code: '+973', country: 'Bahrain', flag: '🇧🇭', region: 'Middle East' },
    { code: '+974', country: 'Qatar', flag: '🇶🇦', region: 'Middle East' },
    { code: '+967', country: 'Yemen', flag: '🇾🇪', region: 'Middle East' },

    // Oceania
    { code: '+61', country: 'Australia', flag: '🇦🇺', region: 'Oceania' },
    { code: '+64', country: 'New Zealand', flag: '🇳🇿', region: 'Oceania' },
    { code: '+679', country: 'Fiji', flag: '🇫🇯', region: 'Oceania' },
    { code: '+676', country: 'Tonga', flag: '🇹🇴', region: 'Oceania' },
    { code: '+685', country: 'Samoa', flag: '🇼🇸', region: 'Oceania' },
    { code: '+684', country: 'American Samoa', flag: '🇦🇸', region: 'Oceania' },
    { code: '+689', country: 'French Polynesia', flag: '🇵🇫', region: 'Oceania' },
    { code: '+687', country: 'New Caledonia', flag: '🇳🇨', region: 'Oceania' },
    { code: '+678', country: 'Vanuatu', flag: '🇻🇺', region: 'Oceania' },
    { code: '+677', country: 'Solomon Islands', flag: '🇸🇧', region: 'Oceania' },
    { code: '+675', country: 'Papua New Guinea', flag: '🇵🇬', region: 'Oceania' },
    { code: '+691', country: 'Micronesia', flag: '🇫🇲', region: 'Oceania' },
    { code: '+680', country: 'Palau', flag: '🇵🇼', region: 'Oceania' },
    { code: '+692', country: 'Marshall Islands', flag: '🇲🇭', region: 'Oceania' },
    { code: '+686', country: 'Kiribati', flag: '🇰🇮', region: 'Oceania' },
    { code: '+688', country: 'Tuvalu', flag: '🇹🇻', region: 'Oceania' },
    { code: '+683', country: 'Niue', flag: '🇳🇺', region: 'Oceania' },
    { code: '+682', country: 'Cook Islands', flag: '🇨🇰', region: 'Oceania' }
  ];

  /**
   * Get all available phone codes
   */
  getPhoneCodes(): PhoneCode[] {
    return this.phoneCodes.sort((a, b) => a.country.localeCompare(b.country));
  }

  /**
   * Get popular/frequently used phone codes
   */
  getPopularPhoneCodes(): PhoneCode[] {
    const popularCountries = [
      'India', 'United States', 'United Kingdom', 'China', 'Japan', 
      'Germany', 'France', 'Italy', 'Spain', 'Australia', 'Canada',
      'Brazil', 'Russia', 'South Korea', 'Netherlands', 'Singapore'
    ];
    
    return this.phoneCodes
      .filter(pc => popularCountries.includes(pc.country))
      .sort((a, b) => {
        // Put India first, then sort alphabetically
        if (a.country === 'India') return -1;
        if (b.country === 'India') return 1;
        return a.country.localeCompare(b.country);
      });
  }

  /**
   * Get phone codes by region
   */
  getPhoneCodesByRegion(region: string): PhoneCode[] {
    return this.phoneCodes
      .filter(pc => pc.region === region)
      .sort((a, b) => a.country.localeCompare(b.country));
  }

  /**
   * Get country name by phone code
   */
  getCountryByCode(phoneCode: string): string | null {
    const phoneCodeInfo = this.phoneCodes.find(pc => pc.code === phoneCode);
    return phoneCodeInfo ? phoneCodeInfo.country : null;
  }

  /**
   * Get phone code by country name
   */
  getCodeByCountry(countryName: string): string | null {
    const phoneCodeInfo = this.phoneCodes.find(pc => 
      pc.country.toLowerCase() === countryName.toLowerCase()
    );
    return phoneCodeInfo ? phoneCodeInfo.code : null;
  }

  /**
   * Search phone codes by country name
   */
  searchPhoneCodes(searchTerm: string): PhoneCode[] {
    const term = searchTerm.toLowerCase();
    return this.phoneCodes
      .filter(pc => 
        pc.country.toLowerCase().includes(term) || 
        pc.code.includes(searchTerm)
      )
      .sort((a, b) => a.country.localeCompare(b.country));
  }

  /**
   * Format phone number with country code
   */
  formatPhoneNumber(phoneCode: string, phoneNumber: string): string {
    return `${phoneCode} ${phoneNumber}`;
  }

  /**
   * Validate phone number format (basic validation)
   */
  isValidPhoneNumber(phoneNumber: string): boolean {
    // Basic validation - adjust as needed
    const phoneRegex = /^[\+]?[\s\-\(\)]?[\d\s\-\(\)]{7,}$/;
    return phoneRegex.test(phoneNumber);
  }

  /**
   * Get default phone code (India +91)
   */
  getDefaultPhoneCode(): PhoneCode {
    return this.phoneCodes.find(pc => pc.code === '+91' && pc.country === 'India')!;
  }

  /**
   * Get all available regions
   */
  getRegions(): string[] {
    const regions = [...new Set(this.phoneCodes.map(pc => pc.region).filter((r): r is string => r !== undefined))];
    return regions.sort();
  }
}