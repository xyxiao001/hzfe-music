# HZFE-MUSIC

一个基于 React 19 + Vite + TypeScript 的本地音乐资料库应用，聚焦本地音乐上传、歌词管理、专辑浏览和沉浸式播放体验。

## 项目特性

- 本地音乐库：上传歌曲和歌词文件，数据持久化保存在浏览器本地
- 专辑视图：按专辑聚合歌曲，适合快速浏览本地收藏
- 歌曲管理：查看歌曲详情、编辑歌曲名/歌手/专辑信息
- 歌词管理：支持绑定已有歌词、手动编辑歌词、另存为当前歌曲副本、解除绑定
- 自动关联：按文件名规则自动尝试关联歌曲与歌词
- 播放体验：支持播放队列、进度拖拽、歌词联动、主题色跟随封面变化
- 状态恢复：刷新页面后可恢复上次播放状态

## 技术栈

- React 19
- TypeScript
- Vite 8
- Ant Design 6
- MobX 6
- Howler
- localForage
- music-metadata

## 安装与运行

推荐使用 pnpm。

```bash
pnpm install
pnpm dev
```

其他可用脚本：

```bash
pnpm test
pnpm build
pnpm preview
```

## 支持的文件格式

### 音乐格式

`mp3`、`ogg`、`wav`、`aac`、`flac`、`dolby`、`opus`、`webm`、`alac`

### 歌词格式

`lrc`、`txt`

## 主要页面

### 本地资料库

- 专辑：按专辑聚合展示本地音乐
- 歌曲：查看歌曲列表并进行播放、编辑、歌词管理
- 歌词：查看本地歌词库

### 播放器

- 大小播放器切换
- 当前播放队列查看
- 逐字歌词 / 普通歌词展示
- 封面主色动态驱动播放器氛围色

## 音频信息读取

| 属性 | 含义 | 来源 |
| ---- | ---- | ---- |
| name | 歌曲名 | common.title |
| album | 专辑名 | common.album |
| albumartist | 专辑主导艺人 | common.albumartist |
| artist | 专辑艺人 | common.artist |
| artists | 专辑艺人列表 | common.artists |
| comment | 专辑备注 | common.comment |
| date | 发行时间 | common.date |
| picture | 封面图片列表 | common.picture |
| codec | 编码方式 | format.codec |
| duration | 时长 | format.duration |
| sampleRate | 采样率 | common.sampleRate |

## 本地存储设计

项目使用 `localforage` 做浏览器侧持久化存储，核心数据结构如下：

### music-list

歌曲信息列表，核心字段包括：

```ts
{
  name: string
  album: string
  albumartist: string
  artist: string
  artists: string[]
  comment: string[]
  date: string
  picture: string[]
  codec: string
  duration: number
  sampleRate: string
  lrc: string
  lrcKey?: string
  music?: Blob
  id?: string
}
```

### 以歌曲 id 为 key 的音频 Blob

用于存储真实歌曲文件流，列表元信息和音频二进制分离保存，便于按需读取。

### music-lrc-list

本地歌词库，保存歌词文件名、歌词内容等信息，并可与歌曲做绑定关系。

### last-music-state

保存最近一次播放歌曲、播放进度、播放模式等信息，用于页面刷新后的状态恢复。

## 设计说明

- 当前项目以“本地音乐管理 + 本地播放”为核心，不依赖服务端音频解析能力
- 上传文件后会读取音频元信息，并将歌曲与歌词存入浏览器本地数据库
- 播放时直接读取本地持久化的音频 Blob
- 歌词既可以从已有歌词库中绑定，也可以针对当前歌曲单独编辑保存

## 目录结构

```text
src/
  Components/            UI 组件与播放器模块
  Home/                  首页
  Local/                 本地资料库页面
  Interface/             类型定义
  store/                 MobX 状态管理
  utils/                 上传、存储、格式化等工具
```
