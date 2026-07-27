import { createRootRoute, Outlet } from '@tanstack/react-router'

import { ErrorView } from '../views/ErrorView'

import '../assets/styles/base.scss'

export const Route = createRootRoute({
  errorComponent: ErrorView,
  component: RootComponent,
})

function RootComponent() {
  return <Outlet />
}
