import React, { useState } from 'react';
import { Button, Input, Modal, Upload, message } from 'antd';
import { CloudDownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import './index.scss'
import { supportMusicFormat, supportMusicLrcFormat } from '../../config'
import { handleUpload, importRemoteAssets } from '../../utils/upload'
import upload from '../../store/upload';

const UploadFile = observer(() => {
  const [open, setOpen] = useState(false)
  const [musicUrl, setMusicUrl] = useState('')
  const [musicFileName, setMusicFileName] = useState('')
  const [lrcUrl, setLrcUrl] = useState('')
  const [lrcFileName, setLrcFileName] = useState('')
  const [importing, setImporting] = useState(false)
  
  const acceptStr = (): string => {
    let arr = supportMusicFormat.concat(supportMusicLrcFormat)
    arr = arr.map((item: string) => {
      item = `.${item}`
      return item
    })
    return arr.join(',')
  }

  const resetRemoteFields = () => {
    setMusicUrl('')
    setMusicFileName('')
    setLrcUrl('')
    setLrcFileName('')
  }

  const handleRemoteImport = async () => {
    setImporting(true)
    try {
      const count = await importRemoteAssets({
        musicUrl,
        musicFileName,
        lrcUrl,
        lrcFileName
      })
      message.success(`已加入 ${count} 个远程文件到导入队列`)
      resetRemoteFields()
      setOpen(false)
    } catch (error: unknown) {
      if (error instanceof Error && error.message) {
        message.warning(error.message)
      } else {
        message.warning('链接导入失败')
      }
    } finally {
      setImporting(false)
    }
  }

  return (
    <>
      <section className="page-upload">
        <section className="upload-line">
          <section className="upload-actions">
            <Upload beforeUpload={handleUpload} showUploadList={false} accept={acceptStr()} multiple>
              <Button type="primary" icon={<UploadOutlined />}>上传歌曲或歌词</Button>
            </Upload>
            <Button icon={<CloudDownloadOutlined />} onClick={() => setOpen(true)}>
              通过链接导入
            </Button>
          </section>
          {upload.isUploading ? <p className="status">正在写入本地资料库，请稍候…</p> : null}
          <p className="tips">
            <span>支持歌曲格式 { supportMusicFormat.join('，')}</span>
            <span>支持歌词格式 { supportMusicLrcFormat.join('，')}</span>
            <span>链接导入依赖远端地址支持浏览器跨域读取。</span>
          </p>
        </section>
      </section>
      <Modal
        title="通过 CDN 链接导入"
        open={open}
        onCancel={() => {
          if (importing) return
          setOpen(false)
        }}
        onOk={handleRemoteImport}
        okText="开始导入"
        cancelText="取消"
        confirmLoading={importing}
      >
        <section className="upload-remote-form">
          <section className="form-item">
            <p className="label">歌曲链接</p>
            <Input
              placeholder="https://cdn.example.com/music/song.mp3"
              value={musicUrl}
              onChange={(event) => setMusicUrl(event.target.value)}
            />
          </section>
          <section className="form-item">
            <p className="label">歌曲文件名</p>
            <Input
              placeholder="可选，例如：周杰伦-七里香.mp3"
              value={musicFileName}
              onChange={(event) => setMusicFileName(event.target.value)}
            />
          </section>
          <section className="form-item">
            <p className="label">歌词链接</p>
            <Input
              placeholder="https://cdn.example.com/lrc/song.lrc"
              value={lrcUrl}
              onChange={(event) => setLrcUrl(event.target.value)}
            />
          </section>
          <section className="form-item">
            <p className="label">歌词文件名</p>
            <Input
              placeholder="可选，例如：周杰伦-七里香.lrc"
              value={lrcFileName}
              onChange={(event) => setLrcFileName(event.target.value)}
            />
          </section>
          <p className="remote-tip">如果链接本身没有明确后缀，建议补充文件名，便于识别格式并建立本地索引。</p>
        </section>
      </Modal>
    </>
  );
})

export default UploadFile
