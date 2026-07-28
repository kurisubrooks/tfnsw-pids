import type { ReactNode, CSSProperties } from 'react'
import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useSyncExternalStore,
} from 'react'

import '../assets/styles/StationScroll.scss'

/*
  Forked from Justin Chu under the MIT License
  https://github.com/justin-chu/react-fast-marquee
  https://www.react-fast-marquee.com/documentation
*/

interface MarqueeProps {
  style?: CSSProperties
  className?: string
  play?: boolean
  direction?: 'up' | 'down'
  speed?: number
  delay?: number
  loop?: number
  children?: ReactNode
}

const defaultStyle: CSSProperties = {}
const noop = () => () => {}
const getTrue = () => true
const getFalse = () => false

const Marquee: React.FC<MarqueeProps> = ({
  style = defaultStyle,
  className = '',
  play = true,
  direction = 'up',
  speed = 30,
  delay = 0,
  loop = 0,
  children,
}) => {
  // React Hooks
  const [containerHeight, setContainerHeight] = useState(0)
  const [marqueeHeight, setMarqueeHeight] = useState(0)
  const [duration, setDuration] = useState(0)
  const isMounted = useSyncExternalStore(noop, getTrue, getFalse)
  const containerRef = useRef<HTMLDivElement>(null)
  const marqueeRef = useRef<HTMLDivElement>(null)

  const calculateHeight = () => {
    // Find height of container and height of marquee
    if (marqueeRef.current && containerRef.current) {
      setContainerHeight(containerRef.current.getBoundingClientRect().height)
      setMarqueeHeight(marqueeRef.current.getBoundingClientRect().height)
    }

    if (marqueeHeight < containerHeight) {
      setDuration(containerHeight / speed)
    } else {
      setDuration(marqueeHeight / speed)
    }
  }

  useEffect(() => {
    calculateHeight()
    // Rerender on window resize
    window.addEventListener('resize', calculateHeight)
    return () => {
      window.removeEventListener('resize', calculateHeight)
    }
  })

  const styles = useMemo(
    () =>
      ({
        '--play': play ? 'running' : 'paused',
        '--direction': direction === 'up' ? 'normal' : 'reverse',
        '--duration': `${duration}s`,
        '--delay': `${delay}s`,
        '--iteration-count': loop ? `${loop}` : 'infinite',
      }) as CSSProperties,
    [play, direction, duration, delay, loop],
  )

  if (!isMounted) return null

  return (
    <div ref={containerRef} style={style} className={className + ' marquee'}>
      <div ref={marqueeRef} className="marquee_container" style={styles}>
        {children}
      </div>
      <div style={styles} className="marquee_container">
        {children}
      </div>
    </div>
  )
}

export default Marquee
