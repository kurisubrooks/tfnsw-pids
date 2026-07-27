import React, { useContext } from 'react'

import State from '../state'
import { Service } from '../types'
import { DepartureTimeCountdown, truncateStationName } from '../util'

import '../assets/styles/NextServicesBar.scss'
import { Badges } from './Badge'

interface NextServicesBarProps {
  services: Service[]
}

export const NextServicesBar: React.FC<NextServicesBarProps> = ({
  services,
}) => {
  const { theme } = useContext(State)
  const servicesLimit = 2

  return (
    <div className={`following_services ${theme || ''}`}>
      <div className="rows">
        <div className="row">
          <div className="cell">Next Services</div>
          <div className="cell">Platform</div>
          <div className="cell">Departs</div>
        </div>
        {services.slice(1, servicesLimit + 1).map((i, idx) => {
          return <NextServiceItem service={i} key={i.id ? i.id : idx} />
        })}
      </div>
    </div>
  )
}

interface NextServiceItemProps {
  service: Service
}

const NextServiceItem: React.FC<NextServiceItemProps> = ({ service }) => {
  const serviceBadge =
    service.isLimitedStops !== null && service.isLimitedStops !== undefined
      ? service.isExpress
        ? 'Express'
        : service.isLimitedStops
          ? 'Limited Stops'
          : 'All Stops'
      : null

  return (
    <>
      <div className="row row-primary">
        <div className="cell">
          {service.destination?.to
            ? truncateStationName(service.destination.to)
            : ''}
        </div>
        <div className="cell">{service.platform?.value}</div>
        <div className="cell">{DepartureTimeCountdown(service.departs)}</div>
      </div>
      <div className="row via">
        {service.destination?.via && (
          <div className="via-text">{service.destination.via}</div>
        )}
        <Badges items={[serviceBadge]} />
      </div>
    </>
  )
}
