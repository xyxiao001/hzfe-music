import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import './index.scss'
import Upload from '../Upload'
import localforage from 'localforage';
import { Howl } from 'howler'
import { InterfaceMusicInfo } from '../../Interface/music';
import Lrc from '../Lrc';
import Control from '../Control';
import LrcWord from '../Lrc/Lrc-word';
import FastAverageColor from 'fast-average-color';
import { setLightness, setSaturation } from 'polished';
import { initData, reducer } from '../../Mobx/music-reducer';

const fac = new FastAverageColor();

const Player = () => {

  const [musicPlayer, setMusicPlayer] = useState<Howl | null>(null)

  const [musicInfo, setMusicInfo] = useState<InterfaceMusicInfo | null>(null)

  const [musicColor, setMusicColor] = useState('#52c41a')

  const [currentLrc, setCurrentLrc] = useState('')

  const refChange = useRef('')

  // 当前的状态, 用来做歌曲时间，还是当前拖动时间的判定
  const [musicData, dispatchMusic] = useReducer(reducer, initData)

  const handleChanging = (value: number) => {
    // 当前拖动时间的改变
    // 反推出当前时间
    const time = (musicInfo?.duration || 0) * value / 100
    dispatchMusic(
      {
        type: 'update',
        data: {
          currentTime: time
        }
      }
    )
  }

  const setChangeFromControl = (key: boolean) => {
    if (!key) {
      // 表示操作结束，开始同步数据，播放
      musicPlayer?.seek(musicData.currentTime)
      if (!musicData.playing) {
        musicPlayer?.play()
      }
      setTimeout(() => {
        musicPlaying()
      }, 50)
      
    }
    dispatchMusic({
      type: 'change',
      data: {
        change: key
      }
    })
  }

  const getInfoFormLocal = async () => {
    return new Promise((resolve, reject) => {
      Promise.all([
        localforage.getItem('music'),
        localforage.getItem('musicData'),
        localforage.getItem('musicLrc'),
      ]).then(res => {
        const obj: InterfaceMusicInfo = res[0] as InterfaceMusicInfo
        obj.music = res[1] as Blob
        obj.lrc = res[2] as string
        resolve(obj)
      }).catch(err => {
        reject(err)
      })
    })
  }

  // 歌曲正在播放哦
  const musicPlaying = useCallback(() => {
    if (refChange.current) return
    if (musicPlayer) {
      dispatchMusic({
        type: 'update',
        data: {
          duration: musicPlayer.duration(),
          playing: musicPlayer.playing(),
          currentTime: musicPlayer.seek()
        }
      })
      if (musicPlayer.playing()) {
        requestAnimationFrame(musicPlaying)
      }
    }
  }, [musicPlayer])

  // 歌曲暂停事件
  const handlePause = useCallback(() => {
    if (musicPlayer) {
      musicPlayer.pause()
      dispatchMusic({
        type: 'update',
        data: {
          playing: false,
        }
      })
    }
  }, [musicPlayer])

  // 歌曲停止事件
  // const handleStop = useCallback(() => {
  //   if (musicPlayer) {
  //     musicPlayer.stop()
  //   }
  // }, [musicPlayer])

  // 歌曲播放事件
  const handelPlay = useCallback(() => {
    if (musicPlayer) {
      if (!musicPlayer.playing()) {
        musicPlayer.play()
        const time = musicPlayer.seek() as number
        dispatchMusic({
          type: 'update',
          data: {
            duration: musicPlayer.duration(),
            playing: true,
            currentTime: time
          }
        })
        setTimeout(() => {
          requestAnimationFrame(musicPlaying)
        }, 50)
      }
    }
  }, [musicPlayer, musicPlaying])

  const getMusicInfo = useCallback(async () => {
    const info: InterfaceMusicInfo = await getInfoFormLocal() as InterfaceMusicInfo
    setMusicInfo(info)
    fac.getColorAsync(info.picture[0])
    .then(color => {
        setMusicColor(
          setSaturation(.5, setLightness(.5, color.rgba))
        )
    })
    .catch(e => {
      setMusicColor(
        '#52c41a'
      )
    });
  }, [])

  // 绑定键盘事件
  const keyDown = useCallback((event: any) => {
    const keyCode = event.keyCode as number
    if (keyCode === 32) {
      if (musicData.playing) {
        handlePause()
      } else {
        handelPlay()
      }
    }
  }, [handelPlay, handlePause, musicData.playing])

  useEffect(() => {
    console.log('useEffect-getMusicInfo')
    getMusicInfo()
  }, [getMusicInfo])


  useEffect(() => {
    console.log('useEffect-create')
    if (musicInfo && !musicPlayer) {
      console.log('创建音乐实例')
      setMusicPlayer(
        new Howl({
          src: URL.createObjectURL(musicInfo.music),
          html5: true,
          format: [musicInfo.codec.toLowerCase()],
        })
      )
    }
  }, [musicInfo, musicPlayer])

  useEffect(() => {
    refChange.current = musicData.change
  })

  useEffect(() => {
    // 绑定enter 事件
    window.addEventListener('keydown', keyDown)
    return () => {
      window.removeEventListener('keydown', keyDown)
    }
  }, [keyDown])


  return (
    <section className="player">
      <section className="player-bg" style={{ "backgroundImage": `url(${musicInfo?.picture[0] || process.env.PUBLIC_URL + '/images/music-no.jpeg'})` }}></section>
      <section className="player-fade"></section>
      <Upload></Upload>
      {/* 这里去渲染歌曲信息 */}
      <section className="player-layout">
        {
          musicInfo ?
            <section className="player-box">

              <section className="player-left">
                <section className="player-line">
                  <img src={musicInfo.picture[0] || process.env.PUBLIC_URL + '/images/music-no.jpeg'} alt="" />
                </section>
                <section className="player-line">
                  <section className="player-info">
                    <p className="music-name">{musicInfo.name}</p>
                    <p className="music-artist">{musicInfo.artist} - {musicInfo.album}</p>
                    <p className="music-current-lrc">{ currentLrc }</p>
                  </section>
                </section>
                <Control
                  handlePlay={handelPlay}
                  handlePause={handlePause}
                  currentInfo={musicInfo || null}
                  currentTime={musicData.currentTime}
                  handleChanging={handleChanging}
                  setChange={setChangeFromControl}
                  isPlaying={musicData.playing}></Control>
              </section>
              <section className="player-right">
                {
                  musicInfo.lrc?.match(/\](\S)\[/g) ? (
                    <LrcWord
                      setCurrentLrc={setCurrentLrc}
                      color={musicColor}
                      lrc={musicInfo.lrc || ''}
                      currentInfo={musicInfo || null}
                      currentTime={musicData.currentTime}
                      isPlaying={musicData.playing}></LrcWord>
                    )
                 : (
                  <Lrc
                    setCurrentLrc={setCurrentLrc}
                    color={musicColor}
                    lrc={musicInfo.lrc || ''}
                    currentInfo={musicInfo || null}
                    currentTime={musicData.currentTime}
                    isPlaying={musicData.playing}></Lrc>
                 )
                }
              </section>
            </section> : ''
        }
      </section>
      {/* <section className="music-log">
         <p>歌曲播放状态 {musicData.playing ? '播放中' : '没有播放'}</p>
          <p>歌曲总时长 {formatTime(musicData.duration)}</p>
          <p>歌曲当前时间 {formatTime(musicData.currentTime)}</p>
      </section> */}
      {/* 这里是歌曲控制台的 */}
    </section>
  );
}

export default Player
