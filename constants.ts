
import { WifiPass } from './types';

export const WIFI_PASSES: WifiPass[] = [
  {
    id: 'pass-100',
    price: 100,
    label: 'Basic Pass',
    duration: '3 Heures',
    dataLimit: 'Illimité',
    icon: 'fa-bolt',
    color: 'bg-blue-500'
  },
  {
    id: 'pass-150',
    price: 150,
    label: 'Social Pass',
    duration: '8 Heures',
    dataLimit: 'Illimité',
    icon: 'fa-users',
    color: 'bg-indigo-500'
  },
  {
    id: 'pass-200',
    price: 200,
    label: 'Standard Pass',
    duration: '12 Heures',
    dataLimit: 'Illimité',
    icon: 'fa-wifi',
    color: 'bg-purple-500'
  },
  {
    id: 'pass-300',
    price: 300,
    label: 'Streamer Pass',
    duration: '24 Heures',
    dataLimit: 'Illimité',
    icon: 'fa-play',
    color: 'bg-pink-500'
  },
  {
    id: 'pass-500',
    price: 500,
    label: 'Unlimited Day',
    duration: '48 Heures',
    dataLimit: 'Illimité',
    icon: 'fa-crown',
    color: 'bg-amber-500'
  }
];

export const FEDAPAY_PUBLIC_KEY = "pk_live_MPRF2l_yxwIGWPVpR0-c3eIY";
