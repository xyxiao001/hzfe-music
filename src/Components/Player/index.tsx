import React, { useCallback, useEffect, useState } from 'react';
import './index.scss'
import Upload from '../Upload'
import localforage from 'localforage';
import {Howl} from 'howler'
import { InterfaceMusicInfo } from '../../Interface/music';

// localforage.getItem('music').then(value => {
//   console.log(value)
// })


// localforage.getItem('musicData').then(value => {
//   console.log(value)
//   const url = URL.createObjectURL(value)
//   // const audio = new Audio()
//   // audio.controls = true
//   // audio.src = url
//   // audio.autoplay = true
//   // document.body.appendChild(audio)
//   // URL.revokeObjectURL()
//   const sound = new Howl({
//     src: url,
//     format: ['flac']
//   })
//   sound.play()
//   Howler.volume(1)
//   console.log(sound)
// })

// localforage.getItem('musicLrc').then(value => {
//   console.log(value)
// })


const Player = () => {

  const [musicPlayer, setMusicPlayer] = useState<Howl | null>(null)

  const [musicInfo, setMusicInfo] = useState<InterfaceMusicInfo | null>(null)

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

  const getMusicInfo = useCallback(async () => {
    const info: InterfaceMusicInfo = await getInfoFormLocal() as InterfaceMusicInfo
    setMusicInfo(info)
  }, [])

  useEffect(() => {
    getMusicInfo()
  }, [getMusicInfo])

  const handelPlay = () => {
    if (!musicInfo) {
      return
    }
    if (musicPlayer) {
      if (!musicPlayer.playing()) {
        musicPlayer.play()
      }
    } else {
      setMusicPlayer(
        new Howl({
          src: URL.createObjectURL(musicInfo.music),
          format: [musicInfo.codec.toLowerCase()]
        })
      )
    }
  }

  const handelStop = () => {
    if (musicPlayer) {
      musicPlayer.pause()
    }
  }

  useEffect(() => {
    if (musicPlayer) {
      musicPlayer.play()
    }
  }, [musicPlayer])
  

  return (
    <section className="player">
      <Upload></Upload>
      <button onClick={handelPlay}>播放</button>
      <button onClick={handelStop}>暂停</button>
      {/* 这里去渲染歌曲信息 */}
      <section className="player-layout">
        {
          musicInfo ? 
          <section className="player-box">
            
            <section className="player-img">
              <img src={musicInfo.picture[0]} alt=""/>
            </section>

          </section> : ''
        }
      </section>
    </section>
  );
}

export default Player
