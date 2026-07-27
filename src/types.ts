export interface Destination {
  to: string | null;
  via: string | null;
}

export interface Platform {
  title: string | null;
  value: string | null;
}

export interface Service {
  id: string | null;
  cars: number | string | null;
  line: string | null;
  mode: string | null;
  departs: number | null;
  serviceTime: number | null;
  destination: Destination;
  platform: Platform;
  doesNotStop: boolean | null;
  isBookingRequired: boolean | null;
  isExpress: boolean | null;
  isLimitedStops: boolean | null;
  isIntercity: boolean | null;
  terminates?: boolean;
  stops: string[];
}

export interface StateContextType {
  theme?: 'dark' | 'light' | string;
  serviceTitle?: string | null;
  isLandscape?: boolean | null;
}
