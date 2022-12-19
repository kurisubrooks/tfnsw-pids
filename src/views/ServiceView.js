import React, { useContext } from 'react';
import { StationScroll } from '../components/StationScroll';
import { Badges } from '../components/Badge';
import State from '../state';

import '../assets/styles/StationScroll.scss';
import { ServiceIcon } from '../components/ServiceIcon';

export const ServiceView = ({ services, stops, departure }) => {
  const { isLandscape, theme } = useContext(State);
  const { platform, cars, isExpress, isLimitedStops, isBookingRequired, doesNotStop, terminates } = services[0];
  console.log(services[0]);
  const scrollMin = isLandscape ? 5 : 8;

  if (doesNotStop) return <DoesNotStopView services={services} stops={stops} departure={departure} />;

  return (
    <div className={`scroll_view ${theme}`}>
      <div className="scroll_container">
        <StationScroll stops={stops} limit={scrollMin} />
      </div>
      <div className="info_container">
        <div className="titlePair platform">
          <div className="title">{platform?.title}</div>
          <div className="value">{platform?.value}</div>
        </div>
        <Badges hasBooking={isBookingRequired} items={[
          cars && cars + ' cars',
          isLimitedStops !== null && (isExpress ? 'Express' : isLimitedStops ? 'Limited Stops' : 'All Stops')
        ]} />
        {departure && <>
          <div className="titlePair">
            <div className="title">Departs</div>
            <div className="value">{departure}</div>
          </div>
        </>}
      </div>
      <div className="bar_container">
        <Badges hasBooking={isBookingRequired} items={[
          cars && cars + ' cars',
          isLimitedStops !== null && (isExpress ? 'Express' : isLimitedStops ? 'Limited Stops' : 'All Stops')
        ]} />
      </div>
    </div>
  );
};

const DoesNotStopView = ({ services, stops, departure }) => {
  const { isLandscape, theme } = useContext(State);
  const { platform, cars, isExpress, isLimitedStops, isBookingRequired } = services[0];
  const scrollMin = isLandscape ? 5 : 8;

  return (
    <div className={`scroll_view doesnotstop ${theme}`}>
      <ServiceIcon icon="information" />
      <h1>Next train does not stop</h1>
      <h3>Please stand behind the yellow platform line.</h3>
    </div>
  );
};
