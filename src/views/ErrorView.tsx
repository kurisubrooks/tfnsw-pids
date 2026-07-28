import type { ErrorComponentProps } from '@tanstack/react-router'
import React, { useContext } from 'react'

import { TimeBar } from '../components/ServiceBar'
import { ServiceIcon } from '../components/ServiceIcon'
import { formatError } from '../error'
import State from '../state'

import '../assets/styles/ServiceBar.scss'
import '../assets/styles/StationScroll.scss'
import '../assets/styles/ErrorView.scss'

export const ErrorView: React.FC<Partial<ErrorComponentProps>> = ({
  error,
  reset,
}) => {
  const stateContext = useContext(State)
  const theme = stateContext?.theme
  const serviceTitle = stateContext?.serviceTitle
  const formatted = formatError(error || 'Service data unavailable.')

  return (
    <>
      <TimeBar title={serviceTitle} type="train" />

      <div className={`service_bar ${theme || ''}`}>
        <div className="service_container">
          <div className="service">
            <ServiceIcon icon="outofservice" />
          </div>
          <div className="line_stack">
            <div className="line_to">Application Error</div>
          </div>
        </div>
        <div className="platform">
          <div className="titlePair">
            <div className="title">Status</div>
            <div className="value"></div>
          </div>
        </div>
      </div>

      <div className={`scroll_view error_view ${theme || ''}`}>
        <h3 className="error_message">{formatted.message}</h3>
        {reset && (
          <button className="retry_button" onClick={reset}>
            Retry
          </button>
        )}
      </div>
    </>
  )
}
