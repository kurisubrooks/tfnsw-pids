import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import React, { useState, useEffect, useMemo } from 'react'

import { getPidData } from '../server/pid'
import { StateManager } from '../state'
import type { Service } from '../types'
import { DepartureTimeCountdown } from '../util'
import { DebugView } from '../views/DebugView'
import { ErrorView } from '../views/ErrorView'
import { NextTrainView } from '../views/NextTrainView'

// Constants
// 200060 Central
// 206710 Chatswood
// 215020 Parramatta
// 278610 Katoomba
// 279010 Lithgow
// 26041 Canberra

export const schema: Service = {
  id: null,
  cars: null,
  line: null,
  mode: null,
  departs: null,
  serviceTime: null,
  destination: { to: null, via: null },
  platform: { title: null, value: null },
  doesNotStop: null,
  isBookingRequired: null,
  isExpress: null,
  isLimitedStops: null,
  isIntercity: true,
  stops: [],
}

interface SearchParams {
  theme?: 'dark' | 'light'
  debugView?: boolean
  testError?: boolean
}

export const Route = createFileRoute('/$stopId')({
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      theme: search.theme === 'dark' ? 'dark' : 'light',
      debugView: Boolean(search.debugView),
      testError: Boolean(search.testError),
    }
  },
  loader: async ({ params, context: { queryClient } }) => {
    await queryClient.ensureQueryData({
      queryKey: ['pid', params.stopId],
      queryFn: () => getPidData(params.stopId),
    })
  },
  errorComponent: ErrorView,
  component: StationPidComponent,
})

function StationPidComponent() {
  const { stopId } = Route.useParams()
  const search = Route.useSearch()

  if (search.testError) {
    throw new Error(
      `Unable to retrieve departure data for station ${stopId} (API Timeout)`,
    )
  }

  const theme = search.theme || 'light'
  const useDebugView = search.debugView || false

  const { data } = useQuery({
    queryKey: ['pid', stopId],
    queryFn: () => getPidData(stopId),
    refetchInterval: 15_000,
    enabled: !useDebugView,
  })

  const services = useMemo(() => data ?? [schema], [data])

  const [departureTimer, setDepartureTimer] = useState<string | null>(null)

  useEffect(() => {
    if (useDebugView) return

    // Tick countdown every 0.5s
    const tickTimer = setInterval(() => {
      setDepartureTimer(DepartureTimeCountdown(services?.[0]?.departs))
    }, 500)

    return () => {
      clearInterval(tickTimer)
    }
  }, [stopId, services, useDebugView])

  return (
    <StateManager theme={theme}>
      {useDebugView ? (
        <DebugView />
      ) : (
        <div className="wrapper">
          <NextTrainView services={services} departureTimer={departureTimer} />
        </div>
      )}
    </StateManager>
  )
}
