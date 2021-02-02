// 歌词列表展示
import { Popconfirm, Table } from "antd"
import { observer } from "mobx-react"
import React, { useEffect } from "react"
import { InterfaceLrcInfo } from "../../Interface/music"
import common from "../../store/common"

const LrcList = observer(() => {
  const columns = [
    {
      title: '歌词名',
      dataIndex: 'fileName',
      key: 'fileName',
    },
    {
      title: '大小',
      dataIndex: 'fileSize',
      key: 'fileSize',
      sorter: (a: InterfaceLrcInfo, b: InterfaceLrcInfo) => a.size - b.size
    },
    {
      title: '操作',
      dataIndex: 'name',
      key: 'control',
      render: (_: string, row: InterfaceLrcInfo) => {
        return (
          <p>
            <Popconfirm
              placement="topRight"
              title={`确定删除-${row.fileName}-歌词嘛`}
              onConfirm={() => handleDelete(row.fileName || '')}
              okText="确定"
              cancelText="取消"
            >
              <span className="link">删除</span>
            </Popconfirm>
          </p>
        )
      }
    },
  ]
  const list = common.localMusicLrcList
  const loading = common.localMusicLrcLoading

  const handleDelete = (id: string) => {
    common.deleteLrc(id)
  }

  useEffect(() => {
    console.log('获取歌词列表')
    common.updateLocalMusicLrcList()
  }, [])

  return (
    <section className="lrc-list">
      <Table
        dataSource={list}
        columns={columns}
        pagination={false}
        rowKey="fileName"
        loading={loading} />
    </section>
  )
})

export default LrcList