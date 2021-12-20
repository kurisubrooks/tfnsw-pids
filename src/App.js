/* eslint-disable no-unreachable */
import React, { Component } from 'react';
import { DebugView } from './views/DebugView';
import { NextTrainView } from './views/NextTrainView';

import DataGetter from './lib/DataGetter';
import { DepartureTimeCountdown } from './util';
import { StateManager } from './state';

// Constants
const params = new URLSearchParams(window.location.search);
const useDebugView = params.has('debugView') || false;
const stopId = params.get('stop') || '200060';
const theme = params.get('theme') === 'dark' ? 'dark' : 'light';

// 200060 Central
// 206710 Chatswood
// 215020 Parramatta
// 278610 Katoomba
// 279010 Lithgow
// 26041 Canberra

export const schema = { id: null, cars: null, line: null, mode: null, departs: null, serviceTime: null, destination: { to: null, via: null }, platform: { title: null, value: null }, doesNotStop: null, isBookingRequired: null, isExpress: null, isLimitedStops: null, isIntercity: true, stops: [] };

class App extends Component {
  constructor(props) {
    super(props);
    this.stopId = stopId;
    this.dataGetter = new DataGetter();
    this.state = {
      error: null,
      services: [schema],
      departureTimer: null
    };
  }

  componentDidMount() {
    if (!useDebugView) {
      this.fetchData();
      this.tickTimer = setInterval(() => this.tick(), 500); // 0.5s
      this.dataTimer = setInterval(() => this.fetchData(), 15 * 1000); // 15s
    }
  }

  componentWillUnmount() {
    clearInterval(this.tickTimer);
    clearInterval(this.dataTimer);
  }

  tick() {
    this.setState({
      departureTimer: DepartureTimeCountdown(this.state.services[0]?.departs)
    });
  }

  async fetchData() {
    const getData = await this.dataGetter.fetchPid(this.stopId);
    if (!getData) return false;
    console.log(getData);
    return this.setState({ services: getData });
  }

  render() {
    return <StateManager theme={theme}>
      {this.state.error
        ? <div>Error: {this.state.error}</div>
        : useDebugView
          ? <DebugView />
          : <>
            <div className="wrapper">
              <NextTrainView
                services={this.state.services}
                departureTimer={this.state.departureTimer} />
            </div>
          </>
      }
    </StateManager>;
  }
}

export default App;
