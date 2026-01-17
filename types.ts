
export interface Attendee {
  id: string;
  name: string;
  email: string;
  formFilled: boolean;
  qrScanned: boolean; 
  locationVerified: boolean;
  certificateSent: boolean;
  timestamp?: string;
}

export interface EventConfig {
  eventName: string;
  targetLat: number;
  targetLng: number;
  radiusMeters: number;
  certificateTemplate?: string;
}

export enum AppTab {
  DASHBOARD = 'dashboard',
  REGISTRATION = 'registration',
  CERTIFICATES = 'certificates',
  SETTINGS = 'settings'
}
