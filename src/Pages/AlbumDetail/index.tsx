import React, { useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from 'antd'
import { CaretRightFilled, LeftOutlined, RetweetOutlined } from '@ant-design/icons'
import common from '../../store/common'
import { InterfaceMusicInfo } from '../../Interface/music'
import { formatTime } from '../../utils'
import './index.scss'

const fallbackCover = '/images/music-no.jpeg'

const getCover = (music?: InterfaceMusicInfo | null) => {
  return music?.picture?.[0] || music?.pictureUrl || fallbackCover
}

const AlbumDetailPage = observer(() => {
  const { albumName: rawAlbumName } = useParams()
  const navigate = useNavigate()

  const albumName = useMemo(() => {
    try {
      return decodeURIComponent(rawAlbumName || '')
    } catch {
      return rawAlbumName || ''
    }
  }, [rawAlbumName])

  const songs = (common.localAlbumMap.get(albumName) || []).slice()
  const head = songs[0] || null
  const cover = getCover(head)

  const handlePlay = (target?: InterfaceMusicInfo) => {
    const ids = songs.map(item => item.id || '').filter(Boolean)
    common.setQueueFromScope(ids)
    const id = target?.id || songs[0]?.id
    if (id) {
      common.selectMusic(id)
    }
  }

  const handleShuffle = () => {
    if (songs.length <= 1) {
      handlePlay()
      return
    }
    const shuffled = [...songs]
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = shuffled[i]
      shuffled[i] = shuffled[j]
      shuffled[j] = tmp
    }
    const ids = shuffled.map(item => item.id || '').filter(Boolean)
    common.setQueueFromScope(ids)
    if (ids[0]) {
      common.selectMusic(ids[0])
    }
  }

  if (!albumName || songs.length === 0) {
    return (
      <section className="page-album-detail">
        <section className="album-empty">
          <p>未找到该专辑</p>
          <Button onClick={() => navigate('/albums')}>返回专辑列表</Button>
        </section>
      </section>
    )
  }

  return (
    <section className="page-album-detail">
      <section className="album-header">
        <button className="album-back" onClick={() => navigate('/albums')}>
          <LeftOutlined />
          <span>专辑</span>
        </button>
        <section className="album-hero">
          <img
            className="album-hero-cover"
            src={cover}
            alt=""
            onError={(evt) => {
              evt.currentTarget.src = fallbackCover
            }}
          />
          <section className="album-hero-copy">
            <span className="album-kicker">ALBUM</span>
            <p className="album-title">{albumName || '未命名专辑'}</p>
            <p className="album-meta">{head?.artist || '未知歌手'} · {songs.length} 首</p>
            <section className="album-actions">
              <Button type="primary" icon={<CaretRightFilled />} onClick={() => handlePlay()}>
                播放
              </Button>
              <Button icon={<RetweetOutlined />} onClick={handleShuffle}>
                随机播放
              </Button>
            </section>
          </section>
        </section>
      </section>

      <section className="album-tracks">
        {songs.map((song, index) => (
          <button
            key={song.id || `${song.fileName}-${index}`}
            className={`track-row ${song.id === common.musicData.id ? 'is-active' : ''}`}
            onClick={() => handlePlay(song)}
          >
            <span className="track-index">{String(index + 1).padStart(2, '0')}</span>
            <section className="track-main">
              <span className="track-title">{song.name || '未命名歌曲'}</span>
              <span className="track-meta">{song.artist || '未知歌手'}</span>
            </section>
            <span className="track-duration">{formatTime(Number(song.duration || 0)) || '--:--'}</span>
          </button>
        ))}
      </section>
    </section>
  )
})

export default AlbumDetailPage

