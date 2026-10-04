import { RegionOption, StoreChain, RetailerId } from '../types/grocery';

export const CANADIAN_REGIONS: RegionOption[] = [
  {
    id: 'BC-VAN',
    name: 'BC - Greater Vancouver',
    province: 'BC',
    postalCode: 'V5K0A1',
    description: 'Lower Mainland / Vancouver / Burnaby / Richmond',
  },
  {
    id: 'ON-TOR',
    name: 'ON - Greater Toronto Area',
    province: 'ON',
    postalCode: 'M5V2T6',
    description: 'Toronto / GTA / Markham / Mississauga',
  },
  {
    id: 'AB-CAL',
    name: 'AB - Calgary & Edmonton',
    province: 'AB',
    postalCode: 'T2P1J9',
    description: 'Calgary / Edmonton / Southern Alberta',
  },
  {
    id: 'ON-OTT',
    name: 'ON - Ottawa',
    province: 'ON',
    postalCode: 'K1P1J1',
    description: 'National Capital Region / Eastern Ontario',
  },
];

export interface RetailerConfig {
  id: RetailerId;
  name: StoreChain;
  bannerGroup: string;
  website: string;
  primaryBrand: string;
  color: string;
}

export const TARGET_RETAILERS: RetailerConfig[] = [
  {
    id: 'saveon',
    name: 'Save-On',
    bannerGroup: 'Pattison Food Group',
    website: 'https://www.saveonfoods.com',
    primaryBrand: 'Western Family',
    color: '#15803D', // emerald green
  },
  {
    id: 'nofrills',
    name: 'No Frills',
    bannerGroup: 'Loblaw Companies',
    website: 'https://www.nofrills.ca',
    primaryBrand: 'No Name',
    color: '#CA8A04', // yellow / gold
  },
  {
    id: 'walmart',
    name: 'Walmart',
    bannerGroup: 'Walmart Canada',
    website: 'https://www.walmart.ca',
    primaryBrand: 'Great Value',
    color: '#0284C7', // blue
  },
  {
    id: 'tnt',
    name: 'T&T',
    bannerGroup: 'T&T Supermarket / Loblaw',
    website: 'https://www.tntsupermarket.com',
    primaryBrand: 'T&T',
    color: '#DC2626', // red
  },
  {
    id: 'loblaws',
    name: 'Loblaws',
    bannerGroup: 'Loblaw Companies',
    website: 'https://www.loblaws.ca',
    primaryBrand: 'President\'s Choice',
    color: '#7C3AED', // purple
  },
  {
    id: 'metro',
    name: 'Metro',
    bannerGroup: 'Metro Inc.',
    website: 'https://www.metro.ca',
    primaryBrand: 'Selection',
    color: '#E11D48', // rose / crimson
  },
  {
    id: 'foodbasics',
    name: 'Food Basics',
    bannerGroup: 'Metro Inc. (Discount)',
    website: 'https://www.foodbasics.ca',
    primaryBrand: 'Selection / Irresistibles',
    color: '#16A34A', // green
  },
  {
    id: 'sobeys',
    name: 'Sobeys',
    bannerGroup: 'Empire Company',
    website: 'https://www.sobeys.com',
    primaryBrand: 'Compliments',
    color: '#0D9488', // teal
  },
  {
    id: 'freshco',
    name: 'FreshCo',
    bannerGroup: 'Empire Company (Discount)',
    website: 'https://www.freshco.com',
    primaryBrand: 'Compliments Value',
    color: '#84CC16', // lime
  },
  {
    id: 'costco',
    name: 'Costco',
    bannerGroup: 'Costco Wholesale Canada',
    website: 'https://www.costco.ca',
    primaryBrand: 'Kirkland Signature',
    color: '#2563EB', // royal blue
  },
];
