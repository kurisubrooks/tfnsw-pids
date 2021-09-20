import React from 'react';
import Marquee from './Marquee.js';

import plane from '../assets/icons/airport.svg';
import '../assets/styles/StationScroll.scss';

const icons = {
  'plane': plane
};

export const StationScroll = ({ stops, limit, speed = 75 }) => {
  if (!stops) return false;
  const buffer = ['', ''];
  const stopsJoined = stops.concat(buffer);

  const scroll = stops.length > limit;
  const scrollSpeed = speed * (window.innerHeight / 650);

  return (
    <div className="stationScroll">
      {scroll ? <>
        <Marquee speed={scrollSpeed}>
          {stopsJoined.map((station, index) => <Station key={index} name={station} />)}
        </Marquee>
      </> : <>
        {stopsJoined.map((station, index) => <Station key={index} name={station} />)}
      </>}
    </div>
  );
};

const Station = ({ name }) => {
  const classes = `station`;
  let altIcon = null;

  if (name.includes(' Airport')) {
    name = name.replace(' Airport', '');
    altIcon = 'plane';
  }

  return <>
    <div className={classes}>
      {name}
      {altIcon && <img className="altIcon" src={icons[altIcon]} alt="" />}
    </div>
  </>;
};
