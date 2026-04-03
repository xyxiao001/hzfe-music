import React, { useState } from "react"
import Upload from "../Components/Upload"
import { Button, message, Popconfirm, Tabs } from 'antd';
import { CustomerServiceOutlined, DeleteOutlined, FileTextOutlined, SoundOutlined, SyncOutlined } from '@ant-design/icons';
import LrcList from "../Components/LrcList";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import MusicList from "../Components/MusicList";
import { MusicRelatedLrc } from "../utils/local";
import common from "../store/common";
import localforage from 'localforage'
import AlbumList from "../Components/AlbumList";
import { observer } from "mobx-react-lite";
import './index.scss'

const Locale = observer(() => {

  const navigate = useNavigate()
  const location = useLocation()

  const query = new URLSearchParams(location.search)

  const tabCallback = (key: string) => {
    navigate(`${location.pathname}?type=${key}`)
  }
  const [key, setKey] = useState(() => {
    const list = ['music', 'lrc', 'album']
    const key = query.get('type') || ''
    return list.includes(key) ? key : 'album'
  })

  const handleRelated = async () => {
    await MusicRelatedLrc()
    message.success('关联成功')
    common.updateLocalMusicList()
    common.updateLocalMusicLrcList()
  }

  useEffect(() => {
    const list = ['music', 'lrc', 'album']
    const key = query.get('type') || ''
    setKey(list.includes(key) ? key : 'album')
  }, [location.search])

  const handleClear = () => {
    localforage.clear()
    common.resetPlayback()
    common.updateLocalMusicList()
    common.updateLocalMusicLrcList()
  }

  const stats = [
    {
      key: 'music',
      label: '歌曲',
      value: common.localMusicList.length,
      icon: <SoundOutlined />
    },
    {
      key: 'album',
      label: '专辑',
      value: common.localAlbumMap.size,
      icon: <CustomerServiceOutlined />
    },
    {
      key: 'lrc',
      label: '歌词',
      value: common.localMusicLrcList.length,
      icon: <FileTextOutlined />
    },
  ]

  return (
    <section className="page-local">
      <section className="local-hero">
        <section className="hero-copy">
          <span className="hero-badge">Local Library</span>
          <h1>你的私人 Apple Music 风格资料库</h1>
          <p className="hero-desc">
            只保留本地音乐能力，围绕上传、专辑浏览、歌词管理和沉浸式播放重新整理页面层级。
          </p>
          <section className="hero-stats">
            {stats.map(item => (
              <section className="stat-card" key={item.key}>
                <span className="stat-icon">{item.icon}</span>
                <section className="stat-copy">
                  <span className="stat-value">{item.value}</span>
                  <span className="stat-label">{item.label}</span>
                </section>
              </section>
            ))}
          </section>
        </section>
        <section className="hero-panel">
          <section className="hero-panel-card">
            <p className="panel-title">快速操作</p>
            <Upload></Upload>
            <section className="panel-actions">
              <Button type="primary" icon={<SyncOutlined />} onClick={handleRelated}>自动关联歌词</Button>
              <Popconfirm
                placement="topLeft"
                title="清空数据库就无法恢复哦，谨慎操作"
                onConfirm={handleClear}
                okText="确定"
                cancelText="取消"
              >
                <Button icon={<DeleteOutlined />}>清空数据库</Button>
              </Popconfirm>
            </section>
            <p className="tips">关联规则：当前歌曲没有歌词，同时歌词名包含完整歌曲名。</p>
          </section>
        </section>
      </section>
      <section className="local-content">
        <Tabs
          className="local-tabs"
          activeKey={key}
          onChange={tabCallback}
          items={[
            { key: 'album', label: '专辑', children: <AlbumList /> },
            { key: 'music', label: '歌曲', children: <MusicList /> },
            { key: 'lrc', label: '歌词', children: <LrcList /> },
          ]}
        />
      </section>
    </section>
  )
})

export default Locale
