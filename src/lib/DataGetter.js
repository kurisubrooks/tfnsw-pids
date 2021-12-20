import ErrorFormatter from '../error';
import config from '../config';
import { truncateStationName, nameTransform, modeToType } from '../util';

class DataGetter {
  constructor() {
    this.proxy = config.proxy;
    this.baseUrl = `https://anytrip.com.au/api/v3/region/au2/`;

    if (!this.proxy.url || this.proxy.url === '') {
      console.error('Missing Proxy URL');
      return { error: 'Missing Proxy URL' };
    }
  }

  static getBaseUrlFromId(idWithPrefix) {
    const [prefix] = idWithPrefix.split(':');
    return `https://anytrip.com.au/api/v3/region/${prefix}`;
  }

  async makeRequest(path, params, baseUrl) {
    // You may need to change this format to work with whatever
    // cors proxy you're using
    try {
      const searchParams = params && params !== {}
        ? '?' + new URLSearchParams(params).toString()
        : '';
      const reqUrl = (baseUrl || this.baseUrl) + path + searchParams;
      console.log('Requesting', reqUrl);
      const url = this.proxy.url + `?url=${encodeURIComponent(reqUrl)}`;
      const response = await fetch(url, this.proxy.fetchOptions);
      const body = await response.json();
      console.log('Response', body.response);
      return body;
    } catch(error) {
      return ErrorFormatter.format(error);
    }
  }

  async getDepartures(params) {
    if (!params.stopId.includes('au2:')) params.stopId = 'au2:' + params.stopId;
    const res = await this.makeRequest(`/departures/${params.stopId}`, params, DataGetter.getBaseUrlFromId(params.stopId));
    return res;
  }

  async getTripInstance(params) {
    let path, tripId = 'au2:unknown';
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

  async getDva(stiPath) {
    const path = stiPath.replace('stopTime/', 'dva/');
    const res = await this.makeRequest(path);
    return res;
  }

  async getStop(params) {
    const res = await this.makeRequest(`/stop/${params.stopId}`, params, DataGetter.getBaseUrlFromId(params.stopId));
    return res;
  }

  async fetchPid(stopId, servicesLimit = 2) {
    const stopIds = stopId.split(',');
    const depReq = await this.getDepartures({
      ts: new Date().getTime() / 1000,
      stopId, offset: 0, limit: 15, excludeCancelled: true,
      modes: 'au2:sydneytrains,au2:nswtrains,au2:metro' // excl. bus,coach
    });

    const now = new Date().getTime() / 1000;
    const departures = depReq.response.departures
      // remove terminating and continued services
      .filter(dep => !dep.stopTimeInstance.lastStop || !dep.tripInstance.trip.tripContinues)
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
      .filter(dep => {
        // remove inactive/unscheduled/cancelled services(?)
        if (!dep.tripInstance.current) return true;

        // remove unexpected services
        if (!dep.tripInstance.time) return false;

        return dep.tripInstance.time > (now - 30 * 60);
      })
      // remove departed services
      .filter(dep => dep.stopTimeInstance.departure.time < (now + 60 * 60 * 24));

    // Next Services
    if (departures.length > 0) {
      // get (up to) the next 3 departures
      const promises = departures.slice(0, servicesLimit + 1).map(async i => {
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

          stops: res.stations.map(station => nameTransform(station.fullName)),

          _anyTrip: {
            stop: depReq.response.stop,
            departures
          }
        };
      });

      const services = await Promise.all(promises);
      return services;
    }

    return null;
  }

  /* eslint-disable max-depth */
  extractPidData(service, currentStopTimeInstance) {
    if (service?.realtimePattern) {
      let isLimitedStops = false;
      const isBus = service.tripInstance.trip.route.mode === 'au2:buses';
      const stationStops = [];
      const visitedStations = new Set();
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

      let stations = [];

      let cars = service.tripInstance.trip.scheduledVehicleProperties?.cars;
      if (cars === '?') cars = undefined;

      if (stationStops && stationStops.length > 0) {
        stations = stationStops.map(stop => truncateStationName(stop));

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
        doesNotStop: currentStopTimeInstance.pickUp === 1
      };
    }

    return undefined;
  }
}

export default DataGetter;
