// 歌词列表展示
import { Space, Table } from "antd"
import React, { useCallback, useEffect, useState } from "react"
import { InterfaceMusicInfo } from "../../Interface/music"
import { formatTime } from "../../utils"
import { getMusicList } from "../../utils/local"
import { observer } from "mobx-react"
import { PauseCircleOutlined, PlayCircleOutlined } from "@ant-design/icons"
import './index.scss'
import common from "../../store/common"
const MusicList = observer(() => {
  const musicData = common.musicData
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
  
  const [list, setList] = useState<InterfaceMusicInfo[]>([])

  const [loading, setLoading] = useState(false)

  const getList = useCallback(
    async () => {
      console.log('get music List')
      setLoading(true)
      const list = await getMusicList()
      setList(list)
      setLoading(false)
    },
    [],
  )

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
    console.log('music-get-list')
    getList()
  }, [getList])

  return (
    <section className="lrc-list">
      <Table dataSource={list} columns={columns} pagination={false} rowKey="fileName" loading={loading} />
    </section>
  )
})

export default MusicList