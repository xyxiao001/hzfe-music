import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import Player from '../Components/Player';
import common from '../store/common';
import ShellLayout from '../Shell';
import LibraryPage from '../Pages/Library';
import AlbumsPage from '../Pages/Albums';
import AlbumDetailPage from '../Pages/AlbumDetail';
import SongsPage from '../Pages/Songs';
import LyricsPage from '../Pages/Lyrics';
import ImportPage from '../Pages/Import';
import NowPlayingPage from '../Pages/NowPlaying';
import StatsPage from '../Pages/Stats';
import './index.scss'

const Home = observer(() => {
  useEffect(() => {
    common.hydratePlayerState()
  }, [])

  return (
    <section className="app-root">
      <Routes>
        <Route element={<ShellLayout />}>
          <Route index element={<Navigate to="library" replace />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="albums" element={<AlbumsPage />} />
          <Route path="albums/:albumName" element={<AlbumDetailPage />} />
          <Route path="songs" element={<SongsPage />} />
          <Route path="lyrics" element={<LyricsPage />} />
          <Route path="import" element={<ImportPage />} />
          <Route path="stats" element={<StatsPage />} />
          <Route path="now-playing" element={<NowPlayingPage />} />
          <Route path="*" element={<Navigate to="library" replace />} />
        </Route>
      </Routes>
      <Player />
    </section>
  );
})

export default Home
