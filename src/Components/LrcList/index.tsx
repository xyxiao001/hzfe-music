// 歌词列表展示
import { Popconfirm, Table } from "antd"
import { observer } from "mobx-react-lite"
import React from "react"
import { InterfaceLrcInfo } from "../../Interface/music"
import common from "../../store/common"
import LyricsLibraryEditor from "../LyricsLibraryEditor"
import LrcBindingViewer from "../LrcBindingViewer"

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
      title: '绑定歌曲',
      dataIndex: 'fileName',
      key: 'bindings',
      render: (_: string, row: InterfaceLrcInfo) => {
        return <LrcBindingViewer lyric={row} />
      }
    },
    {
      title: '操作',
      dataIndex: 'name',
      key: 'control',
      render: (_: string, row: InterfaceLrcInfo) => {
        return (
          <section>
            <LyricsLibraryEditor lyric={row} triggerType="link" />
            <Popconfirm
              placement="topRight"
              title={`确定删除-${row.fileName}-歌词嘛`}
              onConfirm={() => handleDelete(row.fileName || '')}
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
  const list = common.localMusicLrcList
  const loading = common.localMusicLrcLoading

  const handleDelete = (id: string) => {
    common.deleteLrc(id)
  }

  return (
    <section className="lrc-list">
      <Table
        dataSource={list}
        columns={columns}
        pagination={list.length > 10 ? { pageSize: 10, hideOnSinglePage: true } : false}
        rowKey="fileName"
        loading={loading} />
    </section>
  )
})

export default LrcList
