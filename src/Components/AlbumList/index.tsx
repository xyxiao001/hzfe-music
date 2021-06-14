// 歌词列表展示
import React, { useEffect } from "react"
import { observer } from "mobx-react"
import './index.scss'
import common from "../../store/common"
import { InterfaceMusicInfo } from "../../Interface/music"
const AlbmuList = observer(() => {
  const map = common.localAlbumMap
  const list = [...map.keys()]
  const musicData = common.musicData

  const handlePlayClick = (item: InterfaceMusicInfo) => {
    if (item.id !== musicData.id) {
      common.musicPlayer?.stop()
      setTimeout(() => {
        common.updatedMusicData({
          id: item.id
        })
      }, 100)
    } else {
      if (common.musicPlayer) {
        common.musicPlayer?.stop()
        common.musicPlayer.play()
      }
    }
  }

  useEffect(() => {
    console.log('获取音乐列表')
    common.updateLocalMusicList()
  }, [])

  return (
    <section className="album-list">
      {
        list.map(item => {
          const info = map.get(item) as InterfaceMusicInfo[]
          const album = info[0]
          return (
            <section key={item} className="album-item" style={{
              backgroundImage: `url(${album.picture || process.env.PUBLIC_URL + '/images/music-no.jpeg'})`
            }}>
              <section className="mask"></section>
                <section className="album-show">
                <p className="album-title">{ item }</p>
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