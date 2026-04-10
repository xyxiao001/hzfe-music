import React, { useMemo } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import {
  CloudUploadOutlined,
  CustomerServiceOutlined,
  FileTextOutlined,
  GithubOutlined,
  HomeOutlined,
  SoundOutlined
} from '@ant-design/icons'
import common from '../store/common'
import './index.scss'

type NavItem = {
  key: string
  label: string
  path: string
  icon: React.ReactNode
}

const ShellLayout = observer(() => {
  const location = useLocation()
  const navigate = useNavigate()

  const navItems: NavItem[] = useMemo(() => ([
    { key: 'library', label: '资料库', path: '/library', icon: <HomeOutlined /> },
    { key: 'albums', label: '专辑', path: '/albums', icon: <CustomerServiceOutlined /> },
    { key: 'songs', label: '歌曲', path: '/songs', icon: <SoundOutlined /> },
    { key: 'lyrics', label: '歌词', path: '/lyrics', icon: <FileTextOutlined /> },
    { key: 'import', label: '导入', path: '/import', icon: <CloudUploadOutlined /> }
  ]), [])

  const activeKey = useMemo(() => {
    const pathname = location.pathname.replace(/\/+$/, '')
    if (pathname.startsWith('/albums')) return 'albums'
    if (pathname.startsWith('/songs')) return 'songs'
    if (pathname.startsWith('/lyrics')) return 'lyrics'
    if (pathname.startsWith('/import')) return 'import'
    if (pathname.startsWith('/now-playing')) return 'now-playing'
    return 'library'
  }, [location.pathname])

  const title = useMemo(() => {
    switch (activeKey) {
      case 'albums':
        return '专辑'
      case 'songs':
        return '歌曲'
      case 'lyrics':
        return '歌词'
      case 'import':
        return '导入'
      case 'now-playing':
        return '正在播放'
      default:
        return '资料库'
    }
  }, [activeKey])

  const stats = useMemo(() => ([
    { key: 'songs', label: '首歌曲', value: common.localMusicList.length },
    { key: 'albums', label: '张专辑', value: common.localAlbumMap.size },
    { key: 'lyrics', label: '份歌词', value: common.localMusicLrcList.length }
  ]), [common.localAlbumMap.size, common.localMusicLrcList.length, common.localMusicList.length])

  const githubUrl = 'https://github.com/xyxiao001/hzfe-music'

  return (
    <section className="app-shell">
      <aside className="shell-rail" aria-label="主导航">
        <section className="rail-brand" onClick={() => navigate('/library')}>
          <span className="rail-icon"><SoundOutlined /></span>
          <section className="rail-copy">
            <p className="rail-title">HZFE Music</p>
            <p className="rail-subtitle">本地音乐</p>
          </section>
        </section>
        <nav className="rail-nav">
          {navItems.map(item => (
            <button
              key={item.key}
              type="button"
              className={`rail-item ${activeKey === item.key ? 'is-active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="rail-item-icon">{item.icon}</span>
              <span className="rail-item-label">{item.label}</span>
            </button>
          ))}
        </nav>
        <section className="rail-footer">
          <button
            type="button"
            className={`rail-now ${common.musicData.id ? '' : 'is-disabled'}`}
            onClick={() => {
              if (!common.musicData.id) return
              common.updatedMusicData({ min: false })
              navigate('/now-playing')
            }}
            disabled={!common.musicData.id}
          >
            <span className="rail-now-kicker">Now Playing</span>
            <span className="rail-now-title">{common.musicInfo?.name || '正在播放'}</span>
          </button>
        </section>
      </aside>

      <section className="shell-main">
        <header className="shell-topbar">
          <section className="topbar-left">
            <section className="topbar-title-row">
              <p className="topbar-title">{title}</p>
              <a
                className="topbar-github"
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                title="GitHub"
              >
                <GithubOutlined />
                <span>GitHub</span>
              </a>
            </section>
            <p className="topbar-subtitle">围绕本地上传、专辑浏览、歌词管理与沉浸式播放</p>
          </section>
          <section className="topbar-stats" aria-label="资料库统计">
            {stats.map(item => (
              <span key={item.key} className="topbar-pill">{item.value} {item.label}</span>
            ))}
          </section>
        </header>

        <main className="shell-content">
          <section key={location.pathname} className="route-frame">
            <Outlet />
          </section>
        </main>

        <nav className="shell-tabbar" aria-label="底部导航">
          {navItems.map(item => (
            <button
              key={item.key}
              type="button"
              className={`tab-item ${activeKey === item.key ? 'is-active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="tab-icon">{item.icon}</span>
              <span className="tab-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </section>
    </section>
  )
})

export default ShellLayout
