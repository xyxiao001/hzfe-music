import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './index.scss'
// import Upload from '../Upload'
import { InterfaceMusicInfo } from '../../Interface/music';
import Lrc from '../Lrc';
import Control from '../Control';
import LrcWord from '../Lrc/Lrc-word';
import PlayingIcon from '../Playing-icon';
import LyricsManager from '../LyricsManager';
import MarqueeText from '../MarqueeText';
import { FastAverageColor, type FastAverageColorResult } from 'fast-average-color';
import { rgba, setLightness, setSaturation } from 'polished';
import { CaretRightOutlined, DownOutlined, SoundOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import { observer } from "mobx-react-lite"
import common from '../../store/common';
import MusicMetaEditor from '../MusicMetaEditor';
import { formatTime } from '../../utils';

const fac = new FastAverageColor();
const fallbackCover = '/images/music-no.jpeg'
const fallbackAccent = '#ff375f'
const loadColorImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const image = new Image()
  image.onload = () => {
    if (image.naturalWidth > 0 && image.naturalHeight > 0) {
      resolve(image)
      return
    }
    reject(new Error(`Invalid image size: ${image.naturalWidth}x${image.naturalHeight}`))
  }
  image.onerror = () => reject(new Error(`Image load failed: ${src}`))
  image.src = src
})
const getSafeAccentColor = (color: string, lightness: number, saturation: number) => {
  try {
    return setSaturation(saturation, setLightness(lightness, color || fallbackAccent))
  } catch (error: unknown) {
    return fallbackAccent
  }
}

const Player = observer(() => {

  // const [musicPlayer, setMusicPlayer] = useState<Howl | null>(null)
  const musicPlayer = common.musicPlayer

  const musicInfo = common.musicInfo

  // 当前的状态, 用来做歌曲时间，还是当前拖动时间的判定
  const musicData = common.musicData

  const [currentLrc, setCurrentLrc] = useState('')
  const [queueVisible, setQueueVisible] = useState(false)

  const refChange = useRef(false)
  const musicInfoRequestRef = useRef(0)

  // 主题色
  const musicColor = common.musicColor
  const coverCandidates = useMemo(() => {
    return Array.from(new Set([
      musicInfo?.picture?.[0],
      musicInfo?.pictureUrl,
      fallbackCover
    ].filter(Boolean) as string[]))
  }, [musicInfo?.picture, musicInfo?.pictureUrl])
  const [coverIndex, setCoverIndex] = useState(0)
  const displayCoverSrc = coverCandidates[coverIndex] || fallbackCover
  const artworkSrc = displayCoverSrc
  const hasLrc = Boolean(musicInfo?.lrc)
  const currentIndex = common.musicPlayList.findIndex(item => item.id === musicData.id)
  const queueItems = currentIndex >= 0
    ? [
        ...common.musicPlayList.slice(currentIndex),
        ...common.musicPlayList.slice(0, currentIndex)
      ].filter(Boolean)
    : common.musicPlayList
  const nowPlayingItem = queueItems.find(item => item.id === musicData.id) || musicInfo || null
  const upcomingQueueItems = queueItems.filter(item => item.id !== musicData.id)
  const queueTotalDuration = queueItems.reduce((total, item) => total + Number(item.duration || 0), 0)

  useEffect(() => {
    setCoverIndex(0)
  }, [coverCandidates])

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
    const requestId = musicInfoRequestRef.current + 1
    musicInfoRequestRef.current = requestId
    const info: InterfaceMusicInfo | null = await common.loadMusicInfo(musicData.id)
    if (!info) return
    if (musicInfoRequestRef.current !== requestId || common.musicData.id !== info.id) {
      return
    }
    const colorSource = info.pictureUrl || info.picture?.[0] || fallbackCover
    try {
      const image = await loadColorImage(colorSource)
      if (musicInfoRequestRef.current !== requestId || common.musicData.id !== info.id) {
        return
      }
      const color: FastAverageColorResult = fac.getColor(image)
      common.updateMusicColor(getSafeAccentColor(color.rgba, .5, .8))
    } catch (error: unknown) {
      if (musicInfoRequestRef.current !== requestId || common.musicData.id !== info.id) {
        return
      }
      common.updateMusicColor(
        fallbackAccent
      )
    }
  }, [musicData.id])

  const handleLyricSeek = useCallback((time: number) => {
    if (!musicPlayer) return
    musicPlayer.seek(time)
    common.updatedMusicData({
      currentTime: time,
      change: true
    })
    if (musicInfo?.lrc) {
      setCurrentLrc('')
    }
  }, [musicInfo?.lrc, musicPlayer])

  const handleCoverError = () => {
    setCoverIndex((prev) => {
      if (prev >= coverCandidates.length - 1) return prev
      return prev + 1
    })
  }

  // 绑定键盘事件
  const keyDown = useCallback((event: any) => {
    const keyCode = event.keyCode as number
    if (keyCode === 32) {
      event.preventDefault()
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
    getMusicInfo()
  }, [getMusicInfo])

  useEffect(() => {
    setCurrentLrc('')
  }, [musicData.id])

  useEffect(() => {
    if (musicInfo && !musicPlayer) {
      setCurrentLrc('')
      common.createdPlayer()
    }
  }, [musicInfo, musicPlayer])

  useEffect(() => {
    return () => {
      if (common.musicPlayer) {
        common.updatedMusicData({
          playing: false
        })
        common.destroyPlayer()
      }
    }
  }, [])

  useEffect(() => {
    refChange.current = musicData.change
  }, [musicData.change])

  useEffect(() => {
    // 绑定enter 事件
    window.addEventListener('keydown', keyDown)
    return () => {
      window.removeEventListener('keydown', keyDown)
    }
  }, [keyDown])

  useEffect(() => {
    const handleBeforeUnload = () => {
      common.persistLastMusicState()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  useEffect(() => {
    const lyricSeed = currentLrc
      ? Array.from(currentLrc).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 11
      : 5
    const lightness = Math.max(.46, Math.min(.68, .54 + Math.sin(musicData.currentTime * 0.85 + lyricSeed) * .08))
    const accent = getSafeAccentColor(musicColor, lightness, .96)
    document.documentElement.style.setProperty('--lyric-accent', accent)
    document.documentElement.style.setProperty('--lyric-accent-soft', rgba(accent, .2))
  }, [currentLrc, musicColor, musicData.currentTime])


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
                      <img src={displayCoverSrc} alt="" onError={handleCoverError} />
                    </section>
                    <section className="player-info">
                      <MarqueeText className="music-name" text={musicInfo.name} />
                      <MarqueeText className="music-artist" text={`${musicInfo.artist || '未知歌手'} - ${musicInfo.album || '未命名专辑'}`} />
                      <section className={`music-current-lrc ${musicData.playing ? 'is-playing' : ''}`}>
                        {musicData.playing ? <PlayingIcon className="compact" /> : null}
                        <p>{currentLrc || (hasLrc ? '歌词加载中…' : '暂无歌词')}</p>
                      </section>
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
        <section className={`player-max ${musicData.min ? 'player-max-min' : ''}`}>
          <section className="status-control" onClick={handelChangeSize}>
            <DownOutlined />
          </section>
          <section className="player-bg" style={{ "backgroundImage": `url(${artworkSrc})` }}></section>
          <section className="player-fade"></section>
          <section className="player-layout">
            {
              musicInfo ?
                <section className="player-box">

                  <section className="player-left">
                    <section className="player-line">
                      <img src={displayCoverSrc} alt="" onError={handleCoverError} />
                    </section>
                    <section className="player-line">
                      <section className="player-info">
                        <MarqueeText className="music-name" text={musicInfo.name} />
                        <MarqueeText className="music-artist" text={`${musicInfo.artist || '未知歌手'} - ${musicInfo.album || '未命名专辑'}`} />
                        <section className={`music-current-lrc hero-lrc ${musicData.playing ? 'is-playing' : ''}`}>
                          {musicData.playing ? <PlayingIcon className="compact" /> : null}
                          <p
                            dangerouslySetInnerHTML={{
                              __html: currentLrc || (hasLrc ? '歌词加载中…' : '暂无歌词')
                            }}
                          ></p>
                        </section>
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
                    <section className="player-side-toolbar">
                      <button className="player-tool-button" onClick={() => setQueueVisible(true)}>
                        <UnorderedListOutlined />
                        <span>播放队列</span>
                      </button>
                      <LyricsManager currentMusic={musicInfo || null} />
                      <MusicMetaEditor music={musicInfo || null} triggerLabel="歌曲详情" />
                    </section>
                  </section>
                  <section className="player-right">
                    <section className="lyrics-panel">
                      {!hasLrc && <section className="lyrics-header">
                         <p className="lyrics-subtitle">{ '歌曲暂未关联歌词'}</p>
                      </section>}
                      <section className="lyrics-body">
                        {
                          hasLrc ? (
                            musicInfo.lrc?.match(/\](\S)\[/g) ? (
                              <LrcWord
                                setCurrentLrc={setCurrentLrc}
                                color={musicColor}
                                lrc={musicInfo.lrc || ''}
                                currentInfo={musicInfo || null}
                                currentTime={musicData.currentTime}
                                isPlaying={musicData.playing}
                                onSeekTo={handleLyricSeek}></LrcWord>
                            )
                              : (
                                <Lrc
                                  setCurrentLrc={setCurrentLrc}
                                  color={musicColor}
                                  lrc={musicInfo.lrc || ''}
                                  currentInfo={musicInfo || null}
                                  currentTime={musicData.currentTime}
                                  isPlaying={musicData.playing}
                                  onSeekTo={handleLyricSeek}></Lrc>
                              )
                          ) : (
                            <section className="lyrics-empty">
                              <p>暂无歌词</p>
                              <span>你可以在资料库中上传歌词文件，或使用自动关联功能为当前歌曲匹配歌词。</span>
                            </section>
                          )
                        }
                      </section>
                    </section>
                  </section>
                </section> : ''
            }
          </section>
        </section>
      }
      <Modal
        title={null}
        open={queueVisible}
        onCancel={() => setQueueVisible(false)}
        footer={null}
        width={640}
        className="player-queue-dialog"
      >
        <section className="player-queue-modal">
          <section className="player-queue-head">
            <section className="player-queue-copy">
              <span className="player-queue-eyebrow">Up Next</span>
              <p className="player-queue-title">播放队列</p>
              <span className="player-queue-subtitle">参考 Apple 列表层次重新整理，优先展示当前播放与接下来要听的内容</span>
            </section>
            <section className="player-queue-stats">
              <section className="player-queue-badge">
                <SoundOutlined />
                <span>{queueItems.length} 首</span>
              </section>
              <section className="player-queue-badge">
                <span>{formatTime(queueTotalDuration || 0)}</span>
              </section>
            </section>
          </section>
          {nowPlayingItem ? (
            <section className="player-queue-section">
              <section className="player-queue-section-head">
                <span>正在播放</span>
                <span>{musicData.playing ? '播放中' : '已暂停'}</span>
              </section>
              <button
                className="player-queue-now"
                onClick={() => {
                  if (nowPlayingItem.id) {
                    common.selectMusic(nowPlayingItem.id)
                  }
                  setQueueVisible(false)
                }}
              >
                <img
                  className="player-queue-cover"
                  src={nowPlayingItem.picture?.[0] || nowPlayingItem.pictureUrl || fallbackCover}
                  alt=""
                  onError={(event) => {
                    event.currentTarget.src = fallbackCover
                  }}
                />
                <section className="player-queue-now-main">
                  <section className="player-queue-now-topline">
                    <span className="player-queue-now-kicker">正在播放</span>
                    <span className="player-queue-now-duration">{formatTime(nowPlayingItem.duration || musicData.duration || 0)}</span>
                  </section>
                  <MarqueeText className="player-queue-now-name" text={nowPlayingItem.name} />
                  <MarqueeText className="player-queue-now-meta" text={`${nowPlayingItem.artist || '未知歌手'} · ${nowPlayingItem.album || '未命名专辑'}`} />
                </section>
                <span className="player-queue-now-action">
                  <CaretRightOutlined />
                </span>
              </button>
            </section>
          ) : null}
          {upcomingQueueItems.length ? (
            <section className="player-queue-section">
              <section className="player-queue-section-head">
                <span>接下来播放</span>
                <span>{upcomingQueueItems.length} 首</span>
              </section>
              <section className="player-queue-list">
                {upcomingQueueItems.map((item, index) => (
                  <button
                    key={item.id}
                    className="queue-item"
                    onClick={() => {
                      common.selectMusic(item.id || '')
                      setQueueVisible(false)
                    }}
                  >
                    <span className="queue-item-index">{String(index + 1).padStart(2, '0')}</span>
                    <img
                      className="queue-item-cover"
                      src={item.picture?.[0] || item.pictureUrl || fallbackCover}
                      alt=""
                      onError={(event) => {
                        event.currentTarget.src = fallbackCover
                      }}
                    />
                    <section className="queue-item-main">
                      <span className="queue-item-kicker">{index === 0 ? '下一首' : '稍后播放'}</span>
                      <MarqueeText className="queue-item-name" text={item.name} />
                      <MarqueeText className="queue-item-meta" text={`${item.artist || '未知歌手'} · ${item.album || '未命名专辑'}`} />
                    </section>
                    <section className="queue-item-side">
                      <span className="queue-item-duration">{formatTime(item.duration || 0)}</span>
                      <span className="queue-item-action">
                        <CaretRightOutlined />
                      </span>
                    </section>
                  </button>
                ))}
              </section>
            </section>
          ) : (
            <section className="player-queue-empty">
              <p>队列里还没有下一首</p>
              <span>从歌曲列表重新选择音乐后，这里会按当前顺序展示后续播放内容。</span>
            </section>
          )}
        </section>
      </Modal>
    </section>
  );
})

export default Player
