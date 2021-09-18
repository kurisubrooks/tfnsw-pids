import React, { Component, useContext } from 'react';
import { ServiceIcon } from './ServiceIcon';
import { NetworkTime, DepartureTime, truncateStationName, lineColour } from '../util';
import State from '../state';
import '../assets/styles/ServiceBar.scss';

export const ServiceBar = ({ service, icon, time = true }) => {
  const { serviceTitle, isLandscape } = useContext(State);
  const { destination, type, line, departs, booking, platform } = service;

  let [lineTo, lineVia] = destination
    ? destination.includes('via')
      ? destination.split(' via ')
      : destination.split()
    : [null, null];

  if (lineVia === 'Airport') lineVia = 'Airport stations';
  const verticalStyle = ['intercity', 'coach'].indexOf(type.name) > -1 ? 'vertical' : '';

  return <>
    {time && <TimeBar title={serviceTitle} type={type.name} />}

    <div className={`serviceBar ${verticalStyle}`}>
      <div className="serviceContainer">
        <div className="service">
          <ServiceIcon icon={icon} line={line} type={type.name} />
          <div className="serviceTime">{DepartureTime(departs)}</div>
        </div>
        <div className="lineText">
          <div className="lineTo">{truncateStationName(lineTo)}</div>
          {booking
            ? <div className="booking">Booked seats only</div>
            : lineVia && <div className="lineVia">via {lineVia}</div>}
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
