import { get } from "lodash"
import { InterfaceLrc, InterfaceLrcWord, InterfaceMusicInfo } from "../Interface/music"

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


export const uint8arrayToBase64 = (u8Arr: { length: any; subarray: (arg0: number, arg1: number) => any }): string => {
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

// 歌词解析算法 - 逐行解析的歌词
export const formatLrc = (lrc: string): InterfaceLrc[] => {
  // ti: 歌曲标题  ar: 歌唱者  al:  唱片集
  // 格式  [00:01.01]七里香 - 周杰伦   或者 [01:20.64][01:47.80][02:41.96][03:35.77]雨下整夜我的爱溢出就像雨水

  // 如果两个数组中间有文字 类似[01:20.64]我[01:47.80] 表示这个是是单字解析的歌词，那么我们就进行二次加工处理
  let lrc_s = lrc
  if (lrc_s) {
    lrc_s = lrc_s.replace(/([^\]^\n])\[/g, (match, p1) => p1 + '\n[');
    const lyric = lrc_s.split('\n');
    let res = [];
    const lyricLen = lyric.length;
    for (let i = 0; i < lyricLen; i++) {
      // match lrc time
      const lrcTimes = lyric[i].match(/\[(\d{2}):(\d{2})(\.(\d{2,3}))?]/g);
      // match lrc text
      const lrcText = lyric[i]
        .replace(/.*\[(\d{2}):(\d{2})(\.(\d{2,3}))?]/g, '')
        .replace(/<(\d{2}):(\d{2})(\.(\d{2,3}))?>/g, '')
        .replace(/^\s+|\s+$/g, '');

      if (lrcTimes) {
        // handle multiple time tag
        const timeLen = lrcTimes.length;
        for (let j = 0; j < timeLen; j++) {
          const lrcTime = transformArrayToTime(lrcTimes[j])
          res.push({
            time: lrcTime,
            text: lrcText
          });
        }
      }
    }
    // sort by time
    res = res.filter((item: InterfaceLrc) => item.text);
    res.sort((a: InterfaceLrc, b: InterfaceLrc) => a.time - b.time);
    return res;
  } else {
    return [];
  }
}

// 格式化时间显示
export const formatTime = (secs: number): string => {
  const minutes = Math.floor(secs / 60) || 0;
  const seconds = ~~(secs - minutes * 60) || 0;
  return (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

// 返回当前歌词选中的索引
export const getChooseLrcIndex = (lrcList: InterfaceLrc[], time: number): number => {
  if (lrcList.length <= 0) return -1
  let index = 0
  // 如果比当前时间小，那么聚焦当前时间
  while (index < lrcList.length) {
    if (lrcList[index].time > time) {
      break
    }
    index++
  }
  return index - 1
}

// 歌词解析算法 - 逐行-分字解析歌词
export const formatLrcProgress = (lrc: string): InterfaceLrcWord[][] => {
  let res: any[] = []
  console.log('进入逐字解析的歌词哦')
  // 逐字的歌词 ->  每行开始时间， 每个字开始时间 -> 计算百分比进行每个字覆盖
  // 先按照 \n 进行换行处理，然后正则提出每个字的时间，然后计算出每行的开始时间
  let lrcStr = lrc
  const lyric = lrcStr.split('\n')
  let i = 0
  while (i < lyric.length) {
    let cur = lyric[i].replace(/\s/g, '')
    const lrcTimes = cur.match(/\[(\d{2}):(\d{2})(\.(\d{2,3}))?]/g)
    const lrcText = cur.match(/(?<=\])\S\s?(?=\[)/g)
    if (lrcTimes && lrcText) {
      // console.log(lrcTimes, lrcText)
      // 时间是 [[00:32.27], [00:32.27]] 数组，  子也是数组
      // 数据结构，每个字开始时间和结束时间 start = j + 1    end j - 1
      const lineTime = []
      for (let j = 0; j < lrcText.length; j++) {
        lineTime.push({
          text: lrcText[j],
          start: transformArrayToTime(lrcTimes[j]),
          end: transformArrayToTime(lrcTimes[j + 1])
        })
      }
      res.push(lineTime)
    }
    i++
  }
  return res
}

// 转换时间 [00:42.27] -> 11ms
export const transformArrayToTime = (str: string): number => {
  let time = 0
  const timeArr: number[] = /\[(\d{2}):(\d{2})(\.(\d{2,3}))?]/.exec(str)?.map(item => {
    return item ? Number(item) : 0
  }) || []
  const min2sec = timeArr[1] * 60;
  const sec2sec = timeArr[2];
  const msec2sec = timeArr[4] ? timeArr[4] / ((timeArr[4] + '').length === 2 ? 100 : 1000) : 0;
  time = min2sec + sec2sec + msec2sec;
  return time
}

// 获取逐字歌词的当前行
export const getChooseLrcWordIndex = (lrcList: InterfaceLrcWord[][], time: number): number => {
  if (lrcList.length <= 0) return -1
  let index = 0
  // 如果比当前时间小，那么聚焦当前时间
  while (index < lrcList.length) {
    if (lrcList[index][0].start > time) {
      break
    }
    index++
  }
  return index - 1
}


// 获取逐字歌词的当前行的百分比
export const getWordLineProgress = (lrcItem: InterfaceLrcWord[], time: number): number => {
  if (!lrcItem) return 0
  let progress = 0
  // 看看在当前时间的哪个字，同时看看占比当前时间间隙的百分比
  let wordIndex = 0
  // 如果比当前字小，那么聚焦上一个字
  while (wordIndex < lrcItem.length) {
    if (lrcItem[wordIndex].start > time) {
      break
    }
    wordIndex++
  }
  if (wordIndex <= 0) return 0
  if (wordIndex >= lrcItem.length) return 100
  // 知道哪个字后, 看看一共多少字，然后分百分比，这里从 0 开始，实际少了一个字
  progress = wordIndex * (100 / lrcItem.length)
  // 如果当前时间比字结束时间大，那么是 100%
  const cur = lrcItem[wordIndex - 1]
  if (time >= cur.end) {
    return 100
  }
  if (time <= cur.start) {
    return (wordIndex - 1) * (100 / lrcItem.length)
  }
  const len = cur.end - cur.start
  progress += (time - cur.start) / len * (100 / lrcItem.length)
  return progress
}

// 滚动函数
export const goScroll = (top: number, target: HTMLElement) => {
  let requestAnimationFrame: any = null
  if (window.requestAnimationFrame) {
    requestAnimationFrame = window.requestAnimationFrame
  } else {
    requestAnimationFrame = setTimeout((fn) => {
      fn()
    }, 17)
  }
  // 当前时间
  let t = 0
  // 初始值
  const b = target.scrollTop
  // 变化量
  const c = top - b

  // 如果变化量太大，直接终止
  if (Math.abs(c) > 200) {
    target.scrollTo({
      top,
      behavior: 'smooth'
    })
    return
  }
  // 持续时间
  const d = 32
  const step = () => {
    let top = Tween.Linear(t, b, c, d)
    target.scrollTo({
      top
    })
    t += 1
    if (t <= d) {
      requestAnimationFrame(step)
    }
  }
  step()
}
// 运动
const Tween = {
  Linear: function (t: number, b: number, c: number, d: number): number {
    return c * t / d + b;
  },
  QuadIn: function (t: number, b: number, c: number, d: number): number {
    return c * (t /= d) * t + b;
  },
  QuadOut: function (t: number, b: number, c: number, d: number): number {
    return -c * (t /= d) * (t - 2) + b;
  },
  QuadInOut: function (t: number, b: number, c: number, d: number): number {
    if ((t /= d / 2) < 1) return c / 2 * t * t + b;
    return -c / 2 * ((--t) * (t - 2) - 1) + b;
  },
  CubicIn: function (t: number, b: number, c: number, d: number): number {
    return c * (t /= d) * t * t + b;
  }
}