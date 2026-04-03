// 歌词列表展示
import { Input, Popconfirm, Space, Table, Tag } from "antd"
import React, { useMemo, useState } from "react"
import { InterfaceMusicInfo } from "../../Interface/music"
import { formatTime } from "../../utils"
import { observer } from "mobx-react-lite"
import { PauseCircleOutlined, PlayCircleOutlined, SearchOutlined } from "@ant-design/icons"
import './index.scss'
import common from "../../store/common"
import PlayingIcon from "../Playing-icon"
import LyricsManager from "../LyricsManager"
import MusicMetaEditor from "../MusicMetaEditor"
const MusicList = observer(() => {
  const musicData = common.musicData
  const list = common.localMusicList
  const loading = common.localMusicLoading
  const [keyword, setKeyword] = useState('')
  const filteredList = useMemo(() => {
    const value = keyword.trim().toLowerCase()
    if (!value) return list
    return list.filter(item => {
      return [
        item.name,
        item.artist,
        item.album,
        item.lrcKey,
        item.fileName
      ].some(field => String(field || '').toLowerCase().includes(value))
    })
  }, [keyword, list])
  const columns = [
    {
      title: '歌曲',
      dataIndex: 'name',
      key: 'name',
      width: 300,
      render: (name: string, row: InterfaceMusicInfo) =>
        (
          <section className="list-play">
            {
              (musicData?.id === row.id && musicData.playing) ?
                (
                  <span>
                    <PauseCircleOutlined className="icon" onClick={() => handlePauseClick()} />
                  </span>
                ) : (
                  <span>
                    <PlayCircleOutlined className="icon" onClick={() => handlePlayClick(row)} />
                  </span>
                )
            }
            <span className="song-name">{name}</span>
            {
              (musicData?.id === row.id && musicData.playing) ?
                (
                  <PlayingIcon></PlayingIcon>
                ) : ''
            }
          </section>
        )
    },
    {
      title: '歌手',
      dataIndex: 'artist',
      key: 'artist',
    },
    {
      title: '专辑',
      dataIndex: 'album',
      key: 'album',
    },
    {
      title: '时长',
      dataIndex: 'duration',
      key: 'duration',
      render: (time: number) => formatTime(time) || '未知',
      sorter: (a: InterfaceMusicInfo, b: InterfaceMusicInfo) => Number(a.duration) - Number(b.duration)
    },
    {
      title: '格式',
      dataIndex: 'codec',
      key: 'codec',
      render: (codec: string, row: InterfaceMusicInfo) => codec || row.fileType
    },
    {
      title: '大小',
      dataIndex: 'fileSize',
      key: 'fileSize',
      sorter: (a: InterfaceMusicInfo, b: InterfaceMusicInfo) => Number(a.size) - Number(b.size)
    },
    {
      title: '关联歌词名',
      dataIndex: 'lrcKey',
      key: 'lrcKey',
      render: (lrcKey: string, row: InterfaceMusicInfo) => {
        if (lrcKey) {
          return (
            <section className="lrc-binding-cell">
              <Tag color="processing">{lrcKey}</Tag>
              <LyricsManager currentMusic={row} triggerType="link" triggerLabel="修改" />
            </section>
          )
        } else {
          return (
            <Space size="middle">
              <LyricsManager currentMusic={row} triggerType="link" triggerLabel="关联歌词" />
            </Space>
          )
        }
      }
    },
    {
      title: '操作',
      dataIndex: 'name',
      key: 'control',
      render: (_: string, row: InterfaceMusicInfo) => {
        return (
          <section>
            <MusicMetaEditor music={row} triggerType="link" triggerLabel="详情" />
            <Popconfirm
              placement="topRight"
              title={`确定删除-${row.name}-这首歌嘛`}
              onConfirm={() => handleDelete(row.id || '')}
              okText="确定"
              cancelText="取消"
            >
              <span className="link">删除</span>
            </Popconfirm>
          </section>
        )
      }
    },
  ]

  const handlePlayClick = (item: InterfaceMusicInfo) => {
    if (item.id !== musicData.id) {
      common.selectMusic(item.id || '')
    } else {
      if (common.musicPlayer) {
        common.musicPlayer.play()
      }
    }
  }

  const handlePauseClick = () => {
    common.musicPlayer?.pause()
  }

  const handleDelete = (id: string) => {
    common.deleteMusic(id)
  }

  return (
    <section className="lrc-list-table">
      <section className="music-list-toolbar">
        <Input
          allowClear
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          prefix={<SearchOutlined />}
          placeholder="搜索歌曲 / 歌手 / 专辑 / 绑定歌词"
        />
        <p className="music-list-summary">共 {filteredList.length} 首</p>
      </section>
      <Table
        dataSource={filteredList}
        columns={columns}
        rowClassName={(row: InterfaceMusicInfo) => row.id === musicData.id ? 'active-row' : ''}
        pagination={filteredList.length > 10 ? { pageSize: 10, hideOnSinglePage: true } : false}
        rowKey="id"
        loading={loading}
      />
    </section>
  )
})

export default MusicList
