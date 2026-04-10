import { useEffect, useMemo, useState } from "react"
import { Button, Input, Modal, Tag, message } from "antd"
import { EditOutlined, PlayCircleOutlined } from "@ant-design/icons"
import { observer } from "mobx-react-lite"
import { InterfaceMusicInfo } from "../../Interface/music"
import common from "../../store/common"
import LyricsManager from "../LyricsManager"
import { formatTime } from "../../utils"
import { getMusicStats, type MusicStats } from "../../utils/stats"
import './index.scss'

const formatDurationMs = (ms: number) => {
  const totalSec = Math.floor(Math.max(0, ms) / 1000)
  const hours = Math.floor(totalSec / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m`
  return `${Math.floor(totalSec)}s`
}

const formatDateTime = (ts?: number) => {
  const value = Number(ts || 0)
  if (!value) return '—'
  const date = new Date(value)
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const mi = String(date.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`
}

const MusicMetaEditor = observer((props: {
  music: InterfaceMusicInfo | null
  triggerType?: 'default' | 'link'
  triggerLabel?: string
}) => {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [artist, setArtist] = useState('')
  const [album, setAlbum] = useState('')
  const [stats, setStats] = useState<MusicStats | null>(null)

  useEffect(() => {
    if (!open || !props.music) return
    setName(props.music.name || '')
    setArtist(props.music.artist || '')
    setAlbum(props.music.album || '')
  }, [open, props.music])

  useEffect(() => {
    let cancelled = false
    const loadStats = async () => {
      if (!open || !props.music?.id) return
      const value = await getMusicStats(props.music.id)
      if (cancelled) return
      setStats(value)
    }
    loadStats()
    return () => {
      cancelled = true
    }
  }, [open, props.music?.id])

  const skipRate = useMemo(() => {
    const playCount = Number(stats?.playCount || 0)
    const skipCount = Number(stats?.skipCount || 0)
    if (playCount <= 0) return 0
    return Math.min(1, skipCount / Math.max(1, playCount))
  }, [stats?.playCount, stats?.skipCount])

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

            <section className="music-meta-stats">
              <p className="music-meta-stats-title">播放统计</p>
              <section className="music-meta-stats-grid">
                <section>
                  <p className="music-meta-label">播放次数</p>
                  <p className="music-meta-value">{stats?.playCount ?? 0}</p>
                </section>
                <section>
                  <p className="music-meta-label">累计播放</p>
                  <p className="music-meta-value">{formatDurationMs(stats?.totalPlayMs || 0)}</p>
                </section>
                <section>
                  <p className="music-meta-label">最近播放</p>
                  <p className="music-meta-value">{formatDateTime(stats?.lastPlayedAt)}</p>
                </section>
                <section>
                  <p className="music-meta-label">最近完整播放</p>
                  <p className="music-meta-value">{formatDateTime(stats?.lastFinishedAt)}</p>
                </section>
                <section>
                  <p className="music-meta-label">跳过次数</p>
                  <p className="music-meta-value">{stats?.skipCount ?? 0}</p>
                </section>
                <section>
                  <p className="music-meta-label">跳过率</p>
                  <p className="music-meta-value">{Math.round(skipRate * 100)}%</p>
                </section>
              </section>
              <p className="music-meta-stats-tip">播放次数的口径：单次有效播放达到“30 秒或歌曲 30%（取较小者，最少 5 秒）”才计 1 次。</p>
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
