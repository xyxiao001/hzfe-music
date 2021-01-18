import React, { useCallback, useEffect, useState } from 'react';
import './index.scss'
import Upload from '../Upload'
import localforage from 'localforage';
import { Howl } from 'howler'
import { InterfaceMusicInfo, InterfaceMusicPlayingInfo } from '../../Interface/music';
import Lrc from '../Lrc';
import { formatTime } from '../../utils';


const Player = () => {

  const [musicPlayer, setMusicPlayer] = useState<Howl | null>(null)

  const [musicInfo, setMusicInfo] = useState<InterfaceMusicInfo | null>(null)

  // 当前歌曲播放信息
  const [musicPlayingInfo, setMusicPlayingInfo] = useState<InterfaceMusicPlayingInfo>({
    playing: false,
    duration: 0,
    currentTime: 0
  })

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
    if (musicPlayer) {
      const time = musicPlayer.seek() as number
      setMusicPlayingInfo({
        ...musicPlayingInfo,
        duration: musicPlayer.duration(),
        playing: musicPlayer.playing(),
        currentTime: time
      })
      if (musicPlayer.playing()) {
        requestAnimationFrame(musicPlaying)
      }
    }
  }, [musicPlayer, musicPlayingInfo])

  // 歌曲暂停事件
  const handlePause = useCallback(() => {
    if (musicPlayer) {
      musicPlayer.pause()
    }
  }, [musicPlayer])

  // 歌曲停止事件
  const handleStop = useCallback(() => {
    if (musicPlayer) {
      musicPlayer.stop()
    }
  }, [musicPlayer])

  // 歌曲加载成功事件
  // const handleLoad = useCallback(() => {
  //   console.log('歌曲加载成功')
  //   if (musicPlayer) {
  //     setMusicPlayingInfo({
  //       ...musicPlayingInfo,
  //       duration: musicPlayer.duration()
  //     })
  //   }
  // }, [musicPlayer, musicPlayingInfo])


  // 歌曲播放事件
  const handelPlay = useCallback(() => {
    console.log('触发歌曲播放事件')
    if (musicPlayer) {
      if (!musicPlayer.playing()) {
        musicPlayer.play()
        requestAnimationFrame(musicPlaying)
      }
    }
  }, [musicPlayer, musicPlaying])

  const getMusicInfo = useCallback(async () => {
    const info: InterfaceMusicInfo = await getInfoFormLocal() as InterfaceMusicInfo
    setMusicInfo(info)
  }, [])

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
          format: [musicInfo.codec.toLowerCase()],
          // autoplay: false
        })
      )
    }
  }, [musicInfo, musicPlayer])




  return (
    <section className="player">
      <Upload></Upload>
      <button onClick={handelPlay}>播放</button>
      <button onClick={handlePause}>暂停</button>
      <button onClick={handleStop}>停止</button>
      {/* 这里去渲染歌曲信息 */}
      <section className="player-layout">
        {
          musicInfo ?
            <section className="player-box">

              <section className="player-img">
                <img src={musicInfo.picture[0]} alt="" />
              </section>
              <section className="player-right">
                <section className="player-info">
                  <p className="music-name">{musicInfo.name}</p>
                  <p className="music-artist">歌手: {musicInfo.artist}</p>
                  <p className="music-album">专辑: {musicInfo.album}</p>
                  <p></p>
                </section>
                <Lrc lrc={musicInfo.lrc || ''} currentInfo={musicInfo || null} currentTime={musicPlayingInfo.currentTime}></Lrc>
              </section>
            </section> : ''
        }
      </section>
      {/* 这里是歌曲控制台的 */}
      <section className="play-control">
        <p>歌曲播放状态 {musicPlayingInfo.playing ? '播放中' : '没有播放'}</p>
        <p>歌曲总时长 {formatTime(musicPlayingInfo.duration)}</p>
        <p>歌曲当前时间 {formatTime(musicPlayingInfo.currentTime)}</p>
      </section>
    </section>
  );
}

export default Player
