// 歌词列表展示
import React from "react"
import { observer } from "mobx-react-lite"
import './index.scss'
import common from "../../store/common"
import { InterfaceMusicInfo } from "../../Interface/music"
import { CaretRightFilled } from "@ant-design/icons"
const fallbackCover = '/images/music-no.jpeg'
const AlbmuList = observer(() => {
  const map = common.localAlbumMap
  const list = [...map.keys()]
  const musicData = common.musicData

  const handlePlayClick = (item: InterfaceMusicInfo) => {
    if (item.id !== musicData.id) {
      common.selectMusic(item.id || '')
    } else {
      if (common.musicPlayer) {
        common.musicPlayer.play()
      }
    }
  }

  return (
    <section className="album-list">
      {
        list.map(item => {
          const info = map.get(item) as InterfaceMusicInfo[]
          const album = info[0]
          const cover = album.picture[0] || fallbackCover
          return (
            <section key={item} className="album-item" style={{
              backgroundImage: `url(${cover})`
            }}>
              <section className="mask"></section>
              <section className="album-show">
                <section className="album-meta">
                  <span className="album-kicker">ALBUM</span>
                  <button className="album-play" onClick={() => handlePlayClick(info[0])}>
                    <CaretRightFilled />
                  </button>
                </section>
                <p className="album-title">{ item }</p>
                <p className="album-desc">{album.artist || '未知歌手'} · {info.length} 首歌曲</p>
                <section className="music-list">
                  {
                    info.map(music => (
                      <p
                        key={music.name}
                        className={`music-item ${music.id === musicData.id ? 'active' : ''}`}
                        onClick={() => handlePlayClick(music)}
                      >
                        <span>
                          { music.name }
                        </span>
                      </p>
                    ))
                  }
                </section>
              </section>
            </section>
          )
        })
      }
    </section>
  )
})

export default AlbmuList
