import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import './index.scss'
// import Upload from '../Upload'
import { Howl } from 'howler'
import { InterfaceMusicInfo } from '../../Interface/music';
import Lrc from '../Lrc';
import Control from '../Control';
import LrcWord from '../Lrc/Lrc-word';
import FastAverageColor from 'fast-average-color';
import { setLightness, setSaturation } from 'polished';
import { initData, reducer } from '../../Mobx/music-reducer';
import { getMusicInfoFromLocal } from '../../utils/local';

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
      }, 100)
      
    }
    dispatchMusic({
      type: 'change',
      data: {
        change: key
      }
    })
  }

  const getInfoFormLocal = async () => {
    return new Promise(async (resolve, reject) => {
      const res = await getMusicInfoFromLocal('02.七里香-99.42046244504539-1611753236468')
      if (res) {
        resolve(res)
      } else {
        reject('获取失败')
      }
    })
  }

  // 歌曲正在播放哦
  const musicPlaying = useCallback(() => {
    if (refChange.current) return
    if (musicPlayer) {
      if (musicPlayer.playing()) {
        dispatchMusic({
          type: 'update',
          data: {
            duration: musicPlayer.duration(),
            playing: musicPlayer.playing(),
            currentTime: musicPlayer.seek()
          }
        })
        requestAnimationFrame(musicPlaying)
      }
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
        }, 300)
      } else {
        musicPlayer.pause()
        dispatchMusic({
          type: 'update',
          data: {
            playing: false,
          }
        })
      }
    }
  }, [musicPlayer, musicPlaying])

  const getMusicInfo = useCallback(async () => {
    const info: InterfaceMusicInfo = await getInfoFormLocal() as InterfaceMusicInfo
    if (!info) return
    setMusicInfo(info)
    fac.getColorAsync(info.picture[0])
    .then(color => {
        setMusicColor(
          setSaturation(.8, setLightness(.5, color.rgba))
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
      handelPlay()
    }
  }, [handelPlay])

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
          // src: 'https://jay-music1.oss-cn-beijing.aliyuncs.com/01.%E7%88%B1%E5%9C%A8%E8%A5%BF%E5%85%83%E5%89%8D.flac?Expires=1611355123&OSSAccessKeyId=TMP.3KgLmqPNAzpF5wPEETMh2Dq86Wcz5FyeAHsHEtGksuQw9c7y5jm7LQWDLJ2Vv1cbwnpfTdrM8S4K19VLMAmCX51Cp1tbeD&Signature=zSC5jpvQqvd1BCBjjXGwUMT0g%2Bw%3D',
          // src: 'http://qna13isfq.hn-bkt.clouddn.com/07.%E7%88%B7%E7%88%B7%E6%B3%A1%E7%9A%84%E8%8C%B6.flac',
          html5: true,
          format: [musicInfo.codec.toLowerCase()],
          volume: .5
        })
      )
    }
    return () => {
      if (musicPlayer) {
        console.log('created destroy')
        musicPlayer.stop()
        setMusicPlayer(null)
      }
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
      {/* <Upload></Upload> */}
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
    </section>
  );
}

export default Player
