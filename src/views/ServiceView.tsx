import React, { useContext } from 'react'

import { Badges } from '../components/Badge'
import { ServiceIcon } from '../components/ServiceIcon'
import { StationScroll } from '../components/StationScroll'
import State from '../state'

import '../assets/styles/StationScroll.scss'
import { Service } from '../types'
import { ErrorView } from './ErrorView'

interface ServiceViewProps {
  services: Service[]
  stops?: string[]
  departure?: string | null
}

export const ServiceView: React.FC<ServiceViewProps> = ({
  services,
  stops,
  departure,
}) => {
  const { isLandscape, theme } = useContext(State)
  const currentService = services?.[0]

  if (!currentService || !currentService.platform) {
    return (
      <ErrorView error={new Error('Service data is missing or unavailable.')} />
    )
  }

  const {
    platform,
    cars,
    isExpress,
    isLimitedStops,
    isBookingRequired,
    doesNotStop,
  } = currentService
  const scrollMin = isLandscape ? 5 : 8

  if (doesNotStop)
    return (
      <DoesNotStopView
        services={services}
        stops={stops}
        departure={departure}
      />
    )

  const badgeItems = [
    cars ? `${cars} cars` : null,
    isLimitedStops !== null && isLimitedStops !== undefined
      ? isExpress
        ? 'Express'
        : isLimitedStops
          ? 'Limited Stops'
          : 'All Stops'
      : null,
  ].filter(Boolean) as string[]

  return (
    <div className={`scroll_view ${theme || ''}`}>
      <div className="scroll_container">
        <StationScroll stops={stops} limit={scrollMin} />
      </div>
      <div className="info_container">
        <div className="titlePair platform">
          <div className="title">{platform?.title}</div>
          <div className="value">{platform?.value}</div>
        </div>
        <Badges hasBooking={Boolean(isBookingRequired)} items={badgeItems} />
        {departure && (
          <div className="titlePair">
            <div className="title">Departs</div>
            <div className="value">{departure}</div>
          </div>
        )}
      </div>
      <div className="bar_container">
        <Badges hasBooking={Boolean(isBookingRequired)} items={badgeItems} />
      </div>
    </div>
  )
}

const DoesNotStopView: React.FC<ServiceViewProps> = ({
  services,
  stops,
  departure,
}) => {
  const { theme } = useContext(State)

  return (
    <div className={`scroll_view doesnotstop ${theme || ''}`}>
      <ServiceIcon icon="information" />
      <h1>Next train does not stop</h1>
      <h3>Please stand behind the yellow platform line.</h3>
    </div>
  )
}
