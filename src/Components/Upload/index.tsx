import React from 'react';
import { loadFile, transformMusicInfo } from '../../utils';
import * as musicMetadata from 'music-metadata-browser'
import { Button, message, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import './index.scss'
import { supportMusicFormat, supportMusicLrcFormat } from '../../config'
import filesize from 'filesize'
import { InterfaceMusicInfo } from '../../Interface/music';
import { addLrc } from '../../utils/local';

const UploadFile = () => {
  
  const acceptStr = (): string => {
    let arr = supportMusicFormat.concat(supportMusicLrcFormat)
    arr = arr.map((item: string) => {
      item = `.${item}`
      return item
    })
    return arr.join(',')
  }

  const handleUpload = (File: File): boolean => {
    const nameList = File.name.split('.')
    const FileType = nameList[nameList.length - 1]
    const FileName = File.name.replace(`.${FileType}`, '')
    // 这里处理我们文件的存储
    if (supportMusicFormat.includes(FileType)) {
      console.log('当前是音频文件处理', FileName, FileType)
      handleMusicData(File)
      return false
    }

    if (supportMusicLrcFormat.includes(FileType)) {
      console.log('当前是歌词文件处理', FileName, FileType)
      handleMusicLrc(File)
      return false
    }
    message.warning(`目前还不支持处理${FileType}这种类型文件，${FileName}`)
    return false
  }

  // 音频文件处理
  const handleMusicData = async (File: File) => {
    // console.log(File, filesize(File.size))
    const nameList = File.name.split('.')
    const FileType = nameList[nameList.length - 1]
    const FileName = File.name.replace(`.${FileType}`, '')
    let blob:Blob
    let result
    try {
      blob = await loadFile(File, true)
      result = await musicMetadata.parseBlob(blob)
    } catch (error) {
      message.warning(`目前还不支持处理${FileType}这种类型文件，${FileName}`)
      return
    }
    const data: InterfaceMusicInfo = transformMusicInfo(result)
    console.log(data, blob)
  }

  // 歌词文件处理
  const handleMusicLrc = async (File: File) => {
    const nameList = File.name.split('.')
    const fileType = nameList[nameList.length - 1]
    const fileName = File.name.replace(`.${fileType}`, '')
    let result = ''
    try {
      result = await loadFile(File, false)
    } catch (error) {
      message.warning(`目前还不支持处理${fileType}这种类型文件，${fileName}`)
      return
    }
    addLrc({
      content: result,
      fileName,
      fileType,
      size: File.size,
      fileSize: filesize(File.size)
    }).then(res => {
      console.log(res)
      message.success(`${File.name}  上传成功`)
    })
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