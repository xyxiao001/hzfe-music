import React, { useEffect, useState } from 'react';
import './index.scss'
import { InterfaceMusicInfo, InterfaceMusicPlayingInfo } from '../../Interface/music';
import { formatTime } from '../../utils';
import Progress from '../Progress';
import { PauseCircleOutlined, PlayCircleOutlined, StepBackwardOutlined, StepForwardOutlined } from '@ant-design/icons';
import common from '../../store/common';
import PlayingType from './playingType';

const Control = (props: {
  currentInfo: InterfaceMusicInfo | null,
  currentTime: number,
  isPlaying: boolean,
  handlePlay: Function,
  handlePause: Function,
  handleChanging: Function,
  setChange: Function,
  musicPlayingInfo: InterfaceMusicPlayingInfo,
  min?: Boolean
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
      {
        props.min ? (
          <section className="control-min">
            <section className="control-icon-list">
              <p onClick={() => common.handlePreMusic()}>
                <StepBackwardOutlined />
              </p>
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
                    <PauseCircleOutlined />
                  ) : (
                    <PlayCircleOutlined />
                    )
                }
              </p>
              <p onClick={() => common.handleNextMusic()}>
                <StepForwardOutlined />
              </p>
              <PlayingType></PlayingType>
            </section>
            <section className="control-progress">
              <Progress range={Number(range.toFixed(2))} handleChanging={props.handleChanging} setChange={props.setChange}></Progress>
            </section>
            <section className="line-left">
              <span> {formatTime(props.currentTime || 0)} </span>
              <span>/</span>
              <span> {formatTime(props.currentInfo?.duration || props.musicPlayingInfo.duration || 0)} </span>
            </section>
          </section>
        ) : (
            <section className="control">
              <section className="control-progress">
                <Progress range={Number(range.toFixed(2))} handleChanging={props.handleChanging} setChange={props.setChange}></Progress>
              </section>
              <section className="control-line">
                <section className="line-left">
                  <span> {formatTime(props.currentTime || 0)} </span>
                  <span> {formatTime(props.currentInfo?.duration || props.musicPlayingInfo.duration || 0)} </span>
                </section>
                <section className="line-center">
                <section className="control-icon-list">
                  <p onClick={() => common.handlePreMusic()}>
                    <StepBackwardOutlined />
                  </p>
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
                        <PauseCircleOutlined />
                      ) : (
                        <PlayCircleOutlined />
                      )
                    }
                  </p>
                  <p onClick={() => common.handleNextMusic()}>
                    <StepForwardOutlined />
                  </p>
                  <PlayingType></PlayingType>
            </section>
                </section>
              </section>
            </section>
          )
      }

    </section>
  )
}

export default Control