import React from 'react'
import { Button, message } from 'antd'
import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router-dom'
import { SyncOutlined } from '@ant-design/icons'
import LrcList from '../../Components/LrcList'
import common from '../../store/common'
import { MusicRelatedLrc } from '../../utils/local'
import './index.scss'

const LyricsPage = observer(() => {
  const navigate = useNavigate()

  const handleAutoBind = async () => {
    await MusicRelatedLrc()
    message.success('已自动关联可匹配的歌词')
    common.updateLocalMusicList()
    common.updateLocalMusicLrcList()
  }

  return (
    <section className="page-lyrics">
      <section className="lyrics-toolbar">
        <section className="lyrics-actions">
          <Button type="primary" icon={<SyncOutlined />} onClick={handleAutoBind}>
            自动关联歌词
          </Button>
          <Button onClick={() => navigate('/import')}>上传歌词</Button>
        </section>
        <p className="lyrics-tip">规则：优先匹配“歌词文件名”与“歌曲名/文件名/歌手+歌名”。</p>
      </section>
      <LrcList />
    </section>
  )
})

export default LyricsPage

