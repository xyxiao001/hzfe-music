import { useEffect, useRef, useState } from 'react';
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
  const [volumeOpen, setVolumeOpen] = useState(false)
  const volumeWrapRef = useRef<HTMLElement | null>(null)
  const volumeCloseTimerRef = useRef<number | null>(null)

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

  useEffect(() => {
    if (props.min) return
    if (!volumeOpen) return

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null
      if (!target) return
      const wrap = volumeWrapRef.current
      if (!wrap) return
      if (!wrap.contains(target)) {
        setVolumeOpen(false)
      }
    }

    window.addEventListener('mousedown', handlePointerDown, true)
    window.addEventListener('touchstart', handlePointerDown, true)
    return () => {
      window.removeEventListener('mousedown', handlePointerDown, true)
      window.removeEventListener('touchstart', handlePointerDown, true)
    }
  }, [volumeOpen])

  const clearVolumeCloseTimer = () => {
    if (volumeCloseTimerRef.current) {
      window.clearTimeout(volumeCloseTimerRef.current)
      volumeCloseTimerRef.current = null
    }
  }

  const scheduleCloseVolume = () => {
    clearVolumeCloseTimer()
    volumeCloseTimerRef.current = window.setTimeout(() => {
      setVolumeOpen(false)
      volumeCloseTimerRef.current = null
    }, 140)
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
              <button
                className="volume-toggle"
                type="button"
                onClick={() => common.toggleMuted()}
                aria-label="静音"
              >
                {isMuted ? <AudioMutedOutlined /> : <SoundOutlined />}
              </button>
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

                  <section
                    ref={volumeWrapRef}
                    className={`control-volume volume-cluster ${volumeOpen ? 'is-open' : ''}`}
                    onMouseEnter={() => {
                      clearVolumeCloseTimer()
                      setVolumeOpen(true)
                    }}
                    onMouseLeave={() => {
                      scheduleCloseVolume()
                    }}
                  >
                    <button
                      className="volume-toggle"
                      type="button"
                      onClick={(evt) => {
                        evt.preventDefault()
                        if (volumeOpen) {
                          common.toggleMuted()
                          return
                        }
                        setVolumeOpen(true)
                      }}
                      aria-label="音量"
                    >
                      {isMuted ? <AudioMutedOutlined /> : <SoundOutlined />}
                    </button>
                    <section
                      className="volume-pop volume-pop-vertical"
                      aria-label="音量滑条"
                      onMouseEnter={() => {
                        clearVolumeCloseTimer()
                        setVolumeOpen(true)
                      }}
                      onMouseLeave={() => {
                        scheduleCloseVolume()
                      }}
                    >
                      <Slider
                        vertical
                        min={0}
                        max={100}
                        step={1}
                        value={volumeValue}
                        onChange={handleVolumeChange}
                      />
                    </section>
                  </section>
                </section>
              </section>
            </section>
          )
      }

    </section>
  )
})

export default Control
