
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
  // 对应的歌词真正的信息
  lrc?: string,
  // 对应的歌词的名称
  lrcKey?: string
  // 真实歌曲
  music?: Blob
  // 歌曲流 hash 值，用于查询歌曲流
  id?: string 
  // 文件读取的信息
  fileName?: string
  fileType?: string
  fileSize?: string
  size?: number
}

export interface InterfaceLrcInfo {
  // 歌词详情
  content: string
  // 文件读取的信息
  fileName: string
  fileType: string
  fileSize: string,
  size: number
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
  id: string
  // 是否处于播放中
  playing: boolean
  // 歌曲总时间
  duration: number
  // 歌曲正在播放时间
  currentTime: number,
  // 当前是否处于变动中
  change: boolean,
  // 当前播放器状态
  min: boolean
}