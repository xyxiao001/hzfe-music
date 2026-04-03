import React, { useEffect } from 'react';
import { SoundOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import Player from '../Components/Player';
import Locale from '../Local';
import common from '../store/common';
import './index.scss'

const Home = observer(() => {
  useEffect(() => {
    common.hydratePlayerState()
  }, [])

  return (
    <section className="page-home">
      <section className="wrapper-box">
        <section className="app-header">
          <section className="brand">
            <span className="brand-icon">
              <SoundOutlined />
            </span>
            <section>
              <p className="brand-title">HZFE Music</p>
              <p className="brand-subtitle">本地音乐资料库</p>
            </section>
          </section>
          <section className="brand-meta">
            <span>{common.localMusicList.length} 首歌曲</span>
            <span>{common.localAlbumMap.size} 张专辑</span>
          </section>
        </section>
        <section className="music-box">
          <Locale />
        </section>
      </section>
      <Player />
    </section>
  );
})

export default Home
