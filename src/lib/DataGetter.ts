// oxlint-disable no-underscore-dangle
import { formatError, type FormattedError } from '../error'
import type { Service } from '../types'
import type {
  ApiEnvelope,
  DeparturesResponse,
  TripInstanceResponse,
  Departure,
  StopTimeInstance,
  StopEntry,
  Stop,
  Headsign,
} from '../types/anytrip-v3'
import { truncateStationName, nameTransform, modeToType } from '../util'

interface ExtractedPidData {
  stations: string[]
  service: TripInstanceResponse
  headsign: Headsign
  cars?: number | string
  stop: Stop
  stopTimeInstance: StopTimeInstance
  isLimitedStops: boolean
  isExpress: boolean
  isIntercity: boolean
  isBookingRequired: boolean
  doesNotStop: boolean
  terminates: boolean
}

export class DataGetter {
  baseUrl: string

  constructor() {
    this.baseUrl = 'https://anytrip.com.au/api/v3/region/au2'
  }

  static getBaseUrlFromId(idWithPrefix: string): string {
    const [prefix] = idWithPrefix.split(':')
    return `https://anytrip.com.au/api/v3/region/${prefix}`
  }

  async makeRequest<T = unknown>(
    path: string,
    params?: Record<string, string | number | boolean | undefined> | null,
    baseUrl?: string,
  ): Promise<T> {
    try {
      const searchParams =
        params && Object.keys(params).length > 0
          ? '?' +
            new URLSearchParams(params as Record<string, string>).toString()
          : ''
      const reqUrl = (baseUrl || this.baseUrl) + path + searchParams
      console.log('Fetching AnyTrip:', reqUrl)
      const response = await fetch(reqUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      })
      if (response.status === 404) {
        const err = new Error(
          `Station or resource not found (404)`,
        ) as Error & {
          statusCode: number
        }
        err.statusCode = 404
        throw err
      }
      const body = await response.json()
      if (body?.statusCode === 404 || body?.error === 'Not Found') {
        const err = new Error(
          `Station or resource not found (404)`,
        ) as Error & {
          statusCode: number
        }
        err.statusCode = 404
        throw err
      }
      return body as T
    } catch (error: unknown) {
      if ((error as Error & { statusCode?: number })?.statusCode === 404) {
        throw error
      }
      return formatError(error) as T
    }
  }

  async getDepartures(
    params: Record<string, string | number | boolean | undefined>,
  ): Promise<ApiEnvelope<DeparturesResponse> | FormattedError> {
    if (typeof params.stopId === 'string' && !params.stopId.includes('au2:'))
      params.stopId = 'au2:' + params.stopId
    const res = await this.makeRequest<
      ApiEnvelope<DeparturesResponse> | FormattedError
    >(
      `/departures/${params.stopId}`,
      params,
      DataGetter.getBaseUrlFromId(params.stopId as string),
    )
    return res
  }

  async getTripInstance(
    params: string | Record<string, string | number | boolean | undefined>,
  ): Promise<ApiEnvelope<TripInstanceResponse>> {
    let path: string,
      tripId = 'au2:unknown'
    if (typeof params === 'string') {
      path = '/' + params
      const tripIdMatches = path.match(/\/tripInstance\/(?:[^/]+)\/([^/]+)\//)
      if (tripIdMatches) {
        tripId = tripIdMatches[1]
      }
    } else {
      path = `/tripInstance/${params.tripId}/${params.startDate}/${params.instanceNumber || 0}`
      tripId = params.tripId as string
    }

    const res = await this.makeRequest<ApiEnvelope<TripInstanceResponse>>(
      path,
      null,
      DataGetter.getBaseUrlFromId(tripId),
    )
    return res
  }

  async getDva(stiPath: string): Promise<unknown> {
    const path = stiPath.replace('stopTime/', 'dva/')
    const res = await this.makeRequest<unknown>(path)
    return res
  }

  async getStop(
    params: Record<string, string | number | boolean | undefined>,
  ): Promise<ApiEnvelope<StopEntry>> {
    const res = await this.makeRequest<ApiEnvelope<StopEntry>>(
      `/stop/${params.stopId}`,
      params,
      DataGetter.getBaseUrlFromId(params.stopId as string),
    )
    return res
  }

  async fetchPid(
    stopId: string,
    servicesLimit = 2,
  ): Promise<Service[] | false | null> {
    let depReq:
      | ApiEnvelope<DeparturesResponse>
      | FormattedError
      | false
      | undefined
    try {
      depReq = await this.getDepartures({
        ts: new Date().getTime() / 1000,
        stopId,
        offset: 0,
        limit: 15,
        excludeCancelled: true,
        modes: 'au2:sydneytrains,au2:nswtrains,au2:metro', // excl. bus,coach
        depArr: 'deparr',
      })
    } catch (e: unknown) {
      if ((e as Error & { statusCode?: number })?.statusCode === 404) {
        throw e
      }
      console.log(e)
      return false
    }

    if (depReq && 'ok' in depReq && depReq.ok === false) {
      if ('statusCode' in depReq && depReq.statusCode === 404) {
        const err = new Error(
          `Station or resource not found (404)`,
        ) as Error & {
          statusCode: number
        }
        err.statusCode = 404
        throw err
      }
      return false
    }

    if (!depReq || !('response' in depReq)) return false

    const _stopIds = stopId.split(',')
    const now = new Date().getTime() / 1000
    const departures = depReq.response?.departures

      // remove terminating and continued services
      /* .filter(dep => !dep.stopTimeInstance.lastStop || !dep.tripInstance.trip.tripContinues)
        .filter(dep => {
          if (!dep.stopTimeInstance.scheduledStop) return true;

          // remove services that dont stop at this station
          const stop = dep.stopTimeInstance.stop;
          const parentStop = dep.stopTimeInstance.stop.parent || dep.stopTimeInstance.stop;
          if (!stopIds.includes(stop.id) && !stopIds.includes(parentStop.id)) {
            return false;
          }

          return true;
        })
        */
      ?.filter((dep: Departure) => {
        // remove inactive/unscheduled/cancelled services(?)
        if (!dep.tripInstance.current) return true

        // remove unexpected services
        if (!dep.tripInstance.time) return false

        return dep.tripInstance.time > now - 30 * 60
      })
      // remove departed services
      ?.filter((dep: Departure) => {
        const depTime = dep.stopTimeInstance.departure?.time
        return depTime != null && depTime < now + 60 * 60 * 24
      })

    // Next Services
    if (departures && departures.length > 0) {
      // get (up to) the next 3 departures
      const promises = departures
        .slice(0, servicesLimit + 1)
        .map(async (i: Departure) => {
          const data = await this.getTripInstance(i.tripInstance._path)
          const res = this.extractPidData(data.response, i.stopTimeInstance)
          if (!res) return null
          return {
            id: res.service.tripInstance.trip.id,
            cars: res.cars || null,
            line: res.service.tripInstance.trip.route.name,
            mode: modeToType(
              res.service.tripInstance.trip.route.mode,
              res.isIntercity,
            ),
            departs: res.stopTimeInstance.departure?.time ?? null,
            serviceTime:
              res.stopTimeInstance.departure != null
                ? (res.stopTimeInstance.departure.time -
                    (res.stopTimeInstance.departure.delay || 0)) *
                  1000
                : null,
            destination: {
              to: res.headsign.headline ?? null,
              via: res.headsign.subtitle || null,
            },
            platform: {
              title: res.stop.disassembled?.platformType || null,
              value: res.stop.disassembled?.platformName || null,
            },

            doesNotStop: res.doesNotStop,
            isBookingRequired: res.isBookingRequired,
            isExpress: res.isExpress,
            isLimitedStops: res.isLimitedStops,
            isIntercity: res.isIntercity,
            terminates: res.terminates,

            stops: res.stations.map((station: string) =>
              nameTransform(station),
            ),

            _anyTrip: {
              stop:
                depReq && 'response' in depReq ? depReq.response.stop : null,
              departures,
            },
          } as Service
        })

      const services = await Promise.all(promises)
      return services.filter((s): s is Service => s !== null)
    }

    return null
  }

  /* eslint-disable max-depth */
  extractPidData(
    service: TripInstanceResponse,
    currentStopTimeInstance: StopTimeInstance,
  ): ExtractedPidData | undefined {
    if (service?.realtimePattern) {
      let isLimitedStops = false
      const isBus = service.tripInstance.trip.route.mode === 'au2:buses'
      const stationStops: Stop[] = []
      const visitedStations = new Set<string>()
      let passedCurrentStop = false

      const headsign: Headsign = currentStopTimeInstance.stopHeadsign ||
        service.tripInstance.trip.headsign || { headline: '' }
      const searchPattern = service.realtimePattern.concat(
        service.tripInstance.trip.tripContinues &&
          service.rel?.next?.realtimePattern
          ? service.rel.next.realtimePattern
          : [],
      )

      for (const sti of searchPattern) {
        const parentOrChildStop = sti.stop.parent || sti.stop
        const stationId = !isBus
          ? parentOrChildStop.id
          : `${parentOrChildStop.disassembled?.stationName || parentOrChildStop.disassembled?.fullName || parentOrChildStop.fullName}, ${parentOrChildStop.locality}`

        if (passedCurrentStop) {
          if (sti.skipped) continue
          if (sti.dropOff === 1) {
            if (!sti.firstRevenueStop) isLimitedStops = true
            continue
          }

          if (visitedStations.has(stationId)) {
            if (!isBus) break
          } else {
            visitedStations.add(stationId)
            stationStops.push(parentOrChildStop)

            if (
              !isBus &&
              truncateStationName(headsign.headline || '') ===
                truncateStationName(
                  parentOrChildStop.disassembled?.stationName || '',
                )
            ) {
              break
            }
          }
        } else if (sti._path === currentStopTimeInstance._path) {
          passedCurrentStop = true
          visitedStations.add(stationId)
        }
      }

      let stations: string[] = []
      let cars =
        service.tripInstance.trip.scheduledVehicleProperties?.cars ?? undefined
      if (cars === '?') cars = undefined

      if (stationStops && stationStops.length > 0) {
        stations = stationStops.map((stop) =>
          truncateStationName(
            stop.disassembled?.stationName ||
              stop.disassembled?.fullName ||
              stop.fullName ||
              '',
          ),
        )

        headsign.headline = truncateStationName(headsign.headline || '')
        if (headsign.subtitle) {
          headsign.subtitle = truncateStationName(headsign.subtitle)
        }
      }

      const agencyId = service.tripInstance.trip.route.agency?.id

      return {
        stations,
        service,
        headsign,
        cars,
        stop: currentStopTimeInstance.stop,
        stopTimeInstance: currentStopTimeInstance,
        isLimitedStops,
        isExpress: agencyId === 'au2:nt:710' || agencyId === 'au2:nt:711',
        isIntercity:
          agencyId === 'au2:st:NSWTrains' ||
          agencyId === 'au2:nt:710' ||
          agencyId === 'au2:nt:711' ||
          agencyId === 'au2:nt:X000',
        isBookingRequired:
          agencyId === 'au2:nt:710' || agencyId === 'au2:nt:711',
        doesNotStop: currentStopTimeInstance.pickUp === 1,
        terminates: !!(
          currentStopTimeInstance.lastStop ||
          currentStopTimeInstance.lastRevenueStop
        ),
      }
    }

    return undefined
  }
}

export default DataGetter
