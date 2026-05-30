/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'hi' | 'en';

export interface ServiceItem {
  id: string;
  nameHi: string;
  nameEn: string;
  descriptionHi: string;
  descriptionEn: string;
  iconName: string;
  basePrice: number;
  categoryHi: string;
  categoryEn: string;
}

export interface StatMetric {
  id: string;
  labelHi: string;
  labelEn: string;
  valueHi: string;
  valueEn: string;
  subtextHi: string;
  subtextEn: string;
  iconName: string;
  colorClass: string;
}

export interface Founder {
  name: string;
  roleHi: string;
  roleEn: string;
  bioHi: string;
  bioEn: string;
  imageIcon: string;
}

export interface CharacteristicItem {
  id: string;
  titleHi: string;
  titleEn: string;
  descHi: string;
  descEn: string;
  iconName: string;
}

export interface Booking {
  id: string;
  serviceId: string;
  serviceNameHi: string;
  serviceNameEn: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  slotDate: string;
  slotTime: string;
  price: number;
  status: 'CONFIRMED' | 'PARTNER_ASSIGNED' | 'PARTNER_TRAVELING' | 'PARTNER_REACHED' | 'SERVICE_STARTED' | 'SERVICE_IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  partnerName: string;
  partnerPhone: string;
  partnerRating: number;
  timestamp: string; // original creation time
  statusHistory?: { status: string; timestamp: string }[];
}

export interface User {
  fullName: string;
  email: string;
  mobile: string;
  passwordHash: string; // obfuscated/hashed password for local simulation
  registeredAt: string;
  role?: 'customer' | 'admin' | 'provider';
}

export interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
}

export interface UserReview {
  id: string;
  userNameHi: string;
  userNameEn: string;
  rating: number;
  commentHi: string;
  commentEn: string;
  serviceId: string;
  date: string;
  locationHi: string;
  locationEn: string;
}
