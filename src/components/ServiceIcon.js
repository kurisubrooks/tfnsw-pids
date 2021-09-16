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

// SHL,SCO,HUN,WST,STH,NRW,NRC,CCN,BMT

export const ServiceIcon = ({ line, type }) => {
  if (line === 'error') {
    return <div className="icon">
      <div className="square" style={{ backgroundColor: '#333' }}>!</div>
    </div>;
  }

  if (['intercity', 'coach', 'metro'].indexOf(type.name) === -1) {
    const colour = lineColour(line, type);

    return <div className="icon">
      <div
        className={`square ${type.name}`}
        style={{ backgroundColor: colour, color: line ? '#FFF' : '#000' }}
      >
        {line}
      </div>
    </div>;
  }

  return (
    <div className="icon">
      <div
        className={`round ${type.name !== 'metro' && 'small'}`}
        style={{ backgroundColor: lineColour(line, type) }}
      >
        {typeToText[type.name]}
      </div>
    </div>
  );
};
