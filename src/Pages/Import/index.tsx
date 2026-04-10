import React from 'react'
import { Button, Popconfirm, message } from 'antd'
import { observer } from 'mobx-react-lite'
import { DeleteOutlined, SyncOutlined } from '@ant-design/icons'
import localforage from 'localforage'
import Upload from '../../Components/Upload'
import common from '../../store/common'
import { MusicRelatedLrc } from '../../utils/local'
import './index.scss'

const ImportPage = observer(() => {
  const handleRelated = async () => {
    await MusicRelatedLrc()
    message.success('关联成功')
    common.updateLocalMusicList()
    common.updateLocalMusicLrcList()
  }

  const handleClear = async () => {
    await localforage.clear()
    common.resetPlayback()
    await Promise.all([
      common.updateLocalMusicList(),
      common.updateLocalMusicLrcList()
    ])
    message.success('已清空本地资料库')
  }

  return (
    <section className="page-import">
      <section className="import-card">
        <p className="card-title">上传与导入</p>
        <p className="card-desc">导入歌曲与歌词后，会自动建立本地资料库；离线也可使用。</p>
        <Upload />
      </section>

      <section className="import-card">
        <p className="card-title">资料库维护</p>
        <p className="card-desc">常用的批量操作：自动关联歌词、清空数据库。</p>
        <section className="card-actions">
          <Button type="primary" icon={<SyncOutlined />} onClick={handleRelated}>
            自动关联歌词
          </Button>
          <Popconfirm
            placement="topLeft"
            title="清空数据库后无法恢复，确认继续？"
            onConfirm={handleClear}
            okText="确定"
            cancelText="取消"
          >
            <Button danger icon={<DeleteOutlined />}>清空数据库</Button>
          </Popconfirm>
        </section>
        <p className="card-tip">关联规则：优先匹配“歌词文件名”与“歌曲名/文件名/歌手+歌名”。</p>
      </section>
    </section>
  )
})

export default ImportPage

