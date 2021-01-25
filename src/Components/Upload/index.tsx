import React from 'react';
import { loadFile, transformMusicInfo } from '../../utils';
import * as musicMetadata from 'music-metadata-browser'
import localforage from 'localforage'
import { Button, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import './index.scss'
import { supportMusicFormat, supportMusicLrcFormat } from '../../config'

const UploadFile = () => {
  
  const acceptStr = (): string => {
    let arr = supportMusicFormat.concat(supportMusicLrcFormat)
    arr = arr.map((item: string) => {
      item = `.${item}`
      return item
    })
    return arr.join(',')
  }

  const fileUpload = async (event: any) => {
    event.persist()
    let blob = null
    let result = null
    try {
      blob = await loadFile(event.target.files[0], true)
      result = await musicMetadata.parseBlob(blob)
      const transformData = transformMusicInfo(result)
      localforage.setItem('music', transformData)
      console.log(transformData, blob)
      localforage.setItem('musicData', blob)
    } catch (error) {
      result = await loadFile(event.target.files[0], false)
      // 把数据先本地
      localforage.setItem('musicLrc', result)
    }
  }

  const handleUpload = (File: File): boolean => {
    console.log(File, File.name)
    // 这里处理我们文件的存储
    return false
  }

  return (
    <section className="page-upload">
      <section className="upload-line">
        <Upload beforeUpload={handleUpload} showUploadList={false} accept={acceptStr()} multiple>
          <Button icon={<UploadOutlined />}>点击上传本地歌曲或者歌词</Button>
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