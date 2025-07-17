// src/app/models/user-profile.model.ts

export interface UserProfileForm {
  firstName: string;
  surname: string; // Maps to lastName on backend
  nationalCode: string; // Maps to futureI1
  dob: string | null; // Send as ISO string or null
  educationLevel: string; // Maps to futureV1
  email: string; // From backend (read-only for update)
  phoneCountry: string; // Maps to futureV2
  phoneNumber: string;
  country: string; // Maps to futureV3
  city: string; // Maps to futureV4
  updatedAt: string; // From backend (read-only for update)
  username: string;
  emailVerified: boolean; // From backend (read-only for update)
  authProvider: string; // From backend (read-only for update)
}

// Response DTO from backend (UserResponseDTO equivalent)
export interface UserBackendResponse {
  userId: string; // UUID from backend
  id: string; // Primary key from backend
  userCode: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string; // Maps to surname on frontend
  phoneNumber: string;
  location: string;
  role: 'USER' | 'ADMIN';
  tfaEnabled: boolean;
  brandId: string;
  emailVerified: boolean;
  authProvider: 'LOCAL' | 'GOOGLE';
  profilePictureUrl: string | null;
  createdAt: string;
  updatedAt: string;

  // Future fields
  futureV1: string; // Maps to educationLevel
  futureV2: string; // Maps to phoneCountry
  futureV3: string; // Maps to country
  futureV4: string; // Maps to city
  futureV5: string;

  futureI1: string; // Maps to nationalCode
  futureI2: string;
  futureI3: string;
  futureI4: string;
  futureI5: string;

  futureT1: string; // Maps to dob (Date string)
  futureT2: string;
  futureT3: string;
}

// Request DTO for update (UserProfileUpdateRequestDTO equivalent)
export interface UserProfileUpdateRequest {
  firstName?: string;
  surname?: string; // Maps to lastName
  nationalCode?: string; // Maps to futureI1
  dob?: string | null; // Must be ISO string or null
  educationLevel?: string; // Maps to futureV1
  // email, updatedAt, emailVerified, authProvider are explicitly excluded from being sent
  phoneCountry?: string; // Maps to futureV2
  phoneNumber?: string;
  country?: string; // Maps to futureV3
  city?: string; // Maps to futureV4
  username?: string;
}