// TIME
export const pad = (t: string | number): string => {
  return String(t).length === 1 ? '0' + t : String(t);
};

export const DepartureTimeCountdown = (time?: number | null): string | null => {
  if (!time) return null;

  // 1h 54 min
  const now = new Date().getTime() / 1000;
  const timeTilDepart = time - 20;
  const secondsToGo = timeTilDepart - now;

  const days = Math.floor(secondsToGo / (60 * 60 * 24));
  const hours = Math.floor((secondsToGo % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((secondsToGo % (60 * 60)) / 60);
  const seconds = Math.floor(secondsToGo % 60);

  if (days > 0) {
    return `${days} days`;
  } else if (hours > 0) {
    return `${hours}hr ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes} min`;
  } else if (seconds >= 0 && seconds <= 60) {
    return '1 min';
  } else if (seconds < 0) {
    return null;
  }

  return `${days}d ${hours}hr ${minutes}m ${seconds}s`;
};

export const DepartureTime = (time?: number | string | Date | null): string | false => {
  if (!time) return false;
  const ref = new Date(time);
  return ref.getHours() + ':' + pad(ref.getMinutes());
};

export const NetworkTime = (): string => {
  // implement NTP
  const ref = new Date();
  return pad(ref.getHours()) + ':' + pad(ref.getMinutes()) + ':' + pad(ref.getSeconds());
};

// DATA CONVERSION
export const modeToType = (mode: string, isIntercity?: boolean): string => {
  const type = mode.replace('au2:', '');
  const types: Record<string, string> = {
    'sydneytrains': 'train', // Sydney Trains
    'intercity': 'intercity', // Sydney Trains (Intercity)
    'nswtrains': 'trainlink', // NSW TrainLink
    'lightrail': 'lightrail', // Sydney Light Rail
    'ferries': 'ferry', // Sydney Ferries
    'metro': 'metro', // Sydney Metro
    'nswcoaches': 'coach', // Coach
    'tempbuses': 'bus', // Bus
    'buses': 'bus' // Bus
  };

  if (type === 'sydneytrains' && isIntercity) {
    return types.intercity;
  }

  return types[type] || 'train';
};

export const lineColour = (line?: string | null, type?: string | null): string => {
  const lineColours: Record<string, string> = {
    // trains
    'T1': '#f89c1d', 'T2': '#0097cd', 'T3': '#f36e22', 'T4': '#015aa5', 'T5': '#c32191', 'T7': '#6f808e', 'T8': '#02964c', 'T9': '#d21f2f',

    // ferries
    'F1': '#04764a', 'F2': '#234635', 'F3': '#6b8b4e', 'F4': '#c4d552', 'F5': '#376044', 'F6': '#4ca75b', 'F7': '#4fad8a', 'F8': '#586132', 'F9': '#78b856',

    // light rail
    'L1': '#99202b', 'L2': '#cb232b', 'L3': '#631835'
  };

  const serviceColours: Record<string, string> = {
    'train': '#e65010',
    'intercity': '#e98000',
    'trainlink': '#e65010',
    'lightrail': '#e61e30',
    'bus': '#00ade8',
    'coach': '#742283',
    'metro': '#009599',
    'ferry': '#57b948',
    'none': 'rgba(0, 0, 0, 0)'
  };

  return (line && lineColours[line]) ? lineColours[line] : serviceColours[type || 'train'];
};

export const nameTransform = (name: string): string => {
  const reg = name.replace(/( \d)|( |,\s)(Station|Light Rail|Wharf|Side [a-z|A-Z]*|Platform \d*)/g, '');
  return truncateStationName(reg);
};

export const truncateStationName = (name: string): string => {
  const names: Record<string, string> = {
    'Bondi Junction': 'Bondi Jn',
    'Domestic Airport': 'Domestic \u2708',
    'Sydney Domestic Airport': 'Domestic Airport',
    'International Airport': 'International \u2708',
    'Sydney International Airport': 'International Airport',
    'Macquarie Fields': 'Macquarie Flds',
    'Macquarie University': 'Macquarie Uni',
    'Mount Colah': 'Mt Colah',
    'Mount Druitt': 'Mt Druitt',
    'Mount Kuring-gai': 'Mt Kuring-gai',
    'North Strathfield': 'N Strathfield',
    'Mount Victoria': 'Mt Victoria',
    'Hawkesbury River': 'Hawkesbury Rvr',
    'North Wollongong': 'N Wollongong',
    'Newcastle Interchange': 'Newcastle Intg',
    'Shellharbour Junction': 'Shellhbr Jn',
    'Shellharbour': 'Shellhbr Jn',
    'Sydney Olympic Park': 'Olympic Park',
    'Port Kembla North': 'Port Kembla N',
    'Victoria Street': 'Victoria St',
    'via Airport stations': 'via Airport stations \u2708',
    'Capital Square': 'Capital Sq',
    'Exhibition Centre': 'Exhibition',
    'Convention Centre': 'Convention',
    'John Street Square': 'John Street Sq',
    'Allworth Turnoff': 'Allworth tf',
    'Billinudgel Turnoff': 'Billinudgel tf',
    'Carrathool Turnoff': 'Carrathool tf',
    'Mount George Turnoff': 'Mt George tf',
    'Mt George Turnoff': 'Mt George tf',
    'Mount Russell Turnoff': 'Mt Russell tf',
    'Mt Russell Turnoff': 'Mt Russell tf',
    'Brisbane (Roma Street)': 'Brisbane',
    'Melbourne (Southern Cross)': 'Melbourne',
    'Broken Hill Town': 'Broken Hill Tn',
    'Condobolin Town': 'Condobolin Tn',
    'Gloucester Town': 'Gloucester Tn',
    'Mooree Town': 'Mooree Tn',
    'Brunswick Heads': 'Brunswick Hds',
    'Burleigh Heads': 'Burleigh Hds',
    'Lennox Head': 'Lennox Hd',
    'South Tweed Heads': 'Sth Tweed Hds',
    'Tweed Heads': 'Tweed Hds',
    'Limeburners Creek': 'Limeburners Ck',
    'Raymond Terrace': 'Raymond Tce'
  };

  return names[name] || name;
};
