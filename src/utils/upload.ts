import { supportMusicFormat, supportMusicLrcFormat } from '../config'
import { loadFile, transformMusicInfo } from '../utils';
import filesize from 'filesize'
import { InterfaceMusicInfo } from '../Interface/music';
import { addLrc, addMusic } from '../utils/local';
import * as musicMetadata from 'music-metadata-browser'
import { message } from 'antd';
import common from '../store/common';
import upload from '../store/upload';
// import { MusicRelatedLrc } from "./local";


export const handleUpload = (File: File):boolean => {
  upload.addUploadTask(File)
  return false;
}

export const uploadRun = async (File: File) => {
  const nameList = File.name.split('.')
  const FileType = nameList[nameList.length - 1]
  const FileName = File.name.replace(`.${FileType}`, '')
  // 这里处理我们文件的存储
  if (supportMusicFormat.includes(FileType)) {
    console.log('当前是音频文件处理', FileName, FileType)
    await handleMusicData(File)
    return false
  }

  if (supportMusicLrcFormat.includes(FileType)) {
    console.log('当前是歌词文件处理', FileName, FileType)
    await handleMusicLrc(File)
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
  try {
    const data: InterfaceMusicInfo = transformMusicInfo(result)
    data.fileName = FileName
    data.fileType = FileType
    data.fileSize = filesize(File.size)
    data.size = File.size
    data.name = data.name || data.fileName || '未知歌曲'
    await addMusic(data, blob)
    message.success(`${File.name}  上传成功`)
    console.log(`${File.name}  上传成功`)
    common.updateLocalMusicList()
  } catch (error) {
    message.warning(error)
  }
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

  try {
    await addLrc({
      content: result,
      fileName,
      fileType,
      size: File.size,
      fileSize: filesize(File.size)
    })
    common.updateLocalMusicLrcList()
    message.success(`${File.name}  上传成功`)
    console.log(`${File.name}  上传成功`)
  } catch (error) {
    message.warning(error)
  }
}