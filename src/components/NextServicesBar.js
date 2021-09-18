import React, { useContext } from 'react';
import { DepartureTimeCountdown, truncateStationName } from '../util';
import State from '../state';
import '../assets/styles/NextServicesBar.scss';

export const NextServicesBar = ({ services }) => {
  const { theme } = useContext(State);
  const servicesLimit = 2;

  return <div className={`nextServices ${theme}`}>
    <div className="rows">
      <div className="row">
        <div className="cell">Next Services</div>
        <div className="cell">Platform</div>
        <div className="cell">Departs</div>
      </div>
      {services.slice(1, servicesLimit + 1).map(i =>
        <NextServiceItem service={i} key={i.id} />
      )}
    </div>
  </div>;
};

const NextServiceItem = ({ service }) => {
  let [lineTo, lineVia] = service.destination
    ? service.destination.includes('via')
      ? service.destination.split(' via ')
      : service.destination.split()
    : [null, null];

  return <>
    <div className="row">
      <div className="cell">{truncateStationName(lineTo)}</div>
      <div className="cell">{service.platform.value}</div>
      <div className="cell">{DepartureTimeCountdown(service.departs)}</div>
    </div>
    <div className="row via">{lineVia && 'via ' + lineVia}</div>
  </>;
};
