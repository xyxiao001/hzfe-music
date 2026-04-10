import React, { useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router-dom'
import common from '../../store/common'
import { InterfaceMusicInfo } from '../../Interface/music'
import './index.scss'

const fallbackCover = '/images/music-no.jpeg'

const getCover = (music?: InterfaceMusicInfo | null) => {
  return music?.picture?.[0] || music?.pictureUrl || fallbackCover
}

const AlbumsPage = observer(() => {
  const navigate = useNavigate()
  const list = common.localMusicList

  const albums = useMemo(() => {
    const indexMap = new Map<string, number>()
    list.forEach((item, idx) => {
      if (!item.album) return
      indexMap.set(item.album, idx)
    })
    return Array.from(common.localAlbumMap.entries())
      .map(([albumName, songs]) => {
        const head = songs[0]
        return {
          albumName,
          songs,
          head,
          cover: getCover(head),
          lastIndex: indexMap.get(albumName) ?? -1
        }
      })
      .sort((a, b) => b.lastIndex - a.lastIndex)
  }, [common.localAlbumMap, list])

  return (
    <section className="page-albums">
      {albums.length ? (
        <section className="albums-grid">
          {albums.map(album => (
            <button
              key={album.albumName}
              className="album-card"
              onClick={() => navigate(`/albums/${encodeURIComponent(album.albumName)}`)}
            >
              <img
                className="album-cover"
                src={album.cover}
                alt=""
                onError={(evt) => {
                  evt.currentTarget.src = fallbackCover
                }}
              />
              <section className="album-copy">
                <p className="album-title">{album.albumName || '未命名专辑'}</p>
                <p className="album-meta">{album.head?.artist || '未知歌手'} · {album.songs.length} 首</p>
              </section>
            </button>
          ))}
        </section>
      ) : (
        <section className="albums-empty">
          <p>还没有专辑</p>
          <span>导入歌曲后，会按歌曲元数据（专辑名/歌手）自动聚合。</span>
        </section>
      )}
    </section>
  )
})

export default AlbumsPage

