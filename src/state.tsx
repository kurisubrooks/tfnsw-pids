import type { ReactNode } from 'react'
import React, { Component } from 'react'

import type { StateContextType } from './types'

const Context = React.createContext<StateContextType>({})
export const Provider = Context.Provider
export default Context

interface StateManagerProps {
  theme: string
  children: ReactNode
}

interface StateManagerState {
  theme: string
  serviceTitle: string | null
  isLandscape: boolean | null
}

export class StateManager extends Component<
  StateManagerProps,
  StateManagerState
> {
  constructor(props: StateManagerProps) {
    super(props)
    this.state = {
      theme: props.theme,
      serviceTitle: null,
      isLandscape: null,
    }
  }

  componentDidMount() {
    this.updateState()
    if (this.state.theme) {
      document.body.classList.add(this.state.theme)
    }
    window.addEventListener('resize', this.updateState)
  }

  componentWillUnmount() {
    if (this.state.theme) {
      document.body.classList.remove(this.state.theme)
    }
    window.removeEventListener('resize', this.updateState)
  }

  updateState = () => {
    const isLandscape = window.innerHeight < window.innerWidth
    const serviceTitle = isLandscape ? 'Next service' : 'Service'
    this.setState({ isLandscape, serviceTitle })
  }

  render() {
    return <Provider value={this.state}>{this.props.children}</Provider>
  }
}
