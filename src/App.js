/* eslint-disable no-unreachable */
import React, { Component } from 'react';
import { ServiceBar } from './components/ServiceBar';
import { ServiceView } from './components/ServiceView';
import { NextServicesBar } from './components/NextServicesBar';
import { DebugView } from './components/DebugView';

import { NetworkTime, DepartureTimeCountdown, idToType, nameTransform } from './util';
import { StateManager } from './state';
import config from './config';

import testData from './data/output_complex.json';

// Constants
const params = new URLSearchParams(window.location.search);
const stopId = params.get('stop') || 200060;
const departureTimeout = 0;

// 200060 Central
// 206710 Chatswood
// 215020 Parramatta
// 279010 Lithgow

export const schema = { id: null, type: idToType(-1), departs: null, line: null, destination: null, origin: null, platform: null, stops: [] };

const useTestData = false;
const useDebugView = params.has('debugView') || false;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      services: [schema],
      syncLock: false,
      timeNow: NetworkTime(),
      departureTimer: null,
      hasDeparted: false
    };
  }

  componentDidMount() {
    this.syncServices();
    this.timerID = setInterval(() => this.tick(), 500);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    const now = new Date();
    const departs = new Date(this.state.services[0]?.departs);
    const hasDeparted = !((departs - now) / 1000 > departureTimeout);

    this.setState({
      time: NetworkTime(),
      departureTimer: DepartureTimeCountdown(this.state.services[0]?.departs),
      hasDeparted: hasDeparted
    });

    if (this.state.services.length > 1 && hasDeparted) {
      this.syncServices();
    }
  }

  async syncServices() {
    if (this.state.syncLock) return false;
    console.log('Updating Data');
    this.setState({ syncLock: true });
    const data = await this.fetchData();
    if (!Array.isArray(data) && data.error) {
      return this.setState({ error: data.error });
    }
    this.setState({ services: data, syncLock: false });
    return true;
  }

  async fetchData() {
    try {
      let response;
      if (useDebugView) return [schema];
      if (!useTestData) {
        console.info('Requesting');
        const apiURL = `https://transportnsw.info/api/trip/v1/departure-list-request?debug=false&depArrMacro=dep&depType=stopEvents&name=${stopId}&type=stop&accessible=false`;

        const { proxy } = config;
        if (!proxy.url || proxy.url === '') {
          console.error('Missing Proxy URL');
          return { error: 'Missing Proxy URL' };
        }

        // You may need to change this line/format to work with whatever
        // cors proxy you're using
        const url = proxy.url + `?url=${encodeURIComponent(apiURL)}`;
        response = await fetch(url, proxy.fetchOptions || {});
      }

      const json = useTestData ? testData : await response.json();
      const stopEvents = json.stopEvents;

      if (useTestData) stopEvents[0].departureTimeEstimated = new Date().getTime() + (500 * 800 * 50);

      const output = stopEvents
        // filter out buses
        .filter(a => a?.transportation.product.class <= 3)
        // filter out already-departed services
        .filter(b => (new Date(b?.departureTimeEstimated || b?.departureTimePlanned) - new Date()) / 1000 > departureTimeout)
        .map(i => {
          const platform = i.location.platform?.match(/(Wharf|Stand|Platform) ([a-z|A-Z|0-9]*)/);
          return {
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
          };
        });

      console.log(output);
      return output.length === 0 ? [schema] : output;
    } catch(error) {
      console.log(error);
      this.setState({ error: error.toString() });
      return [];
    }
  }

  render() {
    return this.state.error
      ? <div>Error: {this.state.error}</div>
      : useDebugView
        ? <StateManager>
          <DebugView />
        </StateManager>
        : <StateManager>
          <div className="wrapper">
            <ServiceBar service={this.state.services[0]} />
            <ServiceView services={this.state.services} stops={this.state.services[0]?.stops} departure={this.state.departureTimer} />
            <NextServicesBar />
          </div>
        </StateManager>;
  }
}

export default App;
