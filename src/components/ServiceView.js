import React, { useContext } from 'react';
import { StationScroll } from './StationScroll';
import State from '../state';

import '../assets/styles/StationScroll.scss';

export const ServiceView = ({ services, stops, departure }) => {
  const { isLandscape } = useContext(State);
  const { platform } = services[0];
  const showPlatform = platform && !isLandscape ? 'showPlatform' : '';
  const scrollMin = isLandscape ? 5 : 8;

  return (
    <div className={`scrollView ${isLandscape ? 'landscape' : ''}`}>
      <div className="scrollContainer">
        <StationScroll type={services[0]?.type} stops={stops} limit={scrollMin} />
      </div>
      <div className={`infoContainer ${showPlatform}`}>
        <div className="titlePair platform">
          <div className="title">{platform?.title}</div>
          <div className="value">{platform?.value}</div>
        </div>
        {departure && <>
          <div className="titlePair">
            <div className="title">Departs</div>
            <div className="value">{departure}</div>
          </div>
        </>}
      </div>
    </div>
  );
};
