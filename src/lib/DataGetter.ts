import ErrorFormatter from '../error';
import { truncateStationName, nameTransform, modeToType } from '../util';

export class DataGetter {
  baseUrl: string;

  constructor() {
    this.baseUrl = typeof window !== 'undefined'
      ? '/anytrip/api/v3/region/au2'
      : 'https://anytrip.com.au/api/v3/region/au2';
  }

  static getBaseUrlFromId(idWithPrefix: string): string {
    const [prefix] = idWithPrefix.split(':');
    return typeof window !== 'undefined'
      ? `/anytrip/api/v3/region/${prefix}`
      : `https://anytrip.com.au/api/v3/region/${prefix}`;
  }

  async makeRequest(path: string, params?: Record<string, any> | null, baseUrl?: string): Promise<any> {
    try {
      const searchParams = params && Object.keys(params).length > 0
        ? '?' + new URLSearchParams(params).toString()
        : '';
      const reqUrl = (baseUrl || this.baseUrl) + path + searchParams;
      console.log('Fetching AnyTrip:', reqUrl);
      const response = await fetch(reqUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (response.status === 404) {
        const err = new Error(`Station or resource not found (404)`);
        (err as any).status = 404;
        throw err;
      }
      const body = await response.json();
      if (body?.statusCode === 404 || body?.error === 'Not Found') {
        const err = new Error(`Station or resource not found (404)`);
        (err as any).status = 404;
        throw err;
      }
      return body;
    } catch (error: any) {
      if (error?.status === 404) {
        throw error;
      }
      return ErrorFormatter.format(error);
    }
  }

  async getDepartures(params: Record<string, any>): Promise<any> {
    if (!params.stopId.includes('au2:')) params.stopId = 'au2:' + params.stopId;
    const res = await this.makeRequest(`/departures/${params.stopId}`, params, DataGetter.getBaseUrlFromId(params.stopId));
    return res;
  }

  async getTripInstance(params: string | Record<string, any>): Promise<any> {
    let path: string, tripId = 'au2:unknown';
    if (typeof params === 'string') {
      path = '/' + params;
      const tripIdMatches = path.match(/\/tripInstance\/(?:[^/]+)\/([^/]+)\//);
      if (tripIdMatches) {
        tripId = tripIdMatches[1];
      }
    } else {
      path = `/tripInstance/${params.tripId}/${params.startDate}/${params.instanceNumber || 0}`;
      tripId = params.tripId;
    }

    const res = await this.makeRequest(path, null, DataGetter.getBaseUrlFromId(tripId));
    return res;
  }

  async getDva(stiPath: string): Promise<any> {
    const path = stiPath.replace('stopTime/', 'dva/');
    const res = await this.makeRequest(path);
    return res;
  }

  async getStop(params: Record<string, any>): Promise<any> {
    const res = await this.makeRequest(`/stop/${params.stopId}`, params, DataGetter.getBaseUrlFromId(params.stopId));
    return res;
  }

  async fetchPid(stopId: string, servicesLimit = 2): Promise<any> {
    let depReq: any;
    try {
      depReq = await this.getDepartures({
        ts: new Date().getTime() / 1000,
        stopId, offset: 0, limit: 15, excludeCancelled: true,
        modes: 'au2:sydneytrains,au2:nswtrains,au2:metro', // excl. bus,coach
        depArr: 'deparr'
      });
    } catch (e: any) {
      if (e?.status === 404) {
        throw e;
      }
      console.log(e);
      return false;
    }

    if (depReq?.ok === false) {
      if (depReq?.status === 404) {
        const err = new Error(`Station or resource not found (404)`);
        (err as any).status = 404;
        throw err;
      }
      return false;
    }

    if (!depReq) return false;

    const stopIds = stopId.split(',');
    const now = new Date().getTime() / 1000;
    const departures = depReq?.response?.departures
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
      ?.filter((dep: any) => {
        // remove inactive/unscheduled/cancelled services(?)
        if (!dep.tripInstance.current) return true;

        // remove unexpected services
        if (!dep.tripInstance.time) return false;

        return dep.tripInstance.time > (now - 30 * 60);
      })
      // remove departed services
      ?.filter((dep: any) => dep.stopTimeInstance.departure.time < (now + 60 * 60 * 24));

    // Next Services
    if (departures?.length > 0) {
      // get (up to) the next 3 departures
      const promises = departures.slice(0, servicesLimit + 1).map(async (i: any) => {
        const data = await this.getTripInstance(i.tripInstance._path);
        const res = this.extractPidData(data.response, i.stopTimeInstance);
        if (!res) return null;
        return {
          id: res.service.tripInstance.trip.id,
          cars: res.cars,
          line: res.service.tripInstance.trip.route.name,
          mode: modeToType(res.service.tripInstance.trip.route.mode, res.isIntercity),
          departs: res.stopTimeInstance.departure.time,
          serviceTime: (res.stopTimeInstance.departure.time - (res.stopTimeInstance.departure.delay || 0)) * 1000,
          destination: { to: res.headsign.headline, via: res.headsign.subtitle },
          platform: { title: res.stop.disassembled.platformType, value: res.stop.disassembled.platformName },

          doesNotStop: res.doesNotStop,
          isBookingRequired: res.isBookingRequired,
          isExpress: res.isExpress,
          isLimitedStops: res.isLimitedStops,
          isIntercity: res.isIntercity,
          terminates: res.terminates,

          stops: res.stations.map((station: any) => nameTransform(typeof station === 'string' ? station : station.fullName)),

          _anyTrip: {
            stop: depReq.response.stop,
            departures
          }
        };
      });

      const services = await Promise.all(promises);
      return services.filter(Boolean);
    }

    return null;
  }

  /* eslint-disable max-depth */
  extractPidData(service: any, currentStopTimeInstance: any): any {
    if (service?.realtimePattern) {
      let isLimitedStops = false;
      const isBus = service.tripInstance.trip.route.mode === 'au2:buses';
      const stationStops: any[] = [];
      const visitedStations = new Set<string>();
      let passedCurrentStop = false;

      const headsign = currentStopTimeInstance.stopHeadsign || service.tripInstance.trip.headsign;
      const searchPattern = service.realtimePattern.concat(service.tripInstance.trip.tripContinues && service.rel.next?.realtimePattern || []);

      for (const sti of searchPattern) {
        const parentOrChildStop = sti.stop.parent || sti.stop;
        const stationId = !isBus ? parentOrChildStop.id : `${parentOrChildStop.disassembled.stationName || parentOrChildStop.disassembled.fullName}, ${parentOrChildStop.locality}`;

        if (passedCurrentStop) {
          if (sti.skipped) continue;
          if (sti.dropOff === 1) {
            if (!sti.firstRevenueStop) isLimitedStops = true;
            continue;
          }

          if (visitedStations.has(stationId)) {
            if (!isBus) break;
          } else {
            visitedStations.add(stationId);
            stationStops.push(parentOrChildStop);

            if (!isBus && truncateStationName(headsign.headline) === truncateStationName(parentOrChildStop.disassembled.stationName || '')) {
              break;
            }
          }
        } else if (sti._path === currentStopTimeInstance._path) {
          passedCurrentStop = true;
          visitedStations.add(stationId);
        }
      }

      let stations: string[] = [];
      let cars = service.tripInstance.trip.scheduledVehicleProperties?.cars;
      if (cars === '?') cars = undefined;

      if (stationStops && stationStops.length > 0) {
        stations = stationStops.map(stop => truncateStationName(stop.disassembled?.stationName || stop.disassembled?.fullName || stop.name || stop));

        headsign.headline = truncateStationName(headsign.headline);
        if (headsign.subtitle) {
          headsign.subtitle = truncateStationName(headsign.subtitle);
        }
      }

      return {
        stations, service, headsign, cars,
        stop: currentStopTimeInstance.stop,
        stopTimeInstance: currentStopTimeInstance,
        isLimitedStops,
        isExpress: service.tripInstance.trip.route.agency.id === 'au2:nt:710'
          || service.tripInstance.trip.route.agency.id === 'au2:nt:711',
        isIntercity: service.tripInstance.trip.route.agency.id === 'au2:st:NSWTrains'
          || service.tripInstance.trip.route.agency.id === 'au2:nt:710'
          || service.tripInstance.trip.route.agency.id === 'au2:nt:711'
          || service.tripInstance.trip.route.agency.id === 'au2:nt:X000',
        isBookingRequired: service.tripInstance.trip.route.agency.id === 'au2:nt:710'
          || service.tripInstance.trip.route.agency.id === 'au2:nt:711',
        doesNotStop: currentStopTimeInstance.pickUp === 1,
        terminates: currentStopTimeInstance.lastStop || currentStopTimeInstance.lastRevenueStop
      };
    }

    return undefined;
  }
}

export default DataGetter;
