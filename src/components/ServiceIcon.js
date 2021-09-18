import { lineColour } from '../util';
import '../assets/styles/ServiceBar.scss';

const typeToText = {
  'train': 'T',
  'intercity': 'T',
  'bus': 'B',
  'coach': 'C',
  'metro': 'M',
  'lightrail': 'L',
  'ferry': 'F'
};

export const ServiceIcon = ({ line, type, icon }) => {
  // Pre-determined Icons
  if (icon) {
    if (icon === 'information') {
      return <Icon shape="square" text="!" colour="#333" />;
    } else if (icon === 'outofservice') {
      return <Icon shape="circle" text="—" colour="#e61e30" />;
    }
  }

  if (!line) type = 'blank';
  const isRound = ['intercity', 'coach', 'metro'].indexOf(type) > -1;
  const colour = lineColour(line, type);
  const size = isRound && type !== 'metro' ? 'small' : '';
  const text = isRound ? typeToText[type] : line;

  return <>
    <Icon
      shape={isRound ? 'circle' : 'square'}
      colour={colour} size={size} text={text}
    />
  </>;
};

const Icon = ({ shape, text, size, colour }) => {
  const classes = `${shape} ${size}`;

  return <div className="icon">
    <div className={classes} style={{ backgroundColor: colour }}>{text}</div>
  </div>;
};
