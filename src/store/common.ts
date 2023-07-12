import { observable, action } from 'mobx';
import { InterfaceLrcInfo, InterfaceMusicInfo, InterfaceMusicPlayingInfo } from '../Interface/music';
import { Howl } from 'howler'
import { getLrcList, getMusicList, removeLrc, removeMusic, setLastPlayType, } from '../utils/local';
import { getFormatCode } from '../utils';
import { cloneDeep } from 'lodash';
import { message } from 'antd'
import { EnumPlayingType } from '../utils/enmus';
class Common {
  @observable
  playingType: `${EnumPlayingType}` = EnumPlayingType.loop

  @action
  updatePlayingType (type: `${EnumPlayingType}`) {
    // 切换当前播放状态 顺序播放 -> 单曲循环 -> 随机播放 -> 顺序播放
    const nextType = type === EnumPlayingType.loop ? EnumPlayingType.single : type === EnumPlayingType.single ? EnumPlayingType.random : EnumPlayingType.loop
    setLastPlayType(nextType)
    this.playingType = nextType
  }


  @observable
  preUrl: string = ''

  @action
  updatePreUrl (url: string) {
    this.preUrl = url
  }

  @observable
  preImgUrl: string[] = []

  @action
  updatePreImgUrl (url: string) {
    this.preImgUrl.push(url)
    if (this.preImgUrl.length >= 5) {
      URL.revokeObjectURL(this.preImgUrl.shift() as string)
    }
  }
  
  // 音乐播放实例
  @observable
  musicPlayer: Howl | null = null

  @action
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
      this.musicPlayer = new Howl({
        autoplay: true,
        src: url,
        html5: true,
        format: [getFormatCode(this.musicInfo.codec.toLowerCase() || String(this.musicInfo.fileType).toLowerCase())],
        volume: 1,
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
          src: this.musicInfo.pictureUrl || '',
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
  }

  handleEnd = () => {
    this.updatedMusicData({
      currentTime: this.musicPlayer?.seek(),
      playing: false,
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

  @action
  destroyPlayer () {
    this.musicPlayer = null
  }


  @observable
  musicInfo: InterfaceMusicInfo | null = null

  @action
  updatedMusicInfo (data: InterfaceMusicInfo) {
    if (data.picture.length === 0) {
      data.picture = [`${process.env.PUBLIC_URL}/images/music-no.jpeg`]
    }
    this.musicInfo = data
  }
  
 

  // 当前音乐播放的数据
  @observable
  musicData: InterfaceMusicPlayingInfo  = {
    id: '',
    playing: false,
    duration: 0,
    currentTime: 0,
    change: false,
    min: true
  }

  @action
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
  }

  // 播放器状态
  @observable
  musicPlayerStats = {
    // 播放器循环状态  单曲播放 single, 随机 random 顺序播放 order
    loop: 'random'
  }
  
  // 播放下一首，上一首功能实现
  @observable
  musicPlayList: InterfaceMusicInfo[] = []

  @action
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
      common.updatedMusicData({
        id: this.musicPlayList[randomIndex].id,
      })
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
      common.updatedMusicData({
        id: this.musicPlayList[next].id
      })
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
      common.updatedMusicData({
        id: this.musicPlayList[randomIndex].id,
      })
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
      common.updatedMusicData({
        id: this.musicPlayList[pre].id
      })
    }
  }

  // 本地音乐展示列表
  @observable
  localMusicList: InterfaceMusicInfo[] = []
  @observable
  localMusicLoading: boolean = false
  @observable
  localAlbumMap: Map<string, InterfaceMusicInfo[]> = new Map()

  // 专辑生成说明，歌曲列表根据专辑的名称集合数组
  @action
  updateLocalAlbumList = () => {
    const map = new Map()
    this.localMusicList.forEach(item => {
      if (item.album === '') return
      const target = map.get(item.album) ?? []
      map.set(item.album, [...target, item])
    })
    this.localAlbumMap = map
  }

  @action
  updateLocalMusicList = async () => {
    this.localMusicLoading = true
    this.localMusicList = await getMusicList()
    // 用来做播放列表更新
    this.updateMusicPlayList(cloneDeep(this.localMusicList))
    this.updateLocalAlbumList()
    this.localMusicLoading = false
  }

  // 删除歌曲, 操作列表删除当前歌曲，同时删除歌曲文件流
  @action deleteMusic = async (id: string) => {
    try {
      await removeMusic(id)
      message.success('删除成功')
      this.updateLocalMusicList()
    } catch (error) {
      console.log(error)
      message.error('删除失败')
    }
  }


  // 本地歌词展示列表
  localMusicLrcList: InterfaceLrcInfo[] = []
  @observable
  localMusicLrcLoading: boolean = false

  @action
  updateLocalMusicLrcList = async () => {
    this.localMusicLrcLoading = true
    this.localMusicLrcList = await getLrcList()
    this.localMusicLrcLoading = false
  }

  // 删除歌曲, 操作列表删除当前歌曲，同时删除歌曲文件流
  @action deleteLrc = async (id: string) => {
    try {
      await removeLrc(id)
      message.success('删除成功')
      this.updateLocalMusicLrcList()
    } catch (error) {
      console.log(error)
      message.error('删除失败')
    }
  }

  // 音乐播放时修改全局主题色
  @observable
  musicColor = '#1890ff'

  @action
  updateMusicColor = (color: string) => {
    this.musicColor = color
    document.documentElement.style.setProperty('--primary-color', color)
  }
}


const common = new Common()


 
export default common

