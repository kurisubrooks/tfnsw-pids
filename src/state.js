import React, { Component } from 'react';
const Context = React.createContext({});
export const Provider = Context.Provider;
export default Context;

export class StateManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      theme: props.theme,
      serviceTitle: null,
      isLandscape: null
    };
  }

  componentDidMount() {
    this.updateState();
    document.body.classList.add(this.state.theme);
    window.addEventListener('resize', this.updateState.bind(this));
  }

  componentWillUnmount() {
    document.body.classList.remove(this.state.theme);
    window.removeEventListener('resize', this.updateState.bind(this));
  }

  updateState() {
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
