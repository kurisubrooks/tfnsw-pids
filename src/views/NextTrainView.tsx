import React, { useContext } from 'react'

import { NextServicesBar } from '../components/NextServicesBar'
import { ServiceBar } from '../components/ServiceBar'
import State from '../state'
import { Service } from '../types'
import { ServiceView } from './ServiceView'

interface NextTrainViewProps {
  services: Service[]
  departureTimer: string | null
}

export const NextTrainView: React.FC<NextTrainViewProps> = ({
  services,
  departureTimer,
}) => {
  const { isLandscape } = useContext(State)
  const currentService = services?.[0]

  return (
    <>
      {currentService && <ServiceBar service={currentService} />}
      <ServiceView
        services={services}
        stops={currentService?.stops}
        departure={departureTimer}
      />
      {!isLandscape && services && services.length > 1 && (
        <NextServicesBar services={services} />
      )}
    </>
  )
}
