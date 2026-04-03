import React, { useEffect, useState } from "react"
import { Button, Input, Modal, Tag, message } from "antd"
import { EditOutlined, PlayCircleOutlined } from "@ant-design/icons"
import { observer } from "mobx-react-lite"
import { InterfaceMusicInfo } from "../../Interface/music"
import common from "../../store/common"
import LyricsManager from "../LyricsManager"
import { formatTime } from "../../utils"
import './index.scss'

const MusicMetaEditor = observer((props: {
  music: InterfaceMusicInfo | null
  triggerType?: 'default' | 'link'
  triggerLabel?: string
}) => {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [artist, setArtist] = useState('')
  const [album, setAlbum] = useState('')

  useEffect(() => {
    if (!open || !props.music) return
    setName(props.music.name || '')
    setArtist(props.music.artist || '')
    setAlbum(props.music.album || '')
  }, [open, props.music])

  const handleSave = async () => {
    if (!props.music?.id) return
    await common.saveMusicMeta({
      musicId: props.music.id,
      name: name.trim() || props.music.name,
      artist: artist.trim() || props.music.artist,
      album: album.trim() || props.music.album
    })
    message.success('歌曲信息已更新')
    setOpen(false)
  }

  return (
    <>
      {props.triggerType === 'link' ? (
        <Button type="link" icon={<EditOutlined />} onClick={() => setOpen(true)} disabled={!props.music?.id}>
          {props.triggerLabel || '编辑歌曲'}
        </Button>
      ) : (
        <Button icon={<EditOutlined />} onClick={() => setOpen(true)} disabled={!props.music?.id}>
          {props.triggerLabel || '歌曲详情'}
        </Button>
      )}
      <Modal
        title="歌曲详情"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleSave}
        okText="保存"
        cancelText="取消"
        width={720}
      >
        {props.music ? (
          <section className="music-meta-editor">
            <section className="music-meta-cover">
              <img src={props.music.picture?.[0] || props.music.pictureUrl || '/images/music-no.jpeg'} alt="" />
              <section className="music-meta-cover-info">
                <p className="music-meta-title">{props.music.name}</p>
                <p className="music-meta-subtitle">{props.music.artist || '未知歌手'} · {props.music.album || '未命名专辑'}</p>
              </section>
            </section>
            <section className="music-meta-grid">
              <section>
                <p className="music-meta-label">歌曲名</p>
                <Input value={name} onChange={(event) => setName(event.target.value)} />
              </section>
              <section>
                <p className="music-meta-label">歌手</p>
                <Input value={artist} onChange={(event) => setArtist(event.target.value)} />
              </section>
              <section>
                <p className="music-meta-label">专辑</p>
                <Input value={album} onChange={(event) => setAlbum(event.target.value)} />
              </section>
              <section>
                <p className="music-meta-label">文件信息</p>
                <p className="music-meta-value">{props.music.fileType || props.music.codec} · {props.music.fileSize || '未知大小'}</p>
              </section>
              <section>
                <p className="music-meta-label">时长</p>
                <p className="music-meta-value">{formatTime(props.music.duration || 0)}</p>
              </section>
              <section>
                <p className="music-meta-label">当前绑定歌词</p>
                <section className="music-meta-tags">
                  {props.music.lrcKey ? <Tag color="processing">{props.music.lrcKey}</Tag> : <Tag>未绑定</Tag>}
                </section>
              </section>
            </section>
            <section className="music-meta-actions">
              <Button icon={<PlayCircleOutlined />} onClick={() => common.selectMusic(props.music?.id || '')}>
                立即播放
              </Button>
              <LyricsManager currentMusic={props.music} triggerLabel="管理当前歌曲歌词" />
            </section>
          </section>
        ) : null}
      </Modal>
    </>
  )
})

export default MusicMetaEditor
