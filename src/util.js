/* eslint-disable prefer-template */

// TIME
export const pad = t => {
  return String(t).length === 1 ? '0' + t : t;
};

export const DepartureTimeCountdown = time => {
  if (!time) return null;

  // 1h 54 min
  const now = new Date().getTime();
  const timeTilDepart = new Date(time).getTime();
  const dist = timeTilDepart - now;

  const days = Math.floor(dist / (1000 * 60 * 60 * 24));
  const hours = Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((dist % (1000 * 60)) / 1000);

  if (days > 0) {
    return `${days}d, ${hours}hr ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}hr ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes} min`;
  } else if (seconds < 0) {
    return seconds;
  }

  return 'Now';
};

export const DepartureTime = time => {
  if (!time) return false;
  const ref = new Date(time);
  return pad(ref.getHours()) + ':' + pad(ref.getMinutes());
};

export const NetworkTime = () => {
  // implement NTP
  const ref = new Date();
  return pad(ref.getHours()) + ':' + pad(ref.getMinutes()) + ':' + pad(ref.getSeconds());
};

// DATA CONVERSION
export const idToType = id => {
  const typeRef = {
    '-1': 'none',
    '1': 'train', // train
    '2': 'intercity', // intercity
    '3': 'intercity', // trainlink (xpt, ghan, etc.)
    '5': 'bus', // bus
    '7': 'coach', // coach
    '9': 'coach', // coach (private)
    '10': 'ferry', // ferry
    '11': 'ferry', // ferry (???)
    '12': 'ferry', // ferry (private)
    '13': 'lightrail', // light rail
    '14': 'bus', // replacement buses
    '24': 'metro' // metro
  };

  return { id, name: typeRef[id] || null };
};

export const lineColour = (line, type) => {
  const lineColours = {
    'blank': 'rgba(0,0,0,0)',

    'T1': '#f89c1d',
    'T2': '#0097cd',
    'T3': '#f36e22',
    'T4': '#015aa5',
    'T5': '#c32191',
    'T7': '#6f808e',
    'T8': '#02964c',
    'T9': '#d21f2f',

    'L1': '#99202b',
    'L2': '#cb232b',
    'L3': '#631835',

    'F1': '#04764a',
    'F2': '#234635',
    'F3': '#6b8b4e',
    'F4': '#c4d552',
    'F5': '#376044',
    'F6': '#4ca75b',
    'F7': '#4fad8a',
    'F8': '#586132',
    'F9': '#78b856',

    'T': '#de4126',
    'L': '#e61e30',
    'B': '#00ade8',
    'C': '#742283',
    'M': '#009599',
    'F': '#57b948'
  };

  const fallback = {
    'none': 'blank',
    'train': 'T',
    'intercity': 'T',
    'bus': 'B',
    'coach': 'C',
    'ferry': 'F',
    'lightrail': 'L',
    'metro': 'M'
  };

  return lineColours[line] || lineColours[fallback[type?.name || 'T']];
};

export const nameTransform = name => {
  const reg = name.replace(/( \d)|( |,\s)(Station|Light Rail|Wharf|Side [a-z|A-Z]*|Platform \d*)/g, '');
  return truncateStationName(reg);
};

export const truncateStationName = name => {
  const names = {
    'Macquarie Fields': 'Macquarie Flds',
    'Macquarie University': 'Macquarie Uni',
    'Hawkesbury River': 'Hawkesbury Rvr',
    'Newcastle Interchange': 'Newcastle Intg',
    'North Strathfield': 'N Strathfield',
    'North Wollongong': 'N Wollongong',
    'Sydney Olympic Park': 'Olympic Park'
  };

  return names[name] || name;
};
