import React from 'react';

import { ServiceBar } from '../components/ServiceBar';
import { ServiceIcon } from '../components/ServiceIcon';

const schema = [
  { id: null, cars: null, line: 'BMT', mode: 'intercity', departs: null, serviceTime: new Date('December 17, 1995 23:18:00').getTime(), destination: { to: 'Mt Victoria', via: 'via Parramatta' }, platform: { title: 'Platform', value: '12' }, doesNotStop: false, isBookingRequired: false, isExpress: false, isLimitedStops: false, isIntercity: true, stops: [] },
  { id: null, cars: null, line: 'T1', mode: 'train', departs: null, serviceTime: null, destination: { to: 'Emu Plains', via: 'via Blacktown' }, platform: { title: 'Platform', value: '13' }, doesNotStop: false, isBookingRequired: false, isExpress: false, isLimitedStops: false, isIntercity: true, stops: [] }
];

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

      <ServiceBar time={false} service={schema[1]} />
      <ServiceBar time={false} service={schema[0]} />
    </div>
  );
};
