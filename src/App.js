/* eslint-disable no-unreachable */
import React, { Component } from 'react';
import { DebugView } from './views/DebugView';
import { NextTrainView } from './views/NextTrainView';

import DataGetter from './lib/DataGetter';
import { DepartureTimeCountdown, modeToType } from './util';
import { StateManager } from './state';

// Constants
const params = new URLSearchParams(window.location.search);
const stopId = params.get('stop') || 200060;

// 200060 Central
// 206710 Chatswood
// 215020 Parramatta
// 279010 Lithgow

export const schema = { id: null, type: modeToType('sydneytrains'), departs: null, line: null, destination: { to: null, via: null }, platform: null, stops: [] };
const useDebugView = params.has('debugView') || false;

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
    this.fetchData();
    this.tickTimer = setInterval(() => this.tick(), 500); // 0.5s
    this.dataTimer = setInterval(() => this.fetchData(), 15 * 1000); // 15s
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
    this.setState({ services: getData });
    console.log(getData);
  }

  render() {
    return <StateManager>
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
