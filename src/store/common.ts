import { makeAutoObservable } from 'mobx';
import { InterfaceLrcInfo, InterfaceMusicInfo, InterfaceMusicPlayingInfo } from '../Interface/music';
import { Howl } from 'howler'
import { getLastMusicState, getLastPlayType, getLrcList, getMusicInfoFromLocal, getMusicList, removeLastMusicState, removeLrc, removeMusic, setLastMusicState, setLastPlayType, updateMusicLrcBinding, updateMusicMeta, upsertLrc } from '../utils/local';
import { getFormatCode } from '../utils';
import { cloneDeep } from 'lodash';
import { message } from 'antd'
import { EnumPlayingType } from '../utils/enmus';

class Common {
  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  playingType: `${EnumPlayingType}` = EnumPlayingType.loop

  updatePlayingType (type: `${EnumPlayingType}`) {
    // 切换当前播放状态 顺序播放 -> 单曲循环 -> 随机播放 -> 顺序播放
    const nextType = type === EnumPlayingType.loop ? EnumPlayingType.single : type === EnumPlayingType.single ? EnumPlayingType.random : EnumPlayingType.loop
    setLastPlayType(nextType)
    this.playingType = nextType
  }

  setPlayingType (type: `${EnumPlayingType}`) {
    this.playingType = type
  }


  preUrl: string = ''

  updatePreUrl (url: string) {
    this.preUrl = url
  }

  preImgUrl: string[] = []

  shouldAutoPlay = true

  resumeTime = 0

  updatePreImgUrl (url: string) {
    if (!url.startsWith('blob:')) return
    this.preImgUrl.push(url)
    if (this.preImgUrl.length >= 5) {
      URL.revokeObjectURL(this.preImgUrl.shift() as string)
    }
  }
  
  // 音乐播放实例
  musicPlayer: Howl | null = null

  musicInfoRequestToken = 0

  selectMusic (id: string, options?: { autoplay?: boolean, currentTime?: number }) {
    if (!id) return
    this.destroyPlayer()
    this.musicInfo = null
    this.musicInfoRequestToken += 1
    this.shouldAutoPlay = options?.autoplay ?? true
    this.resumeTime = options?.currentTime ?? 0
    this.updatedMusicData({
      id,
      currentTime: options?.currentTime ?? 0,
      duration: 0,
      playing: false,
      change: false
    })
  }

  persistLastMusicState (data?: Partial<{ id: string, currentTime: number, min: boolean }>) {
    const id = data?.id ?? this.musicData.id
    if (!id) {
      removeLastMusicState()
      return
    }
    setLastMusicState({
      id,
      currentTime: data?.currentTime ?? Number(this.musicPlayer?.seek() || this.musicData.currentTime || 0),
      min: data?.min ?? this.musicData.min
    })
  }

  hydratePlayerState = async () => {
    const [playType] = await Promise.all([
      getLastPlayType(),
      this.updateLocalMusicList(),
      this.updateLocalMusicLrcList()
    ])
    this.setPlayingType(playType)
    const lastMusicState = await getLastMusicState()
    if (!lastMusicState) return
    const target = this.localMusicList.find(item => item.id === lastMusicState.id)
    if (!target?.id) {
      removeLastMusicState()
      return
    }
    this.shouldAutoPlay = false
    this.resumeTime = lastMusicState.currentTime || 0
    this.updatedMusicData({
      id: target.id,
      currentTime: lastMusicState.currentTime || 0,
      min: lastMusicState.min,
      playing: false,
      change: false
    })
  }

  createdPlayer () {
    if (this.musicInfo && this.musicInfo.music) {
      this.updatedMusicData({
        playing: false,
      })
      const url = URL.createObjectURL(this.musicInfo.music)
      if (this.preUrl) {
        URL.revokeObjectURL(this.preUrl)
      }
      this.updatePreUrl(url)
      this.updatePreImgUrl(this.musicInfo.pictureUrl || '')
      const shouldAutoPlay = this.shouldAutoPlay
      const resumeTime = this.resumeTime
      this.musicPlayer = new Howl({
        autoplay: false,
        src: url,
        html5: true,
        format: [getFormatCode(this.musicInfo.codec.toLowerCase() || String(this.musicInfo.fileType).toLowerCase())],
        volume: 1,
        onload: () => {
          const duration = Number(this.musicPlayer?.duration() || 0)
          const nextTime = Math.min(resumeTime, duration || resumeTime || 0)
          if (nextTime > 0) {
            this.musicPlayer?.seek(nextTime)
          }
          this.updatedMusicData({
            currentTime: nextTime,
            duration,
            playing: false
          })
          if (shouldAutoPlay) {
            this.musicPlayer?.play()
          }
          this.resumeTime = 0
          this.shouldAutoPlay = true
        },
        onplay: this.handlePlay,
        onpause: this.handlePause,
        onend: this.handleEnd,
        onstop: this.handleStop
      })
      const navigator: any = window.navigator
      if (navigator.mediaSession) {
        navigator.mediaSession.setActionHandler('play', () => {
          this.musicPlayer?.play()
        })
        navigator.mediaSession.setActionHandler('pause', () => {
          this.musicPlayer?.pause()
        })
        navigator.mediaSession.setActionHandler('stop', () => {
          this.musicPlayer?.stop()
        })
        navigator.mediaSession.setActionHandler('seekto', (evt: any) => {
          const currentTime = Number(evt.seekTime)
          this.musicPlayer?.seek(currentTime)
        })
        navigator.mediaSession.setActionHandler('seekbackward', (evt: any) => {
          this.updatedMusicData({
            change: true
          })
          const currentTime = Number(this.musicPlayer?.seek()) - 10
          this.musicPlayer?.seek(currentTime)
          this.updatedMusicData({
            change: false
          })
        });
        navigator.mediaSession.setActionHandler('seekforward', (evt: any) => {
          this.updatedMusicData({
            change: true
          })
          const currentTime = Number(this.musicPlayer?.seek()) + 10
          this.musicPlayer?.seek(currentTime)
          this.updatedMusicData({
            change: false
          })
        });
        navigator.mediaSession.setActionHandler('previoustrack', this.handlePreMusic);
        navigator.mediaSession.setActionHandler('nexttrack', this.handleNextMusic);
      }
    }
  }

  handlePlay = () => {
    console.log('歌曲播放了', this.musicInfo?.name);
    this.updatedMusicData({
      currentTime: this.musicPlayer?.seek(),
      duration: this.musicPlayer?.duration(),
      playing: true,
      change: false
    })
    if (this.musicInfo && !this.musicInfo.duration) {
      this.musicInfo.duration = Number(this.musicPlayer?.duration())
    }
    const navigator: any = window.navigator
    const MediaMetadata = window.MediaMetadata
    if (navigator.mediaSession && this.musicInfo){
      navigator.mediaSession.metadata = new MediaMetadata({
        title: this.musicInfo.name,
        artist: this.musicInfo.artist,
        album: this.musicInfo.album,
        artwork: [{
          src: this.musicInfo.picture[0] || this.musicInfo.pictureUrl || '',
          type: 'image/jpeg',
          sizes: '512x512'
        }]
      });
    }
  }

  handlePause = () => {
    console.log('歌曲暂停了')
    this.updatedMusicData({
      currentTime: this.musicPlayer?.seek(),
      playing: false,
    })
    this.persistLastMusicState()
  }

  handleEnd = () => {
    this.updatedMusicData({
      currentTime: this.musicPlayer?.seek(),
      playing: false,
    })
    this.persistLastMusicState({
      currentTime: Number(this.musicPlayer?.seek() || 0)
    })
    requestAnimationFrame(this.handlePlaying)
    console.log('歌曲播放完了')
    this.handleNextMusic(false)
  }

  handleStop = () => {
    console.log('歌曲停止')
    this.updatedMusicData({
      currentTime: this.musicPlayer?.seek(),
      playing: false,
    })
    this.persistLastMusicState()
  }

  handlePlaying = () => {
    if (!this.musicData.change && this.musicPlayer?.playing()) {
      this.updatedMusicData({
        type: 'update',
        currentTime: this.musicPlayer.seek()
      })
      const navigator: any = window.navigator
      if (navigator.mediaSession && this.musicPlayer) {
        navigator.mediaSession.setPositionState({
          duration: Number(this.musicPlayer.duration()),
          playbackRate: 1,
          position: this.musicPlayer.seek()
        })
      }
      requestAnimationFrame(this.handlePlaying)
    }
  }

  destroyPlayer () {
    this.musicPlayer?.unload()
    this.musicPlayer = null
  }


  musicInfo: InterfaceMusicInfo | null = null

  updatedMusicInfo (data: InterfaceMusicInfo) {
    data.pictureUrl = data.pictureUrl || data.picture[0] || '/images/music-no.jpeg'
    this.musicInfo = data
  }

  loadMusicInfo = async (id: string) => {
    if (!id) return null
    const requestToken = this.musicInfoRequestToken
    const info = await getMusicInfoFromLocal(id).catch(() => null)
    if (!info || this.musicData.id !== id || requestToken !== this.musicInfoRequestToken) {
      return null
    }
    this.updatedMusicInfo(info)
    return info
  }

  resetPlayback () {
    this.destroyPlayer()
    this.musicInfo = null
    this.resumeTime = 0
    this.shouldAutoPlay = true
    this.musicData = {
      ...this.musicData,
      id: '',
      playing: false,
      duration: 0,
      currentTime: 0,
      change: false
    }
    removeLastMusicState()
  }
  
 

  // 当前音乐播放的数据
  musicData: InterfaceMusicPlayingInfo  = {
    id: '',
    playing: false,
    duration: 0,
    currentTime: 0,
    change: false,
    min: true
  }

  updatedMusicData (data: any) {
    if (data.type === 'update') {
      this.musicData.currentTime = data.currentTime
      return
    }
    // 判断 body 样式
    if (data.hasOwnProperty('min')) {
      if (data.min) {
        document.body.classList.remove('dialog-screen')
      } else {
        document.body.classList.add('dialog-screen')
      }
    }
    if (!data.change) {
      setTimeout(() => {
        // requestAnimationFrame(this.handlePlaying)
        this.handlePlaying()
      }, 100)
    }
    this.musicData = {
      ...this.musicData,
      ...data
    }
    if (data.hasOwnProperty('id') || data.hasOwnProperty('min')) {
      this.persistLastMusicState({
        id: this.musicData.id,
        currentTime: this.musicData.currentTime,
        min: this.musicData.min
      })
    }
  }

  // 播放器状态
  musicPlayerStats = {
    // 播放器循环状态  单曲播放 single, 随机 random 顺序播放 order
    loop: 'random'
  }
  
  // 播放下一首，上一首功能实现
  musicPlayList: InterfaceMusicInfo[] = []

  updateMusicPlayList = (list: InterfaceMusicInfo[]) => {
    this.musicPlayList = list
  }

  // 歌曲播放下一首, 如果是手动切换的，那么还是需要切换到下一首
  handleNextMusic = (isControl = true) => {
    if (this.musicPlayer) {
      this.musicPlayer.stop()
    }
    // 如果是单曲循环
    if (this.playingType === EnumPlayingType.single && !isControl) {
      this.musicPlayer?.play()
      return
    }
    // 随机播放
    if (this.playingType === EnumPlayingType.random && this.musicPlayList.length > 2) {
      const randomIndex = Math.floor(Math.random() * this.musicPlayList.length)
      this.selectMusic(this.musicPlayList[randomIndex].id || '')
      return
    }
    let cur = 0
    const len = this.musicPlayList.length - 1
    while (cur < this.musicPlayList.length) {
      if (this.musicPlayList[cur].id === this.musicData.id) {
        break
      }
      cur++
    }
    // 防止超出下一首
    let next = cur + 1
    next = next > len ? (next - len) - 1 : next
    if (this.musicPlayList[next].id === this.musicData.id) {
      this.musicPlayer?.play()
    } else {
      this.selectMusic(this.musicPlayList[next].id || '')
    }
  }

  // 歌曲播放上一首
  handlePreMusic = (isControl = true) => {
    if (this.musicPlayer) {
      this.musicPlayer.stop()
    }
    // 如果是单曲循环
    if (this.playingType === EnumPlayingType.single && !isControl) {
      this.musicPlayer?.play()
      return
    }
    // 随机播放
    if (this.playingType === EnumPlayingType.random && this.musicPlayList.length > 2) {
      const randomIndex = Math.floor(Math.random() * this.musicPlayList.length)
      this.selectMusic(this.musicPlayList[randomIndex].id || '')
      return
    }
    let cur = 0
    const len = this.musicPlayList.length - 1
    while (cur < this.musicPlayList.length) {
      if (this.musicPlayList[cur].id === this.musicData.id) {
        break
      }
      cur++
    }
    // 防止低于 0
    let pre = cur - 1
    pre = pre < 0 ? len : pre
    if (this.musicPlayList[pre].id === this.musicData.id) {
      this.musicPlayer?.play()
    } else {
      this.selectMusic(this.musicPlayList[pre].id || '')
    }
  }

  // 本地音乐展示列表
  localMusicList: InterfaceMusicInfo[] = []
  localMusicLoading: boolean = false
  localAlbumMap: Map<string, InterfaceMusicInfo[]> = new Map()

  // 专辑生成说明，歌曲列表根据专辑的名称集合数组
  updateLocalAlbumList = () => {
    const map = new Map()
    this.localMusicList.forEach(item => {
      if (item.album === '') return
      const target = map.get(item.album) ?? []
      map.set(item.album, [...target, item])
    })
    this.localAlbumMap = map
  }

  updateLocalMusicList = async () => {
    this.localMusicLoading = true
    this.localMusicList = await getMusicList()
    // 用来做播放列表更新
    this.updateMusicPlayList(cloneDeep(this.localMusicList))
    this.updateLocalAlbumList()
    this.localMusicLoading = false
  }

  // 删除歌曲, 操作列表删除当前歌曲，同时删除歌曲文件流
  deleteMusic = async (id: string) => {
    try {
      await removeMusic(id)
      if (this.musicData.id === id) {
        this.resetPlayback()
      }
      message.success('删除成功')
      this.updateLocalMusicList()
    } catch (error) {
      console.log(error)
      message.error('删除失败')
    }
  }


  // 本地歌词展示列表
  localMusicLrcList: InterfaceLrcInfo[] = []
  localMusicLrcLoading: boolean = false

  updateLocalMusicLrcList = async () => {
    this.localMusicLrcLoading = true
    this.localMusicLrcList = await getLrcList()
    this.localMusicLrcLoading = false
  }

  refreshCurrentMusicInfo = async () => {
    if (!this.musicData.id) return
    await this.loadMusicInfo(this.musicData.id)
  }

  saveMusicLrcBinding = async (payload: {
    musicId: string
    lrcKey?: string
    lrcContent?: string
    lrcFileName?: string
  }) => {
    const { musicId, lrcKey, lrcContent, lrcFileName } = payload
    if (lrcContent && lrcFileName) {
      await upsertLrc({
        content: lrcContent,
        fileName: lrcFileName,
        fileType: 'lrc',
        fileSize: `${new Blob([lrcContent]).size} B`,
        size: new Blob([lrcContent]).size
      })
    }
    await updateMusicLrcBinding(musicId, lrcKey)
    await Promise.all([
      this.updateLocalMusicList(),
      this.updateLocalMusicLrcList()
    ])
    if (this.musicData.id === musicId) {
      await this.refreshCurrentMusicInfo()
    }
  }

  saveLrcContent = async (payload: {
    fileName: string
    content: string
  }) => {
    const { fileName, content } = payload
    await upsertLrc({
      content,
      fileName,
      fileType: 'lrc',
      fileSize: `${new Blob([content]).size} B`,
      size: new Blob([content]).size
    })
    await this.updateLocalMusicLrcList()
    if (this.musicData.id && this.musicInfo?.lrcKey === fileName) {
      await this.refreshCurrentMusicInfo()
    }
  }

  saveMusicMeta = async (payload: {
    musicId: string
    name: string
    artist: string
    album: string
  }) => {
    await updateMusicMeta(payload.musicId, {
      name: payload.name,
      artist: payload.artist,
      album: payload.album,
      albumartist: payload.artist
    })
    await this.updateLocalMusicList()
    if (this.musicData.id === payload.musicId) {
      await this.refreshCurrentMusicInfo()
    }
  }

  // 删除歌曲, 操作列表删除当前歌曲，同时删除歌曲文件流
  deleteLrc = async (id: string) => {
    try {
      await removeLrc(id)
      message.success('删除成功')
      this.updateLocalMusicLrcList()
      this.updateLocalMusicList()
      if (this.musicData.id) {
        this.refreshCurrentMusicInfo()
      }
    } catch (error) {
      console.log(error)
      message.error('删除失败')
    }
  }

  // 音乐播放时修改全局主题色
  musicColor = '#ff375f'

  updateMusicColor = (color: string) => {
    this.musicColor = color
    document.documentElement.style.setProperty('--primary-color', color)
  }
}


const common = new Common()


 
export default common
