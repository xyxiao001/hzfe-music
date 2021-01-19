import { iterate } from "localforage";

// 歌曲储存信息
export interface InterfaceMusicInfo {
  // 歌曲名
  name: string
  // 专辑名
  album: string
  // 专辑主导艺人
  albumartist: string
  // 专辑艺人
  artist: string
  // 专辑艺人列表
  artists: string[]
  // 专辑备注: 
  comment: string[]
  // 歌曲时间
  date: string
  // 歌曲图片
  picture: string[]
  // 编码方式
  codec: string
  // 歌曲时长
  duration: number
  // 歌曲采样率
  sampleRate: string
  // 对应的歌词信息
  lrc?: string
  // 对应的歌词hash 值，用作查询关联
  lrcHash?: string
  // 真实歌曲
  music?: Blob,
  // 歌曲流 hash 值，用于查询歌曲流
  musicHash?: string 
}

// 歌词信息
export interface InterfaceLrc {
  // 歌词
  text: string
  // 触发时间
  time: number
}

// 逐字歌词信息
export interface InterfaceLrcWord {
  // 歌词
  text: string
  start: number
  end: number
}

// 歌曲播放信息状态储存
export interface InterfaceMusicPlayingInfo {
  // 是否处于播放中
  playing: boolean
  // 歌曲总时间
  duration: number
  // 歌曲正在播放时间
  currentTime: number
}