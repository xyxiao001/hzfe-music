import React, { useEffect, useState } from "react"
import { Button, Input, Modal, message } from "antd"
import { EditOutlined } from "@ant-design/icons"
import { observer } from "mobx-react-lite"
import { InterfaceLrcInfo } from "../../Interface/music"
import common from "../../store/common"
import './index.scss'

const { TextArea } = Input

const LyricsLibraryEditor = observer((props: {
  lyric: InterfaceLrcInfo
  triggerType?: 'default' | 'link'
}) => {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState(props.lyric.content)

  useEffect(() => {
    if (!open) return
    setContent(props.lyric.content)
  }, [open, props.lyric.content])

  const handleSave = async () => {
    const value = content.trim()
    if (!value) {
      message.warning('歌词内容不能为空')
      return
    }
    await common.saveLrcContent({
      fileName: props.lyric.fileName,
      content: value
    })
    message.success('歌词已更新')
    setOpen(false)
  }

  return (
    <>
      {props.triggerType === 'link' ? (
        <Button type="link" icon={<EditOutlined />} onClick={() => setOpen(true)}>编辑歌词</Button>
      ) : (
        <Button icon={<EditOutlined />} onClick={() => setOpen(true)}>编辑歌词</Button>
      )}
      <Modal
        title={props.lyric.fileName}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleSave}
        okText="保存"
        cancelText="取消"
        width={720}
      >
        <section className="lyrics-library-editor">
          <p className="lyrics-library-tip">修改后会同步影响所有绑定到这份歌词的歌曲。</p>
          <TextArea
            rows={18}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="编辑歌词内容"
          />
        </section>
      </Modal>
    </>
  )
})

export default LyricsLibraryEditor
