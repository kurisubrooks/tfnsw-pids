import { ServiceView } from './ServiceView';
import { ServiceBar } from '../components/ServiceBar';
import { NextServicesBar } from '../components/NextServicesBar';

export const NextTrainView = ({ services, departureTimer }) => {
  return <>
    <ServiceBar service={services[0]} />
    <ServiceView services={services} stops={services[0]?.stops} departure={departureTimer} />
    <NextServicesBar />
  </>;
};
