import React, { useContext } from 'react';
import { ServiceView } from './ServiceView';
import { ServiceBar } from '../components/ServiceBar';
import { NextServicesBar } from '../components/NextServicesBar';
import State from '../state';

export const NextTrainView = ({ services, departureTimer }) => {
  const { isLandscape } = useContext(State);
  return <>
    <ServiceBar service={services[0]} />
    <ServiceView services={services} stops={services[0]?.stops} departure={departureTimer} />
    {!isLandscape && <NextServicesBar services={services} />}
  </>;
};
