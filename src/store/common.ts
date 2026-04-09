import { makeAutoObservable } from 'mobx';
import { InterfaceLrcInfo, InterfaceMusicInfo, InterfaceMusicPlayingInfo } from '../Interface/music';
import { Howl } from 'howler'
import { getLastMuted, getLastMusicState, getLastPlayType, getLastVolume, getLrcList, getMusicInfoFromLocal, getMusicList, removeLastMusicState, removeLrc, removeMusic, setLastMuted, setLastMusicState, setLastPlayType, setLastVolume, updateMusicLrcBinding, updateMusicMeta, upsertLrc } from '../utils/local';
import { getFormatCode } from '../utils';
import { cloneDeep } from 'lodash';
import { message } from 'antd'
import { EnumPlayingType } from '../utils/enmus';

class Common {
  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  playingType: `${EnumPlayingType}` = EnumPlayingType.loop

  volume = 1

  muted = false

  playbackErrorState = {
    consecutive: 0,
    lastMusicId: '',
    lastAt: 0,
    retried: false
  }

  resetPlaybackErrorState () {
    this.playbackErrorState = {
      consecutive: 0,
      lastMusicId: '',
      lastAt: 0,
      retried: false
    }
  }

  setMuted (muted: boolean) {
    const nextMuted = Boolean(muted)
    this.muted = nextMuted
    this.musicPlayer?.mute(nextMuted)
    void setLastMuted(nextMuted)
  }

  toggleMuted () {
    this.setMuted(!this.muted)
  }

  setVolume (volume: number) {
    const nextVolume = Math.max(0, Math.min(1, Number(volume)))
    this.volume = nextVolume
    this.musicPlayer?.volume(nextVolume)
    void setLastVolume(nextVolume)
    if (nextVolume === 0) {
      this.setMuted(true)
    } else if (this.muted) {
      this.setMuted(false)
    }
  }

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
    const [playType, volume, muted] = await Promise.all([
      getLastPlayType(),
      getLastVolume(),
      getLastMuted(),
      this.updateLocalMusicList(),
      this.updateLocalMusicLrcList()
    ])
    this.setPlayingType(playType)
    this.volume = volume
    this.muted = muted
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

  handlePlayerError = (type: 'load' | 'play', soundId?: number, errorCode?: unknown) => {
    const currentId = this.musicData.id
    if (!currentId) return

    const now = Date.now()
    const shouldReset = this.playbackErrorState.lastMusicId !== currentId || now - this.playbackErrorState.lastAt > 12000
    if (shouldReset) {
      this.resetPlaybackErrorState()
    }
    this.playbackErrorState.lastMusicId = currentId
    this.playbackErrorState.lastAt = now
    this.playbackErrorState.consecutive += 1

    this.updatedMusicData({
      playing: false
    })
    this.persistLastMusicState({
      currentTime: Number(this.musicPlayer?.seek() || this.musicData.currentTime || 0)
    })

    const name = this.musicInfo?.name || this.musicInfo?.fileName || '当前歌曲'
    const detail = errorCode === undefined || errorCode === null ? '' : `（${String(errorCode)}）`

    if (type === 'play' && !this.playbackErrorState.retried && this.musicPlayer) {
      this.playbackErrorState.retried = true
      message.warning({
        key: 'playback-error',
        content: `${name} 播放失败，正在重试${detail}`,
        duration: 2
      })
      this.musicPlayer.once('unlock', () => {
        this.musicPlayer?.play(soundId)
      })
      this.musicPlayer.play(soundId)
      return
    }

    if (this.musicPlayList.length <= 1) {
      message.error({
        key: 'playback-error',
        content: `${name} 无法播放${detail}`,
        duration: 3
      })
      this.resetPlayback()
      return
    }

    if (this.playbackErrorState.consecutive >= 3) {
      message.error({
        key: 'playback-error',
        content: `连续多首歌曲无法播放，已停止播放`,
        duration: 3
      })
      this.resetPlayback()
      return
    }

    message.error({
      key: 'playback-error',
      content: `${name} 无法播放，已自动跳到下一首${detail}`,
      duration: 3
    })
    window.setTimeout(() => {
      this.handleNextMusic(true)
    }, 0)
  }

  createdPlayer () {
    if (this.musicInfo && this.musicInfo.music) {
      this.resetPlaybackErrorState()
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
        volume: this.volume,
        onload: () => {
          this.resetPlaybackErrorState()
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
        onloaderror: (soundId, errorCode) => {
          this.handlePlayerError('load', soundId, errorCode)
        },
        onplay: this.handlePlay,
        onplayerror: (soundId, errorCode) => {
          this.handlePlayerError('play', soundId, errorCode)
        },
        onpause: this.handlePause,
        onend: this.handleEnd,
        onstop: this.handleStop
      })
      this.musicPlayer.mute(this.muted)
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
    this.resetPlaybackErrorState()
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

  refreshQueueFromLocal = () => {
    if (!this.musicPlayList.length) return
    const idMap = new Map(this.localMusicList.map(item => [item.id, item]))
    const next: InterfaceMusicInfo[] = []
    this.musicPlayList.forEach(item => {
      if (!item.id) return
      const updated = idMap.get(item.id)
      if (updated) next.push(updated)
    })
    this.musicPlayList = next
  }

  setQueueFromScope = (ids: string[], startId?: string) => {
    const idSet = new Set(ids.filter(Boolean))
    const next: InterfaceMusicInfo[] = []
    this.localMusicList.forEach(item => {
      if (item.id && idSet.has(item.id)) {
        next.push(item)
      }
    })
    this.updateMusicPlayList(next)
    if (startId) {
      this.selectMusic(startId)
    }
  }

  removeFromQueue = (id: string) => {
    if (!id) return
    const currentId = this.musicData.id
    const removedIndex = this.musicPlayList.findIndex(item => item.id === id)
    const next = this.musicPlayList.filter(item => item.id !== id)
    this.updateMusicPlayList(next)
    if (id === currentId) {
      if (next.length === 0) {
        this.resetPlayback()
        return
      }
      const targetIndex = removedIndex < 0 ? 0 : Math.min(removedIndex, next.length - 1)
      const target = next[targetIndex] || next[0]
      this.selectMusic(target.id || '')
    }
  }

  clearQueue = (keepCurrent = true) => {
    if (keepCurrent && this.musicData.id) {
      const cur = this.localMusicList.find(item => item.id === this.musicData.id)
      if (!cur) {
        this.updateMusicPlayList([])
        this.resetPlayback()
        return
      }
      this.updateMusicPlayList([cur])
      return
    }
    this.updateMusicPlayList([])
    this.resetPlayback()
  }

  playNext = (id: string) => {
    if (!id) return
    const item = this.localMusicList.find(m => m.id === id)
    if (!item) return
    const curId = this.musicData.id
    const list = this.musicPlayList.filter(m => m.id !== id)
    let curIndex = list.findIndex(m => m.id === curId)
    if (curIndex < 0) {
      curIndex = -1
    }
    list.splice(curIndex + 1, 0, item)
    this.updateMusicPlayList(list)
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
    const previousLibraryIds = new Set(this.localMusicList.map(item => item.id).filter(Boolean) as string[])
    const wasLibraryQueue = Boolean(
      this.musicPlayList.length &&
      previousLibraryIds.size > 0 &&
      this.musicPlayList.length === previousLibraryIds.size &&
      this.musicPlayList.every(item => item.id && previousLibraryIds.has(item.id))
    )
    this.localMusicList = await getMusicList()
    if (this.musicPlayList.length === 0 || wasLibraryQueue) {
      this.updateMusicPlayList(cloneDeep(this.localMusicList))
    } else {
      this.refreshQueueFromLocal()
    }
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
