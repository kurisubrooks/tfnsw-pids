import React from 'react';

import { ServiceBar } from './ServiceBar';
import { ServiceIcon } from './ServiceIcon';

const schema2 = { id: null, type: { id: 1, name: 'train' }, departs: new Date() + 500000, line: 'T1', destination: 'Emu Plains via Parramatta', origin: null, platform: { title: 'Platform', value: '1' }, stops: [], booking: false };
const schema = { id: null, type: { id: 2, name: 'intercity' }, departs: new Date() + 500000, line: 'T1', destination: 'Mt Victoria via Parramatta', origin: null, platform: { title: 'Platform', value: '12' }, stops: [], booking: false };

export const DebugView = () => {
  return (
    <div style={{ padding: '1em' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <ServiceIcon line="T9" type="train" />
        <ServiceIcon line="T1" type="train" />
        <ServiceIcon line="T8" type="train" />
        <ServiceIcon line="T2" type="train" />
        <ServiceIcon line="T5" type="train" />
        <ServiceIcon line="T7" type="train" />

        <ServiceIcon line="F9" type="ferry" />
        <ServiceIcon line="552" type="bus" />
        <ServiceIcon line="M" type="metro" />

        <ServiceIcon icon="information" />
        <ServiceIcon icon="outofservice" />

        <ServiceIcon />

        <ServiceIcon line="T" type="intercity" />
        <ServiceIcon line="C" type="coach" />
      </div>

      <ServiceBar time={false} service={schema2} />
      <ServiceBar time={false} service={schema} />
    </div>
  );
};
