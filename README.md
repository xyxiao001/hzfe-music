# HZFE-MUSIC

## 音频信息读取
  |  属性   | 含义  |  来源  |     
  |  ----  | ----  | ----  |
  | name | 歌曲名 | common.title   |
  | album  | 专辑名 | common.album   |
  | albumartist  | 专辑主导艺人 | common.albumartist   |
  | artist  | 专辑艺人 | common.artist   |
  | artists  | 专辑艺人列表 | common.artists   |
  | comment | 专辑备注 | common.comment   |
  | date  | 歌曲时间 | common.date   |
  | picture  | 歌曲图片列表 | common.picture   |
  | codec  | 编码方式 | format.codec  |
  | duration | 歌曲时间 | format.duration  |
  | SampleRate  | 歌曲采样率 | common.sampleRate  (khz / 100)  |
  | album  | 专辑名 | common.album   |

## 数据存储设计
### musicList 歌曲信息列表
```
  储存方式 -> 列表
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
  lrcHash: string
  // 真实歌曲
  music?: Blob
  // 歌曲流 hash 值，用于查询歌曲流
  musicHash?: string 
```

### music-hash 歌曲信息列表
```
  具体歌曲流存放地址    music +  文件名生成的 hash 值

```

### lrc-hash 歌词信息表
```
 歌词文本存放， 和 music 里面的 hash 值做对应

```