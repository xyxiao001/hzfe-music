import { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router-dom'
import { Button } from 'antd'
import { CaretRightFilled, RightOutlined } from '@ant-design/icons'
import common from '../../store/common'
import { InterfaceMusicInfo } from '../../Interface/music'
import { formatTime } from '../../utils'
import { formatDateKey, getDailyStats, getTopMusicStats, type DailyStats, type MusicStats } from '../../utils/stats'
import { getTodayRecommendations, type RecommendedAlbum } from '../../utils/recommend'
import './index.scss'

const fallbackCover = '/images/music-no.jpeg'

const getCover = (music?: InterfaceMusicInfo | null) => {
  return music?.picture?.[0] || music?.pictureUrl || fallbackCover
}

const formatDurationMs = (ms: number) => {
  const totalSec = Math.floor(Math.max(0, ms) / 1000)
  const hours = Math.floor(totalSec / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m`
  return `${Math.floor(totalSec)}s`
}

const LibraryPage = observer(() => {
  const navigate = useNavigate()
  const list = common.localMusicList
  const [today, setToday] = useState<DailyStats | null>(null)
  const [topSongs, setTopSongs] = useState<MusicStats[]>([])
  const [recommendedSongs, setRecommendedSongs] = useState<InterfaceMusicInfo[]>([])
  const [recommendedAlbums, setRecommendedAlbums] = useState<RecommendedAlbum[]>([])

  // Heavy computation (localforage reads): recompute only when library changes or date changes.
  useEffect(() => {
    let cancelled = false
    const refreshRecs = async () => {
      const dateKey = formatDateKey(Date.now())
      const rec = await getTodayRecommendations({
        songs: list,
        albumMap: common.localAlbumMap,
        dateKey,
        takeSongs: 20,
        takeAlbums: 10
      })
      if (cancelled) return
      setRecommendedSongs(rec.songs)
      setRecommendedAlbums(rec.albums)
    }
    refreshRecs()
    return () => {
      cancelled = true
    }
  }, [common.localAlbumMap.size, list.length])

  const current = common.musicInfo
  const hasNowPlaying = Boolean(common.musicData.id)

  useEffect(() => {
    let cancelled = false
    const refresh = async () => {
      const dateKey = formatDateKey(Date.now())
      const [daily, top] = await Promise.all([
        getDailyStats(dateKey),
        getTopMusicStats(6, 'playMs')
      ])
      if (cancelled) return
      setToday(daily)
      setTopSongs(top)
    }
    refresh()
    const timer = window.setInterval(refresh, 10000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [])

  const handlePlaySong = (song: InterfaceMusicInfo) => {
    const ids = list.map(info => info.id || '').filter(Boolean)
    common.setQueueFromScope(ids)
    if (song.id && song.id !== common.musicData.id) {
      common.selectMusic(song.id)
    } else {
      common.musicPlayer?.play()
    }
  }

  return (
    <section className="page-library">
      <section className="library-hero">
        <section className="hero-card hero-now">
          <section className="hero-now-main">
            <span className="hero-kicker">{hasNowPlaying ? '继续播放' : '开始播放'}</span>
            <p className="hero-title">{hasNowPlaying ? (current?.name || '正在播放') : '从资料库开始听音乐'}</p>
            <p className="hero-subtitle">
              {hasNowPlaying
                ? `${current?.artist || '未知歌手'} · ${current?.album || '未命名专辑'}`
                : '导入歌曲后，会在这里显示当前播放与最近添加内容。'}
            </p>
            <section className="hero-actions">
              <Button
                type="primary"
                disabled={!hasNowPlaying}
                onClick={() => {
                  if (!hasNowPlaying) return
                  common.updatedMusicData({ min: false })
                  navigate('/now-playing')
                }}
              >
                打开沉浸式播放
              </Button>
              <Button onClick={() => navigate('/import')}>上传/导入</Button>
            </section>
          </section>
          <section className="hero-now-art">
            <img src={getCover(current)} alt="" onError={(evt) => { evt.currentTarget.src = fallbackCover }} />
          </section>
        </section>

        <section className="hero-card hero-stats">
          <section className="hero-stat hero-stat-wide">
            <section className="stat-block">
              <span className="stat-kicker">今日播放</span>
              <span className="stat-value">{formatDurationMs(today?.playMs || 0)}</span>
              <span className="stat-label">{today?.playCount || 0} 次播放 · {today?.uniqueSongs || 0} 首歌</span>
            </section>
          </section>
          <section className="hero-stat">
            <span className="stat-value">{common.localAlbumMap.size}</span>
            <span className="stat-label">专辑</span>
          </section>
          <section className="hero-stat">
            <span className="stat-value">{common.localMusicList.length}</span>
            <span className="stat-label">歌曲</span>
          </section>
          <section className="hero-stat">
            <span className="stat-value">{common.localMusicLrcList.length}</span>
            <span className="stat-label">歌词</span>
          </section>

          {topSongs.length ? (
            <section className="hero-top-songs">
              <p className="top-songs-title">常听歌曲</p>
              {topSongs.slice(0, 4).map(item => {
                const song = list.find(m => m.id === item.musicId) || null
                return (
                  <button
                    key={item.musicId}
                    className="top-song-row"
                    onClick={() => {
                      if (!song) return
                      handlePlaySong(song)
                    }}
                    disabled={!song}
                    title={song?.name || item.musicId}
                  >
                    <img src={getCover(song)} alt="" onError={(evt) => { evt.currentTarget.src = fallbackCover }} />
                    <section className="top-song-main">
                      <span className="top-song-name">{song?.name || '未知歌曲'}</span>
                      <span className="top-song-meta">{song?.artist || '未知歌手'} · {formatDurationMs(item.totalPlayMs)}</span>
                    </section>
                    <span className="top-song-count">{item.playCount}</span>
                  </button>
                )
              })}
            </section>
          ) : null}

          <section className="hero-shortcuts">
            <button className="shortcut" onClick={() => navigate('/albums')}>
              <span>查看专辑</span>
              <RightOutlined />
            </button>
            <button className="shortcut" onClick={() => navigate('/songs')}>
              <span>查看歌曲</span>
              <RightOutlined />
            </button>
            <button className="shortcut" onClick={() => navigate('/lyrics')}>
              <span>管理歌词</span>
              <RightOutlined />
            </button>
          </section>
        </section>
      </section>

      <section className="library-section">
        <section className="section-head">
          <p className="section-title">今日推荐 · 专辑</p>
          <button className="section-link" onClick={() => navigate('/albums')}>
            全部 <RightOutlined />
          </button>
        </section>
        {recommendedAlbums.length ? (
          <section className="album-rail" role="list">
            {recommendedAlbums.map(entry => {
              return (
                <button
                  key={entry.albumName}
                  className="album-rail-item"
                  onClick={() => navigate(`/albums/${encodeURIComponent(entry.albumName)}`)}
                  role="listitem"
                >
                  <img src={entry.cover} alt="" onError={(evt) => { evt.currentTarget.src = fallbackCover }} />
                  <span className="album-name">{entry.albumName || '未命名专辑'}</span>
                  <span className="album-meta">{entry.artist || '未知歌手'} · {entry.songs.length} 首</span>
                </button>
              )
            })}
          </section>
        ) : (
          <section className="empty-block">
            <p>还没有专辑</p>
            <span>先去导入一些歌曲，专辑会按元数据自动归类。</span>
          </section>
        )}
      </section>

      <section className="library-section">
        <section className="section-head">
          <p className="section-title">今日推荐 · 歌曲</p>
          <button className="section-link" onClick={() => navigate('/songs')}>
            全部 <RightOutlined />
          </button>
        </section>
        {recommendedSongs.length ? (
          <section className="song-rail">
            {recommendedSongs.map(song => (
              <button
                key={song.id || song.fileName}
                className={`song-item ${song.id === common.musicData.id ? 'is-active' : ''}`}
                onClick={() => handlePlaySong(song)}
              >
                <img src={getCover(song)} alt="" onError={(evt) => { evt.currentTarget.src = fallbackCover }} />
                <section className="song-main">
                  <span className="song-title">{song.name || '未命名歌曲'}</span>
                  <span className="song-meta">{song.artist || '未知歌手'} · {song.album || '未命名专辑'}</span>
                </section>
                <section className="song-side">
                  <span className="song-duration">{formatTime(Number(song.duration || 0)) || '--:--'}</span>
                  <span className="song-action"><CaretRightFilled /></span>
                </section>
              </button>
            ))}
          </section>
        ) : (
          <section className="empty-block">
            <p>还没有歌曲</p>
            <span>进入“导入”上传本地音频或通过链接导入。</span>
          </section>
        )}
      </section>
    </section>
  )
})

export default LibraryPage
