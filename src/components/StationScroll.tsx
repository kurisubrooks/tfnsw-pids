import React from 'react'

import plane from '../assets/icons/airport.svg'
import Marquee from './Marquee'

import '../assets/styles/StationScroll.scss'

const icons: Record<string, string> = {
  plane: plane,
}

interface StationScrollProps {
  stops?: string[]
  limit: number
  speed?: number
}

export const StationScroll: React.FC<StationScrollProps> = ({
  stops,
  limit,
  speed = 75,
}) => {
  if (!stops) return null

  const items = [
    ...stops.map((name) => ({ key: name, name })),
    { key: 'spacer-0', name: '' },
    { key: 'spacer-1', name: '' },
  ]

  const scroll = stops.length > limit
  const scrollSpeed = speed * (window.innerHeight / 650)

  return (
    <div className="station_scroll">
      {scroll ? (
        <Marquee speed={scrollSpeed}>
          {items.map((item) => (
            <Station key={item.key} name={item.name} />
          ))}
        </Marquee>
      ) : (
        items.map((item) => (
          <Station key={item.key} name={item.name} />
        ))
      )}
    </div>
  )
}

interface StationProps {
  name: string
}

const Station: React.FC<StationProps> = ({ name }) => {
  let displayName = name
  let altIcon: string | null = null

  if (displayName.includes(' Airport')) {
    displayName = displayName.replace(' Airport', '')
    altIcon = 'plane'
  }

  return (
    <div className="station">
      {displayName}
      {altIcon && <img className="icon" src={icons[altIcon]} alt="" />}
    </div>
  )
}
