import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'

import { ErrorView } from '../views/ErrorView'

import '../assets/styles/base.scss'

export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  errorComponent: ErrorView,
  component: RootComponent,
})

function RootComponent() {
  return <Outlet />
}
