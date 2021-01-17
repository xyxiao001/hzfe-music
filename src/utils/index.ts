import { get } from "lodash"
import { InterfaceLrc, InterfaceMusicInfo } from "../Interface/music"

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

// 歌词解析算法
export const formatLrc = (lrc: string): InterfaceLrc[] => {
  // ti: 歌曲标题  ar: 歌唱者  al:  唱片集
  // 格式  [00:01.01]七里香 - 周杰伦   或者 [01:20.64][01:47.80][02:41.96][03:35.77]雨下整夜我的爱溢出就像雨水
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
          const oneTime: number[] = /\[(\d{2}):(\d{2})(\.(\d{2,3}))?]/.exec(lrcTimes[j])?.map(item => {
            return item ? Number(item) : 0
          }) || [];
          const min2sec = oneTime[1] * 60;
          const sec2sec = oneTime[2];
          const msec2sec = oneTime[4] ? oneTime[4] / ((oneTime[4] + '').length === 2 ? 100 : 1000) : 0;
          const lrcTime = min2sec + sec2sec + msec2sec;
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

export const formatTime = (secs: number): string => {
  const minutes = Math.floor(secs / 60) || 0;
  const seconds = ~~(secs - minutes * 60) || 0;
  return (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}