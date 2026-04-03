import { supportMusicFormat, supportMusicLrcFormat } from '../config'
import { loadFile, transformMusicInfo } from '../utils';
import { filesize } from 'filesize'
import { InterfaceMusicInfo } from '../Interface/music';
import { addLrc, addMusic, autoBindMusicLrc } from '../utils/local';
import { parseBlob } from 'music-metadata'
import { message } from 'antd';
import common from '../store/common';
import upload from '../store/upload';
// import { MusicRelatedLrc } from "./local";

const musicMimeMap: Record<string, string> = {
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/aac': 'aac',
  'audio/flac': 'flac',
  'audio/x-flac': 'flac',
  'audio/opus': 'opus',
  'audio/webm': 'webm',
  'audio/mp4': 'aac',
  'audio/x-m4a': 'aac',
}

const lrcMimeMap: Record<string, string> = {
  'application/octet-stream': 'lrc',
  'text/plain': 'txt',
  'application/text': 'txt',
  'application/x-subrip': 'lrc',
  'application/lyrics': 'lrc',
}

const normalizeError = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message
  }
  if (typeof error === 'string' && error) {
    return error
  }
  return fallback
}

const decodeFileName = (value: string) => {
  try {
    return decodeURIComponent(value)
  } catch (error: unknown) {
    return value
  }
}

const sanitizeFileName = (value: string) => {
  return value
    .replace(/[?#].*$/, '')
    .split('/')
    .pop()
    ?.trim()
    .replace(/\s+/g, ' ') || ''
}

const splitFileName = (value: string) => {
  const target = sanitizeFileName(value)
  const index = target.lastIndexOf('.')
  if (index <= 0) {
    return {
      fileName: target,
      fileType: ''
    }
  }
  return {
    fileName: target.slice(0, index),
    fileType: target.slice(index + 1).toLowerCase()
  }
}

const getFileNameFromUrl = (url: string) => {
  try {
    const target = new URL(url)
    return decodeFileName(sanitizeFileName(target.pathname))
  } catch (error: unknown) {
    return decodeFileName(sanitizeFileName(url))
  }
}

const getMimeType = (contentType: string) => {
  return contentType.split(';')[0].trim().toLowerCase()
}

const resolveRemoteMeta = (
  url: string,
  customFileName: string | undefined,
  type: 'music' | 'lrc',
  contentType: string
) => {
  const fallbackName = type === 'music' ? `remote-music-${Date.now()}` : `remote-lyrics-${Date.now()}`
  const rawFileName = customFileName?.trim() || getFileNameFromUrl(url) || fallbackName
  const parsed = splitFileName(rawFileName)
  const mimeType = getMimeType(contentType)
  const allowList = type === 'music' ? supportMusicFormat : supportMusicLrcFormat
  const mimeMap = type === 'music' ? musicMimeMap : lrcMimeMap
  const inferredType = parsed.fileType || mimeMap[mimeType] || ''
  if (!allowList.includes(inferredType)) {
    const label = type === 'music' ? '歌曲' : '歌词'
    throw new Error(`${label}链接缺少可识别的文件后缀，请补充文件名，或确认链接返回了正确的 Content-Type`)
  }
  return {
    fileName: parsed.fileName || fallbackName,
    fileType: inferredType,
    displayName: `${parsed.fileName || fallbackName}.${inferredType}`
  }
}

const fetchRemoteBlob = async (url: string) => {
  let response: Response
  try {
    response = await fetch(url)
  } catch (error: unknown) {
    throw new Error('链接不可访问，或当前 CDN 不支持跨域读取')
  }
  if (!response.ok) {
    throw new Error(`远程文件下载失败（${response.status}）`)
  }
  return {
    blob: await response.blob(),
    contentType: response.headers.get('content-type') || ''
  }
}

const importMusicBlob = async (params: {
  blob: Blob
  fileName: string
  fileType: string
  size: number
  displayName: string
}) => {
  let result
  try {
    result = await parseBlob(params.blob)
  } catch (error: unknown) {
    throw new Error(`目前还不支持处理${params.fileType}这种类型文件，${params.fileName}`)
  }
  const data: InterfaceMusicInfo = transformMusicInfo(result)
  data.fileName = params.fileName
  data.fileType = params.fileType
  data.fileSize = filesize(params.size)
  data.size = params.size
  data.name = data.name || data.fileName || '未知歌曲'
  await addMusic(data, params.blob)
  const matchedCount = await autoBindMusicLrc({
    musicFileNames: [params.fileName]
  })
  message.success(`${params.displayName} 上传成功`)
  await common.updateLocalMusicList()
  if (matchedCount > 0) {
    message.success(`已为 ${data.name} 自动匹配歌词`)
  }
}

const importLrcContent = async (params: {
  content: string
  fileName: string
  fileType: string
  size: number
  displayName: string
}) => {
  await addLrc({
    content: params.content,
    fileName: params.fileName,
    fileType: params.fileType,
    size: params.size,
    fileSize: filesize(params.size)
  })
  const matchedCount = await autoBindMusicLrc({
    lrcFileNames: [params.fileName]
  })
  await Promise.all([
    common.updateLocalMusicLrcList(),
    common.updateLocalMusicList()
  ])
  message.success(`${params.displayName} 上传成功`)
  if (matchedCount > 0) {
    message.success(`已为 ${params.fileName} 自动匹配歌曲`)
  }
}

export const handleUpload = (File: File):boolean => {
  upload.addUploadTask(File)
  return false;
}

export const uploadRun = async (File: File) => {
  const nameList = File.name.split('.')
  const FileType = nameList[nameList.length - 1].toLowerCase();
  const FileName = File.name.replace(`.${FileType}`, '')
  // 这里处理我们文件的存储
  if (supportMusicFormat.includes(FileType)) {
    await handleMusicData(File)
    return false
  }

  if (supportMusicLrcFormat.includes(FileType)) {
    await handleMusicLrc(File)
    return false
  }
  message.warning(`目前还不支持处理${FileType}这种类型文件，${FileName}`)
  return false
}

export const importRemoteAssets = async (params: {
  musicUrl?: string
  musicFileName?: string
  lrcUrl?: string
  lrcFileName?: string
}) => {
  const musicUrl = params.musicUrl?.trim() || ''
  const lrcUrl = params.lrcUrl?.trim() || ''
  if (!musicUrl && !lrcUrl) {
    throw new Error('请至少填写一个歌曲或歌词链接')
  }
  let taskCount = 0
  if (musicUrl) {
    const { blob, contentType } = await fetchRemoteBlob(musicUrl)
    const meta = resolveRemoteMeta(musicUrl, params.musicFileName, 'music', contentType)
    upload.addTask(async () => {
      await importMusicBlob({
        blob,
        fileName: meta.fileName,
        fileType: meta.fileType,
        size: blob.size,
        displayName: meta.displayName
      })
    })
    taskCount += 1
  }
  if (lrcUrl) {
    const { blob, contentType } = await fetchRemoteBlob(lrcUrl)
    const meta = resolveRemoteMeta(lrcUrl, params.lrcFileName, 'lrc', contentType)
    upload.addTask(async () => {
      await importLrcContent({
        content: await blob.text(),
        fileName: meta.fileName,
        fileType: meta.fileType,
        size: blob.size,
        displayName: meta.displayName
      })
    })
    taskCount += 1
  }
  return taskCount
}


// 音频文件处理
const handleMusicData = async (File: File) => {
  const nameList = File.name.split('.')
  const FileType = nameList[nameList.length - 1]
  const FileName = File.name.replace(`.${FileType}`, '')
  let blob:Blob
  try {
    blob = await loadFile(File, true)
  } catch (error) {
    message.warning(`目前还不支持处理${FileType}这种类型文件，${FileName}`)
    return
  }
  try {
    await importMusicBlob({
      blob,
      fileName: FileName,
      fileType: FileType,
      size: File.size,
      displayName: File.name
    })
  } catch (error) {
    message.warning(normalizeError(error, `${File.name} 上传失败`))
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
    await importLrcContent({
      content: result,
      fileName,
      fileType,
      size: File.size,
      displayName: File.name
    })
  } catch (error) {
    message.warning(normalizeError(error, `${File.name} 上传失败`))
  }
}
