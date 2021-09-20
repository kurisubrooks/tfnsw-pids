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

  async fetchPid(stopId) {
    const stopIds = stopId.split(',');
    const depReq = await this.getDepartures({
      ts: new Date().getTime() / 1000,
      stopId, offset: 0, limit: 15, excludeCancelled: true,
      modes: 'au2:sydneytrains,au2:nswtrains' // excl. bus,coach
    });

    const now = new Date().getTime() / 1000;
    let pidData, nextPidData, dvaData;

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

    // Next Service
    if (departures.length > 0) {
      const nextService = await this.getTripInstance(departures[0].tripInstance._path);
      pidData = this.extractPidData(nextService.response, departures[0].stopTimeInstance);
      // const dvaReq = await this.getDva(departures[0].stopTimeInstance._path);
      // dvaData = dvaReq.response.dva;
    }

    // Following Services
    if (departures.length > 1) {
      const followingServices = await this.getTripInstance(departures[1].tripInstance._path);
      nextPidData = this.extractPidData(followingServices.response, departures[1].stopTimeInstance);
    }

    /*
    {
      id: i.realtimeTripId,
      type: idToType(i.transportation.iconId),
      class: i.transportation.product.class,
      departs: i.departureTimeEstimated || i.departureTimePlanned,
      line: i.transportation.disassembledName,
      destination: i.transportation.destination.name,
      origin: i.transportation.origin.name,
      platform: { title: platform?.[1], value: platform?.[2] },
      booking: i.isBookingRequired,
      cancelled: i.isCancelled,
      stops: i.onwardLocations.map(x => {
        return {
          station: nameTransform(x.disassembledName || x.name),
          stationId: x.parentId,
          // platform: x.platform?.replace('Platform ', ''),
          departs: x.departureTimeEstimated || x.departureTimePlanned,
          arrives: x.arrivalTimeEstimated || x.arrivalTimePlanned
        };
      })
    }
    */

    return {
      id: pidData.service.tripInstance.trip.id,
      line: pidData.service.tripInstance.trip.route.name,
      mode: modeToType(pidData.service.tripInstance.trip.route.mode, pidData.isIntercity),
      departs: pidData.stopTimeInstance.departure.time,
      serviceTime: (pidData.stopTimeInstance.departure.time - (pidData.stopTimeInstance.departure.delay || 0)) * 1000,
      destination: { to: pidData.headsign.headline, via: pidData.headsign.subtitle },
      platform: { title: pidData.stop.disassembled.platformType, value: pidData.stop.disassembled.platformName },

      cars: pidData.cars,
      doesNotStop: pidData.doesNotStop,
      isBookingRequired: pidData.isBookingRequired,
      isExpress: pidData.isExpress,
      isLimitedStops: pidData.isLimitedStops,
      isIntercity: pidData.isIntercity,

      stops: pidData.stations.map(station => nameTransform(station.fullName)),
      dva: dvaData,

      _anyTrip: {
        stop: depReq.response.stop,
        departures, pidData, nextPidData, dvaData
      }
    };
  }

  /* eslint-disable max-depth */
  extractPidData(service, currentStopTimeInstance) {
    if (service.realtimePattern) {
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
