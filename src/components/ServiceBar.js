import React, { Component, useContext } from 'react';
import { ServiceIcon } from './ServiceIcon';
import { NetworkTime, DepartureTime, truncateStationName, lineColour } from '../util';
import State from '../state';

import plane from '../assets/icons/airport.svg';
import '../assets/styles/ServiceBar.scss';

const icons = {
  'plane': plane
};

export const ServiceBar = ({ service, icon, time = true }) => {
  const { serviceTitle, theme } = useContext(State);
  const { destination, type, line, departs, booking, platform } = service;
  const verticalStyle = ['intercity', 'trainlink', 'coach'].indexOf(type.name) > -1 ? 'vertical' : '';
  let altIcon = null;

  let [lineTo, lineVia] = destination
    ? destination.includes('via')
      ? destination.split(' via ')
      : destination.split()
    : [null, null];

  if (lineVia === 'Airport') {
    lineVia = 'Airport stations';
    altIcon = 'plane';
  }

  return <>
    {time && <TimeBar title={serviceTitle} type={type.name} />}

    <div className={`serviceBar ${verticalStyle} ${theme}`}>
      <div className="serviceContainer">
        <div className="service">
          <ServiceIcon icon={icon} line={line} type={type.name} />
          <div className="serviceTime">{DepartureTime(departs)}</div>
        </div>
        <div className="lineText">
          <div className="serviceTime">{DepartureTime(departs)}</div>
          <div className="lineTo">{truncateStationName(lineTo)}</div>
          {booking
            ? <div><div className="booking">Booked seats only</div></div>
            : <div className="lineVia">
              {lineVia && 'via ' + lineVia}
              {altIcon && <img className="altIcon" src={icons[altIcon]} alt="" />}
            </div>}
        </div>
      </div>
      {platform && <div className="platform">
        <div className="titlePair">
          <div className="title">{platform?.title}</div>
          <div className="value">{platform?.value}</div>
        </div>
      </div>}
    </div>
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
      <div className="timeBar" style={{ backgroundColor: lineColour(null, type) }}>
        <div className="nextService">
          {this.props.title}
        </div>
        <div className="timeContainer">
          <div className="timeText">Time Now</div>
          <div className="timeNow">{this.state.time}</div>
        </div>
      </div>
    );
  }
}
