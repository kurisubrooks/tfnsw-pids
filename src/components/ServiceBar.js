import React, { Component, useContext } from 'react';
import { ServiceIcon } from './ServiceIcon';
import { NetworkTime, DepartureTime, truncateStationName, lineColour } from '../util';
import { Badges } from './Badge';
import State from '../state';

import plane from '../assets/icons/airport.svg';
import '../assets/styles/TimeBar.scss';
import '../assets/styles/ServiceBar.scss';

const icons = {
  'plane': plane
};

export const ServiceBar = ({ service, icon, time = true }) => {
  const { serviceTitle, theme } = useContext(State);
  const { destination, mode, line, serviceTime, isBookingRequired, platform } = service;
  const verticalStyle = ['intercity', 'trainlink', 'coach'].indexOf(mode) > -1 ? 'isIntercity' : '';
  const indicatorIsHidden = service.doesNotStop;
  let altIcon = null;
  const barIsHidden = !time || indicatorIsHidden;

  if (destination?.via === 'via Airport stations') {
    altIcon = 'plane';
  }

  return <>
    {!barIsHidden && <TimeBar title={serviceTitle} type={mode} />}

    {!indicatorIsHidden && <div className={`service_bar ${verticalStyle} ${theme}`}>
      <div className="service_container">
        <div className="service">
          <ServiceIcon icon={icon} line={line} type={mode} />
          <div className="service_time">{DepartureTime(serviceTime)}</div>
        </div>
        <div className="line_stack">
          <div className="service_time">{DepartureTime(serviceTime)}</div>
          <div className="line_to">{truncateStationName(destination?.to)}</div>
          {isBookingRequired
            ? <Badges hasBooking={true} />
            : <div className="line_via">
              {destination?.via}
              {altIcon && <img className="icon" src={icons[altIcon]} alt="" />}
            </div>}
        </div>
      </div>
      {platform && <div className="platform">
        <div className="titlePair">
          <div className="title">{platform?.title}</div>
          <div className="value">{platform?.value}</div>
        </div>
      </div>}
    </div>}
  </>;
};

export class TimeBar extends Component {
  constructor(props) {
    super(props);
    this.state = { time: NetworkTime() };
  }

  componentDidMount() {
    this.timerID = setInterval(() => this.tick(), 500);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    this.setState({ time: NetworkTime() });
  }

  render() {
    const type = this.props.type === 'intercity'
      || this.props.type === 'trainlink'
      || this.props.type === 'none'
      ? 'train' : this.props.type;

    return (
      <div className="time_bar" style={{ backgroundColor: lineColour(null, type) }}>
        <div className="title">{this.props.title}</div>
        <div className="time_container">
          <div className="time_text">Time now</div>
          <div className="time_now">{this.state.time}</div>
        </div>
      </div>
    );
  }
}
