import React from "react"
import './index.scss'

const PlayingIcon = (props: {
  className?: string
}) => {
  return (
    <p className={`playing-icon ${props.className || ''}`.trim()}>
      <span className="rect1"></span>
      <span className="rect2"></span>
      <span className="rect3"></span>
      <span className="rect4"></span>
      <span className="rect5"></span>
    </p>
  )
}

export default PlayingIcon
