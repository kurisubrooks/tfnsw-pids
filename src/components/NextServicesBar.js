import React, { useContext } from 'react';
import { DepartureTimeCountdown, truncateStationName } from '../util';
import { Badges } from './Badge';
import State from '../state';
import '../assets/styles/NextServicesBar.scss';

export const NextServicesBar = ({ services }) => {
  const { theme } = useContext(State);
  const servicesLimit = 2;

  return <div className={`following_services ${theme}`}>
    <div className="rows">
      <div className="row">
        <div className="cell">Next Services</div>
        <div className="cell">Platform</div>
        <div className="cell">Departs</div>
      </div>
      {services.slice(1, servicesLimit + 1).map(i => {
        return <NextServiceItem service={i} key={i.id ? i.id : Math.random()} />;
      }
      )}
    </div>
  </div>;
};

const NextServiceItem = ({ service }) => {
  const serviceBadge = service.isLimitedStops !== null && (service.isExpress ? 'Express' : service.isLimitedStops ? 'Limited Stops' : 'All Stops');
  return <>
    <div className="row row-primary">
      <div className="cell">{truncateStationName(service.destination.to)}</div>
      <div className="cell">{service.platform.value}</div>
      <div className="cell">{DepartureTimeCountdown(service.departs)}</div>
    </div>
    <div className="row via">
      {service.destination.via && <div className="via-text">{service.destination.via}</div>}
      <Badges items={[serviceBadge]} />
    </div>
  </>;
};
