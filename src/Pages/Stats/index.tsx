import { useEffect, useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Button } from 'antd'
import { BarChartOutlined, CaretRightFilled } from '@ant-design/icons'
import common from '../../store/common'
import { formatDateKey, getDailyStats, getMusicStatsIndex, getMusicStatsMap, type DailyStats, type MusicStats } from '../../utils/stats'
import type { InterfaceMusicInfo } from '../../Interface/music'
import './index.scss'

const fallbackCover = '/images/music-no.jpeg'

const formatDurationMs = (ms: number) => {
  const totalSec = Math.floor(Math.max(0, ms) / 1000)
  const hours = Math.floor(totalSec / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m`
  return `${Math.floor(totalSec)}s`
}

const getCover = (music?: InterfaceMusicInfo | null) => {
  return music?.picture?.[0] || music?.pictureUrl || fallbackCover
}

const StatsPage = observer(() => {
  const list = common.localMusicList
  const [days, setDays] = useState<DailyStats[]>([])
  const [topSongStats, setTopSongStats] = useState<MusicStats[]>([])
  const [loading, setLoading] = useState(false)

  const dailyTotalMs = useMemo(() => days.reduce((sum, item) => sum + Number(item.playMs || 0), 0), [days])
  const dailyTotalPlays = useMemo(() => days.reduce((sum, item) => sum + Number(item.playCount || 0), 0), [days])

  const dayMax = useMemo(() => {
    const max = days.reduce((m, item) => Math.max(m, Number(item.playMs || 0)), 0)
    return Math.max(1, max)
  }, [days])

  const topSongs = useMemo(() => {
    const idMap = new Map(list.map(item => [item.id, item] as const))
    return topSongStats.map(stat => ({
      stat,
      song: idMap.get(stat.musicId) || null
    }))
  }, [list, topSongStats])

  const topArtists = useMemo(() => {
    const map = new Map<string, number>()
    topSongs.forEach(item => {
      const artist = item.song?.artist || '未知歌手'
      map.set(artist, (map.get(artist) || 0) + Number(item.stat.totalPlayMs || 0))
    })
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6)
  }, [topSongs])

  const topAlbums = useMemo(() => {
    const map = new Map<string, { playMs: number, artist: string, cover: string }>()
    topSongs.forEach(item => {
      const albumName = item.song?.album || '未命名专辑'
      const artist = item.song?.artist || '未知歌手'
      const cover = getCover(item.song)
      const cur = map.get(albumName) || { playMs: 0, artist, cover }
      map.set(albumName, { playMs: cur.playMs + Number(item.stat.totalPlayMs || 0), artist: cur.artist, cover: cur.cover })
    })
    return Array.from(map.entries())
      .map(([albumName, payload]) => ({ albumName, ...payload }))
      .sort((a, b) => b.playMs - a.playMs)
      .slice(0, 6)
  }, [topSongs])

  useEffect(() => {
    let cancelled = false
    const refresh = async () => {
      setLoading(true)
      try {
        const now = Date.now()
        const dateKeys = Array.from({ length: 7 }).map((_, idx) => {
          const ts = now - (6 - idx) * 24 * 3600 * 1000
          return formatDateKey(ts)
        })
        const daily = await Promise.all(dateKeys.map(key => getDailyStats(key)))

        // For top lists, use the stats index (may contain songs not in current library).
        const index = await getMusicStatsIndex()
        const statsMap = await getMusicStatsMap(index)
        const statsList = Array.from(statsMap.values()).sort((a, b) => (b.totalPlayMs || 0) - (a.totalPlayMs || 0))
        const top = statsList.slice(0, 12)

        if (cancelled) return
        setDays(daily)
        setTopSongStats(top)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    refresh()
    const timer = window.setInterval(refresh, 15000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [list.length])

  const handlePlay = (song: InterfaceMusicInfo) => {
    if (!song.id) return
    // Prevent double-playing when clicking the currently playing song.
    if (song.id === common.musicData.id) {
      if (common.musicPlayer?.playing()) return
      common.musicPlayer?.play()
      return
    }
    const ids = list.map(info => info.id || '').filter(Boolean)
    common.setQueueFromScope(ids, song.id)
  }

  return (
    <section className="page-stats">
      <section className="stats-hero">
        <section className="stats-hero-card">
          <section className="hero-kicker">
            <BarChartOutlined />
            <span>最近 7 天</span>
          </section>
          <section className="hero-metrics">
            <section className="metric">
              <span className="metric-value">{formatDurationMs(dailyTotalMs)}</span>
              <span className="metric-label">播放时长</span>
            </section>
            <section className="metric">
              <span className="metric-value">{dailyTotalPlays}</span>
              <span className="metric-label">播放次数</span>
            </section>
          </section>
          <section className="hero-chart" aria-label="7 天播放时长">
            {days.map(item => (
              <section key={item.date} className="chart-col" title={`${item.date}: ${formatDurationMs(item.playMs)}`}>
                <span className="chart-bar" style={{ height: `${Math.round((item.playMs / dayMax) * 100)}%` }} />
                <span className="chart-label">{item.date.slice(5)}</span>
              </section>
            ))}
          </section>
        </section>

        <section className="stats-hero-card">
          <section className="section-head">
            <p className="section-title">Top Songs</p>
            <span className="section-subtitle">按累计播放时长</span>
          </section>
          <section className="top-list">
            {topSongs.slice(0, 6).map(item => (
              <button
                key={item.stat.musicId}
                className="top-row"
                onClick={() => {
                  if (!item.song) return
                  handlePlay(item.song)
                }}
                disabled={!item.song}
              >
                <img src={getCover(item.song)} alt="" onError={(evt) => { evt.currentTarget.src = fallbackCover }} />
                <section className="top-main">
                  <span className="top-title">{item.song?.name || '未知歌曲'}</span>
                  <span className="top-meta">{item.song?.artist || '未知歌手'} · {formatDurationMs(item.stat.totalPlayMs)}</span>
                </section>
                <span className="top-action"><CaretRightFilled /></span>
              </button>
            ))}
          </section>
          <Button className="stats-refresh" loading={loading} onClick={() => { void common.updateLocalMusicList(); void common.updateLocalMusicLrcList() }}>
            刷新资料库
          </Button>
        </section>
      </section>

      <section className="stats-grid">
        <section className="stats-card">
          <section className="section-head">
            <p className="section-title">Top Artists</p>
            <span className="section-subtitle">按播放时长聚合</span>
          </section>
          <section className="pill-list">
            {topArtists.map(([name, ms]) => (
              <section key={name} className="pill">
                <span className="pill-name">{name}</span>
                <span className="pill-value">{formatDurationMs(ms)}</span>
              </section>
            ))}
          </section>
        </section>

        <section className="stats-card">
          <section className="section-head">
            <p className="section-title">Top Albums</p>
            <span className="section-subtitle">按播放时长聚合</span>
          </section>
          <section className="album-list">
            {topAlbums.map(item => (
              <section key={item.albumName} className="album-row">
                <img src={item.cover} alt="" onError={(evt) => { evt.currentTarget.src = fallbackCover }} />
                <section className="album-main">
                  <span className="album-name">{item.albumName}</span>
                  <span className="album-meta">{item.artist} · {formatDurationMs(item.playMs)}</span>
                </section>
              </section>
            ))}
          </section>
        </section>
      </section>
    </section>
  )
})

export default StatsPage
