import React from 'react';
import Marquee from './Marquee.js';
import '../assets/styles/StationScroll.scss';

export const StationScroll = ({ type, stops, limit, speed = 75 }) => {
  if (!stops) return false;
  const buffer = ['', ''];
  const stopsJoined = stops.map(x => x.station).concat(buffer);

  const scroll = stops.length > limit;
  const classes = `station ${type.name === 'bus' && 'small'}`;
  const scrollSpeed = speed * (window.innerHeight / 650);

  return (
    <div className="stationScroll">
      {scroll ? <>
        <Marquee speed={scrollSpeed}>
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

/*
const Station = ({ name }) => {

};
*/
