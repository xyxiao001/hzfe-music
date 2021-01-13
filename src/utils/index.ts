import { get } from "lodash"
import { InterfaceMusicInfo } from "../Interface/music"

// 上次文件转化函数
export const loadFile = async (file: File, isBuffer = true): Promise<any> => {
  if (!file) {
    return ''
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event: Event) => {
      const target = event.target as FileReader
      if (isBuffer) {
        resolve(target.result ? new Blob([target.result]) : null)
      } else {
        resolve(target.result)
      }
    }
    reader.onerror = reject
    // 转化为blob
    if (isBuffer) {
      reader.readAsArrayBuffer(file)
    } else {
      reader.readAsText(file)
    }
  })
}

// 格式化歌曲信息保存
export const transformMusicInfo = (obj: any): InterfaceMusicInfo => {
  const result: InterfaceMusicInfo = {
    // 歌曲名
    name: get(obj, 'common.title', ''),
    // 专辑名
    album: get(obj, 'common.album', ''),
    // 专辑主导艺人
    albumartist: get(obj, 'common.albumartist', ''),
    // 专辑艺人
    artist: get(obj, 'common.artist', ''),
    // 专辑艺人列表
    artists: get(obj, 'common.artists', []),
    // 专辑备注: 
    comment: get(obj, 'common.comment', []),
    // 歌曲时间
    date: get(obj, 'common.date', 0),
    // 歌曲图片
    picture: get(obj, 'common.picture', []).map((item: any) => {
      return `data:${item.format};base64,${uint8arrayToBase64(item.data)}`
    }),
    // 编码方式
    codec: get(obj, 'format.codec', ''),
    // 歌曲时长
    duration: get(obj, 'format.duration', 0),
    // 歌曲采样率
    sampleRate: get(obj, 'format.sampleRate', ''),
    // 对应的歌词信息 key
    lrc: ''
  }
  return result
}


export const uint8arrayToBase64  = (u8Arr: { length: any; subarray: (arg0: number, arg1: number) => any }): string => {
  let CHUNK_SIZE = 0x8000; //arbitrary number
  let index = 0;
  let length = u8Arr.length;
  let result = '';
  let slice;
  while (index < length) {
      slice = u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, length));
      result += String.fromCharCode.apply(null, slice);
      index += CHUNK_SIZE;
  }
  return btoa(result);
}