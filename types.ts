
export interface WifiPass {
  id: string;
  price: number;
  label: string;
  duration: string;
  dataLimit: string;
  icon: string;
  color: string;
}

export interface CustomerInfo {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  country: string;
  idReference: string;
  whatsappNumber: string;
}

export enum PaymentStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
