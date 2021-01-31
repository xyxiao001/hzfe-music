import { observable, action } from 'mobx';
import { InterfaceLrcInfo, InterfaceMusicInfo, InterfaceMusicPlayingInfo } from '../Interface/music';
import { Howl } from 'howler'
import { getLrcList, getMusicList, } from '../utils/local';
import { getFormatCode } from '../utils';
class Common {
  // 音乐播放实例
  @observable
  musicPlayer: Howl | null = null

  @action
  createdPlayer () {
    if (this.musicInfo) {
      this.updatedMusicData({
        playing: false,
      })
      this.musicPlayer = new Howl({
        autoplay: true,
        src: URL.createObjectURL(this.musicInfo.music),
        // src: 'https://jay-music1.oss-cn-beijing.aliyuncs.com/01.%E7%88%B1%E5%9C%A8%E8%A5%BF%E5%85%83%E5%89%8D.flac?Expires=1611355123&OSSAccessKeyId=TMP.3KgLmqPNAzpF5wPEETMh2Dq86Wcz5FyeAHsHEtGksuQw9c7y5jm7LQWDLJ2Vv1cbwnpfTdrM8S4K19VLMAmCX51Cp1tbeD&Signature=zSC5jpvQqvd1BCBjjXGwUMT0g%2Bw%3D',
        // src: 'http://qna13isfq.hn-bkt.clouddn.com/07.%E7%88%B7%E7%88%B7%E6%B3%A1%E7%9A%84%E8%8C%B6.flac',
        html5: true,
        format: [getFormatCode(this.musicInfo.codec.toLowerCase() || String(this.musicInfo.fileType).toLowerCase())],
        volume: 1,
        onplay: this.handlePlay,
        onpause: this.handlePause,
        onend: this.handleEnd,
        onstop: this.handleStop
      })
    }
  }

  handlePlay = () => {
    console.log('歌曲播放了')
    this.updatedMusicData({
      currentTime: this.musicPlayer?.seek(),
      duration: this.musicPlayer?.duration(),
      playing: true,
      change: false
    })
    if (this.musicInfo && !this.musicInfo.duration) {
      this.musicInfo.duration = Number(this.musicPlayer?.duration())
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
    console.log('歌曲播放完了')
    this.updatedMusicData({
      currentTime: this.musicPlayer?.seek(),
      playing: false,
    })
    requestAnimationFrame(this.handlePlaying)
  }

  handleStop = () => {
    console.log('歌曲停止')
    this.updatedMusicData({
      currentTime: this.musicPlayer?.seek(),
      playing: false,
    })
  }

  handlePlaying = () => {
    if (!this.musicData.change && this.musicPlayer && this.musicPlayer.playing()) {
      this.updatedMusicData({
        type: 'update',
        currentTime: this.musicPlayer.seek()
      })
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
        requestAnimationFrame(this.handlePlaying)
      }, 100)
    }
    this.musicData = {
      ...this.musicData,
      ...data
    }
  }

  // 本地音乐展示列表
  @observable
  localMusicList: InterfaceMusicInfo[] = []
  @observable
  localMusicLoading: boolean = false

  @action
  updateLocalMusicList = async () => {
    this.localMusicLoading = true
    this.localMusicList = await getMusicList()
    this.localMusicLoading = false

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

