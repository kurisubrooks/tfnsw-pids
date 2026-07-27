import React from 'react'

import '../assets/styles/ServiceIcon.scss'

import B from '../assets/icons/B.svg'
import C from '../assets/icons/C.svg'
import F from '../assets/icons/F.svg'
import L from '../assets/icons/L.svg'
import M from '../assets/icons/M.svg'
import T from '../assets/icons/T.svg'
import T1 from '../assets/icons/T1_noborder.svg'
import T2 from '../assets/icons/T2_noborder.svg'
import T3 from '../assets/icons/T3_noborder.svg'
import T4 from '../assets/icons/T4_noborder.svg'
import T5 from '../assets/icons/T5_noborder.svg'
import T6 from '../assets/icons/T6_noborder.svg'
import T7 from '../assets/icons/T7_noborder.svg'
import T8 from '../assets/icons/T8_noborder.svg'
import T9 from '../assets/icons/T9_noborder.svg'
import TL from '../assets/icons/TL.svg'
import blank from '../assets/icons/blank.svg'
import donotboard from '../assets/icons/donotboard.svg'
import information from '../assets/icons/information.svg'

const icons: Record<string, string> = {
  M,
  T,
  TL,
  B,
  F,
  L,
  C,
  T1,
  T2,
  T3,
  T4,
  T5,
  T6,
  T7,
  T8,
  T9,
  information,
  donotboard,
  blank,
}

const typeToText: Record<string, string> = {
  train: 'T',
  intercity: 'T',
  trainlink: 'TL',
  bus: 'B',
  coach: 'C',
  metro: 'M',
  lightrail: 'L',
  ferry: 'F',
}

interface ServiceIconProps {
  line?: string | null
  type?: string | null
  icon?: string | null
}

export const ServiceIcon: React.FC<ServiceIconProps> = ({
  line,
  type,
  icon,
}) => {
  // Pre-determined Icons
  if (icon) {
    if (icon === 'information') {
      return <NewIcon icon="information" isLarge={true} />
    } else if (icon === 'outofservice') {
      return <NewIcon icon="donotboard" />
    }
  }

  let effectiveType = type || 'blank'
  if (!line) effectiveType = 'blank'
  const isRound = ['intercity', 'trainlink', 'coach', 'metro'].includes(
    effectiveType,
  )
  const isSmall = isRound && effectiveType !== 'metro'
  const text = isRound ? typeToText[effectiveType] : line

  return <NewIcon icon={text || 'blank'} isSmall={isSmall} />
}

interface NewIconProps {
  icon: string
  isSmall?: boolean
  isLarge?: boolean
}

const NewIcon: React.FC<NewIconProps> = ({ icon, isSmall, isLarge }) => {
  const iconKey = icon || 'blank'
  const classes = ['service_icon']
  if (isSmall) classes.push('small')
  if (isLarge) classes.push('large')
  return (
    <img
      className={classes.join(' ')}
      src={icons[iconKey] || icons.blank}
      alt=""
    />
  )
}
