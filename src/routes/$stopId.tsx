import { createFileRoute } from '@tanstack/react-router'
import React, { useState, useEffect } from 'react'

import DataGetter from '../lib/DataGetter'
import { getPidData } from '../server/pid'
import { StateManager } from '../state'
import type { Service } from '../types'
import { DepartureTimeCountdown } from '../util'
import { DebugView } from '../views/DebugView'
import { ErrorView } from '../views/ErrorView'
import { NextTrainView } from '../views/NextTrainView'

const clientDataGetter = new DataGetter()

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
  loader: async ({
    params,
  }): Promise<{ initialServices: Service[]; is404?: boolean }> => {
    let services: Service[] | null = null
    let is404 = false

    try {
      services = (await getPidData({ data: { stopId: params.stopId } })) as
        | Service[]
        | null
    } catch (err: unknown) {
      if ((err as Error & { statusCode?: number })?.statusCode === 404) {
        is404 = true
      }
    }

    if (!is404 && (!services || services.length === 0)) {
      try {
        services = (await clientDataGetter.fetchPid(params.stopId)) as
          | Service[]
          | null
      } catch (err: unknown) {
        if ((err as Error & { statusCode?: number })?.statusCode === 404) {
          is404 = true
        } else {
          console.error('Loader fetch error:', err)
        }
      }
    }

    return { initialServices: services || [], is404 }
  },
  errorComponent: ErrorView,
  component: StationPidComponent,
})

function StationPidComponent() {
  const { stopId } = Route.useParams()
  const search = Route.useSearch()
  const loaderData = Route.useLoaderData()

  if (search.testError) {
    throw new Error(
      `Unable to retrieve departure data for station ${stopId} (API Timeout)`,
    )
  }

  const theme = search.theme || 'light'
  const useDebugView = search.debugView || false

  const [services, setServices] = useState<Service[]>(
    loaderData?.initialServices || [schema],
  )
  const [is404, setIs404] = useState<boolean>(Boolean(loaderData?.is404))
  const [departureTimer, setDepartureTimer] = useState<string | null>(null)

  const fetchLatestData = async () => {
    if (is404) return

    try {
      let data: Service[] | null = null
      try {
        data = (await getPidData({ data: { stopId } })) as Service[] | null
      } catch (err: unknown) {
        if ((err as Error & { statusCode?: number })?.statusCode === 404) {
          setIs404(true)
          return
        }
      }

      if (!data) {
        data = (await clientDataGetter.fetchPid(stopId)) as Service[] | null
      }

      if (data && data.length > 0) {
        setServices(data)
      }
    } catch (err: unknown) {
      if ((err as Error & { statusCode?: number })?.statusCode === 404) {
        setIs404(true)
        return
      }
      console.error('Error fetching data client-side:', err)
    }
  }

  useEffect(() => {
    setIs404(Boolean(loaderData?.is404))
    setServices(loaderData?.initialServices || [schema])
    if (!loaderData?.is404) {
      fetchLatestData()
    }
  }, [stopId, loaderData])

  useEffect(() => {
    if (useDebugView || is404) return

    // Tick countdown every 0.5s
    const tickTimer = setInterval(() => {
      setDepartureTimer(DepartureTimeCountdown(services?.[0]?.departs))
    }, 500)

    // Refresh PID departures every 15s (except on non-server error)
    const dataTimer = setInterval(() => {
      fetchLatestData()
    }, 15 * 1000)

    return () => {
      clearInterval(tickTimer)
      clearInterval(dataTimer)
    }
  }, [stopId, services, useDebugView, is404])

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
