import React, { useCallback, useEffect, useRef, useState } from 'react';
import './index.scss'
// import Upload from '../Upload'
import { InterfaceMusicInfo } from '../../Interface/music';
import Lrc from '../Lrc';
import Control from '../Control';
import LrcWord from '../Lrc/Lrc-word';
import FastAverageColor from 'fast-average-color';
import { setLightness, setSaturation } from 'polished';
import { getMusicInfoFromLocal } from '../../utils/local';
import { DownOutlined } from '@ant-design/icons';
import { observer } from "mobx-react"
import common from '../../store/common';
import { animated, useTransition } from 'react-spring/web';

const fac = new FastAverageColor();

const Player = observer(() => {

  // const [musicPlayer, setMusicPlayer] = useState<Howl | null>(null)
  const musicPlayer = common.musicPlayer

  const musicInfo = common.musicInfo

  // 当前的状态, 用来做歌曲时间，还是当前拖动时间的判定
  const musicData = common.musicData

  const [currentLrc, setCurrentLrc] = useState('')

  const refChange = useRef(false)

  // 主题色
  const musicColor = common.musicColor

  const playerMaxTransitions = useTransition(!musicData.min, null, {
    from: { transform: 'translate3d(0, 100vh, 0)' },
    enter: { transform: 'translate3d(0, 0px, 0)' },
    leave: { transform: 'translate3d(0, 100vh, 0)' },
  })

  const handleChanging = (value: number) => {
    // 当前拖动时间的改变
    // 反推出当前时间
    const time = (musicInfo?.duration || 0) * value / 100
    common.updatedMusicData(
      {
        currentTime: time
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
    }
    common.updatedMusicData({
      change: key
    })
  }

  const getInfoFormLocal = useCallback(async () => {
    return new Promise(async (resolve, reject) => {
      const res = await getMusicInfoFromLocal(musicData.id)
      if (res) {
        resolve(res)
      } else {
        reject('歌曲信息获取失败')
      }
    })
  }, [musicData.id])

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
      } else {
        musicPlayer.pause()
      }
    }
  }, [musicPlayer])

  const getMusicInfo = useCallback(async () => {
    if (!musicData.id) return
    const info: InterfaceMusicInfo = await getInfoFormLocal() as InterfaceMusicInfo
    if (!info) return
    common.updatedMusicInfo(info)
    fac.getColorAsync(info.pictureUrl || '')
      .then(color => {
        common.updateMusicColor(
          setSaturation(.8, setLightness(.5, color.rgba))
        )
      })
      .catch(e => {
        common.updateMusicColor(
          '#1890ff'
        )
      });
  }, [getInfoFormLocal, musicData.id])

  // 绑定键盘事件
  const keyDown = useCallback((event: any) => {
    event.preventDefault()
    const keyCode = event.keyCode as number
    if (keyCode === 32) {
      handelPlay()
    }
  }, [handelPlay])

  // 修改播放器状态
  const handelChangeSize = () => {
    common.updatedMusicData({
      min: !musicData.min,
    })
  }

  useEffect(() => {
    console.log('useEffect-getMusicInfo')
    getMusicInfo()
  }, [getMusicInfo])


  useEffect(() => {
    console.log('useEffect-create')
    if (musicInfo && !musicPlayer) {
      setCurrentLrc('')
      console.log('创建音乐实例')
      common.createdPlayer()
    }
    return () => {
      if (musicPlayer) {
        console.log('created destroy')
        common.updatedMusicData({
          playing: false
        })
        common.destroyPlayer()
      }
    }
  }, [musicInfo, musicPlayer])

  useEffect(() => {
    console.log('music-change-key')
    refChange.current = musicData.change
  }, [musicData.change])

  useEffect(() => {
    // 绑定enter 事件
    window.addEventListener('keydown', keyDown)
    return () => {
      window.removeEventListener('keydown', keyDown)
    }
  }, [keyDown])


  return (
    <section className="player">
      {
        musicData.min ? (
          <section className="player-min">
            {
              musicInfo ? (
                <section className="player-layout">
                  <section className="layout-left">
                    <section className="music-img" onClick={handelChangeSize}>
                      <img src={musicInfo.pictureUrl ? musicInfo.pictureUrl : process.env.PUBLIC_URL + '/images/music-no.jpeg'} alt="" />
                    </section>
                    <section className="player-info">
                      <p className="music-name">{musicInfo.name}</p>
                      <p className="music-artist">{musicInfo.artist} - {musicInfo.album}</p>
                    </section>
                  </section>
                  <section className="music-progress">
                    <Control
                      handlePlay={handelPlay}
                      handlePause={handelPlay}
                      currentInfo={musicInfo || null}
                      musicPlayingInfo={musicData}
                      currentTime={musicData.currentTime}
                      handleChanging={handleChanging}
                      setChange={setChangeFromControl}
                      min={musicData.min}
                      isPlaying={musicData.playing}></Control>
                  </section>
                </section>
              ) : (
                  <section className="player-layout">
                    请选择歌曲进行播放
                  </section>
                )
            }
          </section>
        ) : ('')
      }
      {
        playerMaxTransitions.map(({ item, key, props }) =>
          item && <animated.section className="player-max" key={key} style={props}>
            <section className="status-control" onClick={handelChangeSize}>
              <DownOutlined />
            </section>
            <section className="player-bg" style={{ "backgroundImage": `url(${musicInfo?.pictureUrl || process.env.PUBLIC_URL + '/images/music-no.jpeg'})` }}></section>
            <section className="player-fade"></section>
            {/* <Upload></Upload> */}
            {/* 这里去渲染歌曲信息 */}
            <section className="player-layout">
              {
                musicInfo ?
                  <section className="player-box">

                    <section className="player-left">
                      <section className="player-line">
                        <img src={musicInfo.pictureUrl ? musicInfo.pictureUrl : process.env.PUBLIC_URL + '/images/music-no.jpeg'} alt="" />
                      </section>
                      <section className="player-line">
                        <section className="player-info">
                          <p className="music-name">{musicInfo.name}</p>
                          <p className="music-artist">{musicInfo.artist} - {musicInfo.album}</p>
                          <p className="music-current-lrc">{currentLrc}</p>
                        </section>
                      </section>
                      <Control
                        handlePlay={handelPlay}
                        handlePause={handelPlay}
                        currentInfo={musicInfo || null}
                        musicPlayingInfo={musicData}
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
          </animated.section>
        )
      }
    </section>
  );
})

export default Player
