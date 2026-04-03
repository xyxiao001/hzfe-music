import React, { useEffect, useMemo, useState } from "react"
import { Button, Input, Modal, Select, message } from "antd"
import { EditOutlined } from "@ant-design/icons"
import { observer } from "mobx-react-lite"
import { InterfaceMusicInfo } from "../../Interface/music"
import common from "../../store/common"
import './index.scss'

const { TextArea } = Input

const createManualFileName = (musicInfo: InterfaceMusicInfo) => {
  const baseName = musicInfo.name?.trim() || '未命名歌曲'
  return `${baseName}-手动歌词.lrc`
}

const LyricsManager = observer((props: {
  currentMusic: InterfaceMusicInfo | null
  triggerType?: 'default' | 'link'
  triggerLabel?: string
}) => {
  const { currentMusic } = props
  const [open, setOpen] = useState(false)
  const [selectedKey, setSelectedKey] = useState('')
  const [content, setContent] = useState('')
  const [saveAsCopy, setSaveAsCopy] = useState(false)

  const lrcOptions = useMemo(() => {
    return common.localMusicLrcList.map(item => ({
      label: item.fileName,
      value: item.fileName,
      content: item.content
    }))
  }, [common.localMusicLrcList])

  useEffect(() => {
    if (!open || !currentMusic) return
    setSelectedKey(currentMusic.lrcKey || '')
    setContent(currentMusic.lrc || '')
    setSaveAsCopy(false)
  }, [currentMusic, open])

  const handleSelectChange = (value: string) => {
    setSelectedKey(value)
    const target = lrcOptions.find(item => item.value === value)
    setContent(target?.content || '')
  }

  const handleUnbind = async () => {
    if (!currentMusic?.id) return
    await common.saveMusicLrcBinding({
      musicId: currentMusic.id,
      lrcKey: ''
    })
    message.success('已解除当前歌曲歌词绑定')
    setSelectedKey('')
    setContent('')
  }

  const handleSave = async () => {
    if (!currentMusic?.id) return
    const trimmed = content.trim()
    if (!selectedKey && !trimmed) {
      message.warning('请选择歌词或输入歌词内容')
      return
    }
    const shouldCreateCopy = saveAsCopy || !selectedKey
    const fileName = shouldCreateCopy ? createManualFileName(currentMusic) : selectedKey
    await common.saveMusicLrcBinding({
      musicId: currentMusic.id,
      lrcKey: fileName,
      lrcContent: trimmed,
      lrcFileName: fileName
    })
    message.success('歌词绑定与编辑已保存')
    setSelectedKey(fileName)
    setOpen(false)
  }

  return (
    <>
      {props.triggerType === 'link' ? (
        <Button type="link" icon={<EditOutlined />} onClick={() => setOpen(true)} disabled={!currentMusic?.id}>
          {props.triggerLabel || '歌词管理'}
        </Button>
      ) : (
        <Button
          icon={<EditOutlined />}
          onClick={() => setOpen(true)}
          disabled={!currentMusic?.id}
        >
          {props.triggerLabel || '歌词管理'}
        </Button>
      )}
      <Modal
        title="歌词管理"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleSave}
        okText="保存"
        cancelText="取消"
        width={760}
      >
        <section className="lyrics-manager">
          <section className="manager-header">
            <p className="manager-title">{currentMusic?.name || '未选择歌曲'}</p>
            <p className="manager-subtitle">{currentMusic?.artist || '未知歌手'} · {currentMusic?.album || '未命名专辑'}</p>
          </section>
          <section className="manager-row">
            <p className="manager-label">绑定已有歌词</p>
            <Select
              allowClear
              showSearch
              placeholder="选择本地歌词文件"
              value={selectedKey || undefined}
              onChange={handleSelectChange}
              onClear={() => setSelectedKey('')}
              options={lrcOptions}
            />
          </section>
          <section className="manager-row">
            <section className="manager-row-header">
              <p className="manager-label">歌词内容</p>
              <section className="manager-actions">
                <Button type={saveAsCopy ? "primary" : "default"} ghost={saveAsCopy} onClick={() => setSaveAsCopy(!saveAsCopy)}>
                  {saveAsCopy ? '当前将另存为副本' : '保存为当前歌曲副本'}
                </Button>
                <Button type="link" onClick={handleUnbind} disabled={!currentMusic?.lrcKey && !selectedKey}>
                  解除绑定
                </Button>
              </section>
            </section>
            <TextArea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={16}
              placeholder="支持直接粘贴或修改歌词内容，保存后会自动绑定到当前歌曲"
            />
          </section>
          <p className="manager-tip">
            选择已有歌词后可以直接编辑其内容；开启“保存为当前歌曲副本”后，会复制一份专属歌词并绑定给当前歌曲，避免影响其他歌曲。
          </p>
        </section>
      </Modal>
    </>
  )
})

export default LyricsManager
