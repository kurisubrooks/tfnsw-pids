import React, { useContext } from 'react';
import State from '../state';
import '../assets/styles/Badge.scss';

// <Badges hasBooking={true} items={['8 cars', 'All Stops']} />
export const Badges = ({ items, hasBooking }) => {
  const { theme } = useContext(State);
  return <div className={`badge_stack ${theme}`}>
    {hasBooking && <div className="badge_group has-booking">
      <BadgeItem isBooking={true} text="Booked seats only" />
    </div>}
    {items?.length > 0 && <div className="badge_group">
      {items.map(i => <BadgeItem text={i} />)}
    </div>}
  </div>;
};

const BadgeItem = ({ text, isBooking }) => {
  if (!text || text === '') return null;
  const classes = `badge ${isBooking ? 'badge-booking' : ''}`;
  return <div className={classes}>{text}</div>;
};
