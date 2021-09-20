import React, { useContext } from 'react';
import { StationScroll } from '../components/StationScroll';
import State from '../state';

import '../assets/styles/StationScroll.scss';

export const ServiceView = ({ services, stops, departure }) => {
  const { isLandscape, theme } = useContext(State);
  const { platform, cars, isExpress, isLimitedStops, isBookingRequired } = services[0];
  const scrollMin = isLandscape ? 5 : 8;

  return (
    <div className={`scrollView ${isLandscape ? 'landscape' : ''} ${theme}`}>
      <div className="scrollContainer">
        <StationScroll stops={stops} limit={scrollMin} />
      </div>
      <div className="infoContainer">
        <div className="titlePair platform">
          <div className="title">{platform?.title}</div>
          <div className="value">{platform?.value}</div>
        </div>
        <div className="badge__stack">
          {isBookingRequired && <div className="badge__group">
            <div className="badge badge-booking">Booked seats only</div>
          </div>}
          <div className="badge__group">
            {cars && <div className="badge">{cars} cars</div>}
            {isLimitedStops !== null && <div className="badge">{isExpress ? 'Express' : isLimitedStops ? 'Limited Stops' : 'All Stops'}</div>}
          </div>
        </div>
        {departure && <>
          <div className="titlePair">
            <div className="title">Departs</div>
            <div className="value">{departure}</div>
          </div>
        </>}
      </div>
      <div className="bar__bottom">
        <div className="badge__stack">
          <div className="badge__group">
            {cars && <div className="badge">{cars} cars</div>}
            {isLimitedStops !== null && <div className="badge">{isExpress ? 'Express' : isLimitedStops ? 'Limited Stops' : 'All Stops'}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
