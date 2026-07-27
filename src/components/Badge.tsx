import React, { useContext } from 'react'

import State from '../state'

import '../assets/styles/Badge.scss'

// <Badges hasBooking={true} items={['8 cars', 'All Stops']} />
export const Badges: React.FC<BadgesProps> = ({ items, hasBooking }) => {
  const { theme } = useContext(State)
  const filteredItems = items?.filter(Boolean) as string[]

  return (
    <div className={`badge_stack ${theme || ''}`}>
      {hasBooking && (
        <div className="badge_group has-booking">
          <BadgeItem isBooking={true} text="Booked seats only" />
        </div>
      )}
      {filteredItems && filteredItems.length > 0 && (
        <div className="badge_group">
          {filteredItems.map((i) => (
            <BadgeItem text={i} key={i} />
          ))}
        </div>
      )}
    </div>
  )
}

interface BadgesProps {
  items?: (string | null | undefined)[]
  hasBooking?: boolean
}

interface BadgeItemProps {
  text?: string | null
  isBooking?: boolean
}

const BadgeItem: React.FC<BadgeItemProps> = ({ text, isBooking }) => {
  if (!text || text === '') return null
  const classes = `badge ${isBooking ? 'badge-booking' : ''}`
  return <div className={classes}>{text}</div>
}
