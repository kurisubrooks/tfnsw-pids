import React from 'react';
import Marquee from './Marquee.js';
import '../assets/styles/StationScroll.scss';

export const StationScroll = ({ type, stops, speed = 75 }) => {
  if (!stops) return false;
  const buffer = ['', ''];
  const stopsJoined = stops.map(x => x.station).concat(buffer);

  const scroll = stops.length >= 9;
  const classes = `station ${type.name === 'bus' && 'small'}`;

  return (
    <div className="stationScroll">
      {scroll ? <>
        <Marquee speed={speed}>
          {stopsJoined.map((station, index) =>
            <div key={index} className={classes}>
              {station}
            </div>
          )}
        </Marquee>
      </> : <>
        {stopsJoined.map((station, index) =>
          <div key={index} className={classes}>
            {station}
          </div>
        )}
      </>}
    </div>
  );
};
