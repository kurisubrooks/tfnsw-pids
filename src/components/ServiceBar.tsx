import React, { Component, useContext } from 'react'

import plane from '../assets/icons/airport.svg'
import State from '../state'
import type { Service } from '../types'
import {
  NetworkTime,
  DepartureTime,
  truncateStationName,
  lineColour,
} from '../util'
import { Badges } from './Badge'

import '../assets/styles/TimeBar.scss'
import '../assets/styles/ServiceBar.scss'
import { ServiceIcon } from './ServiceIcon'

const icons: Record<string, string> = {
  plane: plane,
}

interface ServiceBarProps {
  service: Service
  icon?: string
  time?: boolean
}

export const ServiceBar: React.FC<ServiceBarProps> = ({
  service,
  icon,
  time = true,
}) => {
  const { serviceTitle, theme } = useContext(State)
  if (!service) return null

  const { destination, mode, line, serviceTime, isBookingRequired, platform } =
    service
  const verticalStyle =
    mode && ['intercity', 'trainlink', 'coach'].includes(mode)
      ? 'isIntercity'
      : ''
  const indicatorIsHidden = Boolean(service?.doesNotStop)
  let altIcon: string | null = null
  const barIsHidden = !time || indicatorIsHidden

  if (destination?.via === 'via Airport stations') {
    altIcon = 'plane'
  }

  return (
    <>
      {!barIsHidden && <TimeBar title={serviceTitle} type={mode} />}

      {!indicatorIsHidden && (
        <div className={`service_bar ${verticalStyle} ${theme || ''}`}>
          <div className="service_container">
            <div className="service">
              <ServiceIcon icon={icon} line={line} type={mode} />
              <div className="service_time">{DepartureTime(serviceTime)}</div>
            </div>
            <div className="line_stack">
              <div className="service_time">{DepartureTime(serviceTime)}</div>
              <div className="line_to">
                {destination?.to ? truncateStationName(destination.to) : ''}
              </div>
              {isBookingRequired ? (
                <Badges hasBooking={true} />
              ) : (
                <div className="line_via">
                  {destination?.via}
                  {altIcon && (
                    <img className="icon" src={icons[altIcon]} alt="" />
                  )}
                </div>
              )}
            </div>
          </div>
          {platform && (
            <div className="platform">
              <div className="titlePair">
                <div className="title">{platform?.title}</div>
                <div className="value">{platform?.value}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}

interface TimeBarProps {
  title?: string | null
  type?: string | null
}

interface TimeBarState {
  time: string
}

export class TimeBar extends Component<TimeBarProps, TimeBarState> {
  timerID?: ReturnType<typeof setInterval>
  private cachedType: string = ''
  private cachedStyle: { backgroundColor: string } = { backgroundColor: '' }

  constructor(props: TimeBarProps) {
    super(props)
    this.state = { time: NetworkTime() }
  }

  componentDidMount() {
    this.timerID = setInterval(() => this.tick(), 500)
  }

  componentWillUnmount() {
    if (this.timerID) {
      clearInterval(this.timerID)
    }
  }

  tick() {
    this.setState({ time: NetworkTime() })
  }

  private getStyle(type: string) {
    if (type !== this.cachedType) {
      this.cachedType = type
      this.cachedStyle = { backgroundColor: lineColour(null, type) }
    }
    return this.cachedStyle
  }

  render() {
    const rawType = this.props.type
    const type =
      rawType === 'intercity' ||
      rawType === 'trainlink' ||
      rawType === 'none' ||
      !rawType
        ? 'train'
        : rawType

    return (
      <div className="time_bar" style={this.getStyle(type)}>
        <div className="title">{this.props.title}</div>
        <div className="time_container">
          <div className="time_text">Time now</div>
          <div className="time_now">{this.state.time}</div>
        </div>
      </div>
    )
  }
}
