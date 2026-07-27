import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({
      to: '/$stopId',
      params: { stopId: '200060' },
      search: (prev) => prev || {},
    })
  },
})
