import React, { useEffect, useState, useRef } from 'react';
import '../assets/styles/marquee.scss';

/*
  Forked from Justin Chu under the MIT License
  https://github.com/justin-chu/react-fast-marquee
  https://www.react-fast-marquee.com/documentation
*/

const Marquee = ({ style = {}, className = '', play = true, direction = 'up', speed = 30, delay = 0, loop = 0, children }) => {
  // React Hooks
  const [containerHeight, setContainerHeight] = useState(0);
  const [marqueeHeight, setMarqueeHeight] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef(null);
  const marqueeRef = useRef(null);

  const calculateHeight = () => {
    // Find height of container and height of marquee
    if (marqueeRef.current && containerRef.current) {
      setContainerHeight(containerRef.current.getBoundingClientRect().height);
      setMarqueeHeight(marqueeRef.current.getBoundingClientRect().height);
    }

    if (marqueeHeight < containerHeight) {
      setDuration(containerHeight / speed);
    } else {
      setDuration(marqueeHeight / speed);
    }
  };

  useEffect(() => {
    calculateHeight();
    // Rerender on window resize
    window.addEventListener('resize', calculateHeight);
    return () => {
      window.removeEventListener('resize', calculateHeight);
    };
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const styles = {
    '--play': play ? 'running' : 'paused',
    '--direction': direction === 'up' ? 'normal' : 'reverse',
    '--duration': `${duration}s`,
    '--delay': `${delay}s`,
    '--iteration-count': !!loop ? `${loop}` : 'infinite'
  };

  return isMounted && <>
    <div
      ref={containerRef}
      style={{ ...style }}
      className={className + ' marquee-container'}
    >
      <div ref={marqueeRef} className="marquee" style={styles}>
        {children}
      </div>
      <div style={styles} className="marquee">
        {children}
      </div>
    </div>
  </>;
};

export default Marquee;
