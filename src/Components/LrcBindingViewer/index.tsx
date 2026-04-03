import React, { useMemo, useState } from "react"
import { Button, Modal, Tag } from "antd"
import { LinkOutlined, PlayCircleOutlined } from "@ant-design/icons"
import { observer } from "mobx-react-lite"
import { InterfaceLrcInfo } from "../../Interface/music"
import common from "../../store/common"
import MusicMetaEditor from "../MusicMetaEditor"
import './index.scss'

const LrcBindingViewer = observer((props: {
  lyric: InterfaceLrcInfo
}) => {
  const [open, setOpen] = useState(false)
  const bindings = useMemo(() => {
    return common.localMusicList.filter(item => item.lrcKey === props.lyric.fileName)
  }, [props.lyric.fileName, common.localMusicList])

  return (
    <>
      <Button type="link" icon={<LinkOutlined />} onClick={() => setOpen(true)}>
        {bindings.length} 首歌曲
      </Button>
      <Modal
        title={`绑定关系 · ${props.lyric.fileName}`}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={760}
      >
        <section className="lrc-binding-viewer">
          {bindings.length ? bindings.map(item => (
            <section key={item.id} className="binding-item">
              <section className="binding-info">
                <p className="binding-name">{item.name}</p>
                <p className="binding-meta">{item.artist || '未知歌手'} · {item.album || '未命名专辑'}</p>
                <section className="binding-tags">
                  <Tag color="processing">{item.fileType || item.codec || '未知格式'}</Tag>
                  {common.musicData.id === item.id ? <Tag color="magenta">当前播放</Tag> : null}
                </section>
              </section>
              <section className="binding-actions">
                <Button icon={<PlayCircleOutlined />} onClick={() => common.selectMusic(item.id || '')}>
                  播放
                </Button>
                <MusicMetaEditor music={item} triggerType="link" triggerLabel="详情" />
              </section>
            </section>
          )) : (
            <section className="binding-empty">
              <p>当前还没有歌曲绑定这份歌词</p>
              <span>你可以去歌曲列表或播放器里的歌词管理，为歌曲手动关联这份歌词。</span>
            </section>
          )}
        </section>
      </Modal>
    </>
  )
})

export default LrcBindingViewer
