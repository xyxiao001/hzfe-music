// 歌词列表展示
import { Table } from "antd"
import React, { useCallback, useEffect, useState } from "react"
import { InterfaceLrcInfo } from "../../Interface/music"
import { getLrcList } from "../../utils/local"


const LrcList = () => {
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
  
  const [list, setList] = useState<InterfaceLrcInfo[]>([])

  const [loading, setLoading] = useState(false)

  const getList = useCallback(
    async () => {
      console.log('get lrc List')
      setLoading(true)
      const list = await getLrcList()
      setList(list)
      setLoading(false)
    },
    [],
  )

  useEffect(() => {
    getList()
  }, [getList])

  return (
    <section className="lrc-list">
      <Table dataSource={list} columns={columns} pagination={false} rowKey="fileName" loading={loading} />
    </section>
  )
}

export default LrcList