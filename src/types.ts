export enum UserRole {
  DONOR = 'donor',
  NGO = 'ngo',
  ADMIN = 'admin'
}

export enum FoodCategory {
  VEG = 'veg',
  NON_VEG = 'non-veg'
}

export enum DonationStatus {
  AVAILABLE = 'available',
  REQUESTED = 'requested',
  ACCEPTED = 'accepted',
  PICKED_UP = 'picked up',
  COMPLETED = 'completed'
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  address: string;
  phoneNumber: string;
  verified: boolean;
  createdAt?: string;
}

export interface FoodDonation {
  id: string; // Document ID
  donorId: string;
  donorName: string;
  foodName: string;
  quantity: string;
  category: FoodCategory;
  pickupLocation: string;
  preparedTime: string;
  expiryTime: string;
  imageURL: string;
  status: DonationStatus;
  createdAt: string;
}

export interface PickupRequest {
  id: string; // Document ID
  ngoId: string;
  ngoName: string;
  donationId: string;
  donorId: string;
  requestStatus: DonationStatus;
  timestamp: string;
}

export interface UserNotification {
  id: string; // Document ID
  receiverId: string;
  message: string;
  readStatus: boolean;
  createdAt: string;
}

export interface LivingActivity {
  id: string;
  message: string;
  timestamp: string;
}
