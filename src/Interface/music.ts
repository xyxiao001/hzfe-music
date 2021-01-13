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
  lrc: string
  // 真实歌曲
  music?: Blob  
}
