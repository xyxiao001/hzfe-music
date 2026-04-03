import React, { useEffect, useRef, useState } from "react"
import './index.scss'

const MarqueeText = (props: {
  text: string
  className?: string
}) => {
  const containerRef = useRef<HTMLParagraphElement | null>(null)
  const textRef = useRef<HTMLSpanElement | null>(null)
  const [overflow, setOverflow] = useState(false)

  useEffect(() => {
    const checkOverflow = () => {
      const container = containerRef.current
      const text = textRef.current
      if (!container || !text) return
      setOverflow(text.scrollWidth > container.clientWidth)
    }
    checkOverflow()
    window.addEventListener('resize', checkOverflow)
    return () => {
      window.removeEventListener('resize', checkOverflow)
    }
  }, [props.text])

  return (
    <p
      ref={containerRef}
      className={`marquee-text ${overflow ? 'is-overflow' : ''} ${props.className || ''}`.trim()}
    >
      <span ref={textRef} className="marquee-track">{props.text}</span>
      {overflow ? <span className="marquee-track clone">{props.text}</span> : null}
    </p>
  )
}

export default MarqueeText
