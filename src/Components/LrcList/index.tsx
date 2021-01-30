// 歌词列表展示
import { Table } from "antd"
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
    }
  ]
  const list = common.localMusicLrcList
  const loading = common.localMusicLrcLoading

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