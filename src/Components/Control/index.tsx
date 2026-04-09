import React, { useEffect, useState } from 'react';
import './index.scss'
import { InterfaceMusicInfo, InterfaceMusicPlayingInfo } from '../../Interface/music';
import { formatTime } from '../../utils';
import Progress from '../Progress';
import { AudioMutedOutlined, PauseCircleOutlined, PlayCircleOutlined, SoundOutlined, StepBackwardOutlined, StepForwardOutlined } from '@ant-design/icons';
import common from '../../store/common';
import PlayingType from './playingType';
import { Slider } from 'antd';
import { observer } from 'mobx-react-lite';

const Control = observer((props: {
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

  const isMuted = common.muted || common.volume <= 0
  const volumeValue = Math.round(common.volume * 100)

  const handleVolumeChange = (value: number | number[]) => {
    const next = Array.isArray(value) ? value[0] : value
    common.setVolume(next / 100)
  }

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
              <p onClick={() => common.toggleMuted()} className="volume-toggle">
                {isMuted ? <AudioMutedOutlined /> : <SoundOutlined />}
              </p>
            </section>
            <section className="control-progress">
              <Progress range={Number(range.toFixed(2))} handleChanging={props.handleChanging} setChange={props.setChange}></Progress>
            </section>
            <section className="control-volume">
              <Slider
                min={0}
                max={100}
                step={1}
                value={volumeValue}
                onChange={handleVolumeChange}
              />
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
              <section className="control-volume">
                <button
                  className="volume-toggle"
                  type="button"
                  onClick={() => common.toggleMuted()}
                >
                  {isMuted ? <AudioMutedOutlined /> : <SoundOutlined />}
                </button>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={volumeValue}
                  onChange={handleVolumeChange}
                />
              </section>
            </section>
          )
      }

    </section>
  )
})

export default Control
