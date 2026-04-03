import React from 'react';
import { Button, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import './index.scss'
import { supportMusicFormat, supportMusicLrcFormat } from '../../config'
import { handleUpload } from '../../utils/upload'

const UploadFile = () => {
  
  const acceptStr = (): string => {
    let arr = supportMusicFormat.concat(supportMusicLrcFormat)
    arr = arr.map((item: string) => {
      item = `.${item}`
      return item
    })
    return arr.join(',')
  }

  return (
    <section className="page-upload">
      <section className="upload-line">
        <Upload beforeUpload={handleUpload} showUploadList={false} accept={acceptStr()} multiple>
          <Button type="primary" icon={<UploadOutlined />}>上传歌曲或歌词</Button>
        </Upload>
        <p className="tips">
          <span>支持歌曲格式 { supportMusicFormat.join('，')}</span>
          <span>支持歌词格式 { supportMusicLrcFormat.join('，')}</span>
        </p>
      </section>
    </section>
  );
}

export default UploadFile
