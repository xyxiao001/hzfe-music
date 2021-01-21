import React, { useEffect, useState } from 'react';
import './index.scss'
import { InterfaceMusicInfo, InterfaceMusicPlayingInfo } from '../../Interface/music';
import { formatTime } from '../../utils';
import Progress from '../Progress';
const Control = (props: {
  currentInfo: InterfaceMusicInfo | null,
  currentTime: number,
  isPlaying: boolean,
  handlePlay: Function,
  handlePause: Function,
  handleChanging: Function,
  setChange: Function,
  musicPlayingInfo: InterfaceMusicPlayingInfo
}) => {

  const [range, setRange] = useState(0)

  useEffect(() => {
    const allTime = props.currentInfo?.duration || props.musicPlayingInfo.duration || 0
    setRange(
      (props.currentTime / allTime) * 100
    )
  }, [props.currentInfo, props.currentTime, props.musicPlayingInfo.duration])

  return (
    <section className="player-control">
      <section className="control-progress">
        <Progress range={ Number(range.toFixed(2)) } handleChanging={props.handleChanging} setChange={props.setChange}></Progress>
        {/* <span>歌曲进度百分比: { range.toFixed(2) }%</span> */}
      </section>
      <section className="control-line">
        <section className="line-left">
          <span> {formatTime(props.currentTime || 0)} </span>
          <span> {formatTime(props.currentInfo?.duration ||  props.musicPlayingInfo.duration  || 0)} </span>
        </section>
        <section className="line-center">
          <p className="icon-play-bg" onClick={
            () => {
              if (props.isPlaying) {
                props.handlePause()
              } else {
                props.handlePlay()
              }
            }
          }>
            {
              props.isPlaying ? (
                <svg className="icon icon-pause" aria-hidden="true">
                  <use xlinkHref="#icon-Pause"></use>
                </svg>

              ) : (
                  <svg className="icon icon-play" aria-hidden="true">
                    <use xlinkHref="#icon-Play"></use>
                  </svg>

                )
            }
          </p>
        </section>
      </section>
    </section>
  )
}

export default Control