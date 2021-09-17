import React, { Component } from 'react';
const Context = React.createContext({});
export const Provider = Context.Provider;
export default Context;

export class StateManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      serviceTitle: null,
      isLandscape: null
    };
  }

  componentDidMount() {
    this.updateDimensions();
    window.addEventListener('resize', this.updateDimensions.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions.bind(this));
  }

  updateDimensions() {
    const isLandscape = window.innerHeight < window.innerWidth;
    const serviceTitle = isLandscape ? 'Next service' : 'Service';
    this.setState({ isLandscape, serviceTitle });
  }

  render() {
    return <Provider value={this.state}>
      {this.props.children}
    </Provider>;
  }
};
