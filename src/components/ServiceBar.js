import React, { Component } from 'react';
import { ServiceIcon } from './ServiceIcon';
import { NetworkTime, DepartureTime, lineColour } from '../util';
import '../assets/styles/ServiceBar.scss';

export const ServiceBar = ({ service, title }) => {
  const lineText = service?.destination
    ? service.destination.includes('via')
      ? service.destination.split(' via ')
      : service.destination.split()
    : [null, null];

  const verticalLayoutType = ['train', 'bus', 'lightrail', 'metro', 'ferry'].indexOf(String(service?.type.name)) === -1;

  return (
    <>
      <TimeBar title={title} service={service} />

      <>
        <div className={`serviceBar ${service.type.name}`}>
          <div className="serviceIcon">
            <ServiceIcon type={service.type} line={service.line} />
            {verticalLayoutType && <div className="serviceTime">
              {DepartureTime(service.departs)}
            </div>}
          </div>
          <div className="lineText">
            <div className="lineTo">{lineText[0]}</div>
            {service.booking ? <div className="booking">
              Booked seats only
            </div> : <div className="lineVia" style={{ display: lineText[1] ? 'flex' : 'none' }}>
              {lineText[1] && `via ${lineText[1]}`}
            </div>}
          </div>
        </div>
      </>
    </>
  );
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
    const serviceType = this.props.service.type.name;
    const types = { 'metro': 'M', 'bus': 'B', 'lightrail': 'L', 'ferry': 'F' };
    const colour = lineColour(types[serviceType] || 'T');

    return (
      <div className="timeBar" style={{ backgroundColor: colour }}>
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
