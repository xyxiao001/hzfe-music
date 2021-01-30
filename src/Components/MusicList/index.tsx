// 歌词列表展示
import { Space, Table } from "antd"
import React, { useEffect } from "react"
import { InterfaceMusicInfo } from "../../Interface/music"
import { formatTime } from "../../utils"
import { observer } from "mobx-react"
import { PauseCircleOutlined, PlayCircleOutlined } from "@ant-design/icons"
import './index.scss'
import common from "../../store/common"
const MusicList = observer(() => {
  const musicData = common.musicData
  const list = common.localMusicList
  const loading = common.localMusicLoading
  const columns = [
    {
      title: '歌曲',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, row: InterfaceMusicInfo) => 
        (
          <p className="list-play">
            {
              (musicData?.id === row.id && musicData.playing) ?
              (
                <span>
                  <PauseCircleOutlined className="icon" onClick={() => handlePauseClick()} />
                </span>
              ) : (
                <span>
                  <PlayCircleOutlined className="icon" onClick={() => handlePlayClick(row)}/>
                </span>
              )
            }
            <span>{ name}</span>
          </p>
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
      render: (codec: string, row: InterfaceMusicInfo)  => codec || row.fileType
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
      render: (lrcKey: string, row: InterfaceMusicInfo)  => {
        if (lrcKey) {
          return lrcKey
        } else {
          return (
            <Space size="middle">
              <span className="action">关联歌词</span>
            </Space>
          )
        }
      }
    },
  ]

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
        common.musicPlayer.play()
      }
    }
    
  }

  const handlePauseClick = () => {
    common.musicPlayer?.pause()
  }

  useEffect(() => {
    console.log('获取音乐列表')
    common.updateLocalMusicList()
  }, [])

  return (
    <section className="lrc-list">
      <Table dataSource={list} columns={columns} pagination={false} rowKey="fileName" loading={loading} />
    </section>
  )
})

export default MusicList