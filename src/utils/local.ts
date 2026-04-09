/**
 * 所有对数据操作的集合，包括存储数据， 查询数据
 * 
 * 1. 歌曲的储存方式
 *   MusicList  InterfaceMusicInfo  
 *   id -> 名称生成的hash 值
 *   lrc ->   歌词，在列表进行操作关联
 *   music -> 歌曲的 blob，播放时进行查询关联
 *    
 * 
 *   music-名称生成的hash 值, 随机储存, 播放通过歌曲信息的 hash 值获取具体文件流
 * 
 *   LrcList  InterfaceLrcInfo  id -> 名称生成的hash 值, 文件本身存在列表里面
 * 
 */

import localforage from 'localforage'
import { dataURLtoBlob } from '.'
import { InterfaceLrcInfo, InterfaceMusicInfo } from '../Interface/music'
import { EnumPlayingType } from './enmus'

export interface InterfaceLastMusicState {
  id: string
  currentTime: number
  min: boolean
}

const normalizeMatchText = (value: string) => {
  return value
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[\(\[【（].*?[\)\]】）]/g, ' ')
    .replace(/(?:feat|ft)\.?\s+[^-_—–]+/gi, ' ')
    .replace(/[_\-—–·]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const compactMatchText = (value: string) => {
  return normalizeMatchText(value).replace(/[^a-z0-9\u4e00-\u9fa5]/gi, '')
}

const splitMatchTokens = (value: string) => {
  return normalizeMatchText(value)
    .split(/[^a-z0-9\u4e00-\u9fa5]+/gi)
    .map(item => item.trim())
    .filter(Boolean)
}

const createMusicMatchCandidates = (music: InterfaceMusicInfo) => {
  return Array.from(new Set([
    music.name,
    music.fileName,
    [music.artist, music.name].filter(Boolean).join(' '),
    [music.artist, music.fileName].filter(Boolean).join(' ')
  ].filter(Boolean) as string[]))
}

const getMatchScore = (music: InterfaceMusicInfo, lrc: InterfaceLrcInfo) => {
  const lrcCompact = compactMatchText(lrc.fileName)
  const lrcTokens = splitMatchTokens(lrc.fileName)
  let bestScore = 0
  createMusicMatchCandidates(music).forEach(candidate => {
    const candidateCompact = compactMatchText(candidate)
    const candidateTokens = splitMatchTokens(candidate)
    if (!candidateCompact) {
      return
    }
    if (candidateCompact === lrcCompact) {
      bestScore = Math.max(bestScore, 100)
      return
    }
    if (candidateCompact.length >= 4 && (lrcCompact.includes(candidateCompact) || candidateCompact.includes(lrcCompact))) {
      bestScore = Math.max(bestScore, 92)
    }
    if (candidateTokens.length) {
      const commonTokenCount = candidateTokens.filter(token => lrcTokens.includes(token)).length
      if (commonTokenCount === candidateTokens.length && commonTokenCount > 0) {
        bestScore = Math.max(bestScore, 86 + Math.min(commonTokenCount, 3))
      } else if (commonTokenCount >= 2) {
        bestScore = Math.max(bestScore, 78 + Math.min(commonTokenCount, 4))
      }
    }
  })
  return bestScore
}

const getBestMatchLrc = (music: InterfaceMusicInfo, lrcList: InterfaceLrcInfo[]): InterfaceLrcInfo | null => {
  let bestMatch: InterfaceLrcInfo | null = null
  let bestScore = 0
  lrcList.forEach(lrc => {
    const score = getMatchScore(music, lrc)
    if (score > bestScore) {
      bestScore = score
      bestMatch = lrc
    }
  })
  if (!bestMatch || bestScore < 86) {
    return null
  }
  return bestMatch
}

 /**
  * 添加歌词的存储方法
  * key: music-lrc-list
  */
 export const addLrc = async (lrc: InterfaceLrcInfo):Promise<any> => {
    const key = 'music-lrc-list'
    // 歌词，直接拉出列表，然后塞进去，储存
    const list: InterfaceLrcInfo[] = await localforage.getItem(key)  || []
    // 这里需要判断下是否已经存在
    let noExist = list.every(item => item.fileName !== lrc.fileName)
    if (noExist) {
      list.push(lrc)
    }
    return localforage.setItem('music-lrc-list', list)
}

// 获取歌词列表
export const getLrcList = async ():Promise<InterfaceLrcInfo[]>  => {
  const key = 'music-lrc-list'
  const list: InterfaceLrcInfo[] = await localforage.getItem(key)  || []
  return list
}

/**
 * 添加歌曲列表方法
 * music-list
 * 具体流地址 music-名称生成的hash 值
 */

export const addMusic = async (musicInfo: InterfaceMusicInfo, blob: Blob):Promise<any> => {
  const key = 'music-list'
  // 歌曲，直接拉出列表，然后塞进去，储存
  const list: InterfaceMusicInfo[] = await localforage.getItem(key)  || []
  // 这里需要判断下是否已经存在
  let noExist = list.every(item => item.fileName !== musicInfo.fileName)
  if (noExist) {
    // 这里需要去存储文件流
    const musicHash = `${musicInfo.fileName}-${Math.random() * 100}-${Date.now()}`
    musicInfo.id = musicHash
    await localforage.setItem(musicHash, blob)
    list.push(musicInfo)
  }
  return localforage.setItem('music-list', list)
}

// 通过 id 删除歌曲
export const removeMusic = async (id: string):Promise<Boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      const key = 'music-list'
      // 拉出歌曲列表
      let list: InterfaceMusicInfo[] = await localforage.getItem(key)  || []
      list = list.filter(item => item.id !== id)
      await localforage.setItem('music-list', list)
      await localforage.removeItem(id)
      resolve(true)
    } catch (error) {
      reject(error)
    }
  })
}

export const updateMusicLrcBinding = async (id: string, lrcKey?: string): Promise<InterfaceMusicInfo | null> => {
  const key = 'music-list'
  const list: InterfaceMusicInfo[] = await localforage.getItem(key) || []
  let target: InterfaceMusicInfo | null = null
  const nextList = list.map(item => {
    if (item.id !== id) return item
    target = {
      ...item,
      lrcKey
    }
    return target
  })
  await localforage.setItem(key, nextList)
  return target
}

export const updateMusicMeta = async (id: string, payload: Partial<Pick<InterfaceMusicInfo, 'name' | 'artist' | 'album' | 'albumartist' | 'comment'>>): Promise<InterfaceMusicInfo | null> => {
  const key = 'music-list'
  const list: InterfaceMusicInfo[] = await localforage.getItem(key) || []
  let target: InterfaceMusicInfo | null = null
  const nextList = list.map(item => {
    if (item.id !== id) return item
    target = {
      ...item,
      ...payload
    }
    return target
  })
  await localforage.setItem(key, nextList)
  return target
}

// 获取歌曲列表
export const getMusicList = async ():Promise<InterfaceMusicInfo[]>  => {
  const key = 'music-list'
  const list: InterfaceMusicInfo[] = await localforage.getItem(key)  || []
  return list
}

// 获取单首歌词信息
export const getMusicInfoFromLocal = async (id: string): Promise<InterfaceMusicInfo> => {
  return new Promise(async (resolve, reject) => {
    const list = await localforage.getItem('music-list') as InterfaceMusicInfo[] || []
    const cur = list.filter((item: InterfaceMusicInfo) => item.id === id)[0]
    if (!cur) {
      reject('获取歌曲信息失败')
    } else {
      cur.music = await localforage.getItem(id)  as Blob
      if (cur.lrcKey) {
         const lrcList = await getLrcList()
         lrcList.forEach(item => {
           if (item.fileName === cur.lrcKey) {
            cur.lrc = item.content
           }
         })
      }
      // 这里处理下图片 url 的生成
      if (cur.picture.length > 0) {
        cur.pictureUrl = URL.createObjectURL(dataURLtoBlob(cur.picture[0]))
      }
      resolve(cur)
    }
  })
} 

// 通过 id 删除歌词
export const removeLrc = async (id: string):Promise<Boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      const key = 'music-lrc-list'
      // 拉出歌词列表
      let list: InterfaceMusicInfo[] = await localforage.getItem(key)  || []
      list = list.filter(item => item.fileName !== id)
      await localforage.setItem('music-lrc-list', list)
      const musicList = await getMusicList()
      await localforage.setItem('music-list', musicList.map(item => {
        if (item.lrcKey === id) {
          return {
            ...item,
            lrcKey: ''
          }
        }
        return item
      }))
      resolve(true)
    } catch (error) {
      reject(error)
    }
  })
}

// 自动关联歌曲歌词
export const MusicRelatedLrc = (): Promise<string> => {
  return new Promise(async(resolve, reject) => {
    try {
      let musicList = await getMusicList()
      const lrcList = await getLrcList()
      musicList = musicList.map((item: InterfaceMusicInfo) => {
        if (item.lrcKey) return item
        const target = getBestMatchLrc(item, lrcList)
        if (target) {
          item.lrcKey = target.fileName
        }
        return item
      })
      await localforage.setItem('music-list', musicList)
      resolve('success')
    } catch (error) {
      reject(error)
    }
  })
}

export const autoBindMusicLrc = async (params?: {
  musicFileNames?: string[]
  lrcFileNames?: string[]
  overwrite?: boolean
}): Promise<number> => {
  const musicList = await getMusicList()
  const lrcList = await getLrcList()
  const musicFileNameSet = params?.musicFileNames?.length ? new Set(params.musicFileNames) : null
  const lrcFileNameSet = params?.lrcFileNames?.length ? new Set(params.lrcFileNames) : null
  let changed = false
  let matchedCount = 0
  const nextList = musicList.map(item => {
    if (musicFileNameSet && !musicFileNameSet.has(item.fileName || '')) {
      return item
    }
    if (!params?.overwrite && item.lrcKey) {
      return item
    }
    const candidates = lrcFileNameSet
      ? lrcList.filter(lrc => lrcFileNameSet.has(lrc.fileName))
      : lrcList
    const target = getBestMatchLrc(item, candidates)
    if (!target || target.fileName === item.lrcKey) {
      return item
    }
    changed = true
    matchedCount += 1
    return {
      ...item,
      lrcKey: target.fileName
    }
  })
  if (changed) {
    await localforage.setItem('music-list', nextList)
  }
  return matchedCount
}

export const upsertLrc = async (lrc: InterfaceLrcInfo): Promise<InterfaceLrcInfo[]> => {
  const key = 'music-lrc-list'
  const list: InterfaceLrcInfo[] = await localforage.getItem(key) || []
  const index = list.findIndex(item => item.fileName === lrc.fileName)
  if (index >= 0) {
    list[index] = {
      ...list[index],
      ...lrc
    }
  } else {
    list.push(lrc)
  }
  await localforage.setItem(key, list)
  return list
}

// 获取上次播放类型
export const getLastPlayType = async (): Promise<`${EnumPlayingType}`> => {
  const key = 'last-play-type'
  const type = await localforage.getItem(key) as `${EnumPlayingType}` ?? EnumPlayingType.random
  return type
}

// 设置上次播放类型
export const setLastPlayType = async (type: `${EnumPlayingType}`): Promise<`${EnumPlayingType}`> => {
  const key = 'last-play-type'
  await localforage.setItem(key, type)
  return type
}

export const getLastMusicState = async (): Promise<InterfaceLastMusicState | null> => {
  const state = await localforage.getItem('last-music-state') as InterfaceLastMusicState | null
  return state
}

export const setLastMusicState = async (state: InterfaceLastMusicState): Promise<InterfaceLastMusicState> => {
  await localforage.setItem('last-music-state', state)
  return state
}

export const removeLastMusicState = async (): Promise<void> => {
  await localforage.removeItem('last-music-state')
}

export const getLastVolume = async (): Promise<number> => {
  const volume = await localforage.getItem('last-volume')
  const value = typeof volume === 'number' ? volume : 1
  if (!Number.isFinite(value)) return 1
  return Math.max(0, Math.min(1, value))
}

export const setLastVolume = async (volume: number): Promise<number> => {
  const value = Math.max(0, Math.min(1, Number(volume)))
  await localforage.setItem('last-volume', value)
  return value
}

export const getLastMuted = async (): Promise<boolean> => {
  const muted = await localforage.getItem('last-muted')
  return Boolean(muted)
}

export const setLastMuted = async (muted: boolean): Promise<boolean> => {
  await localforage.setItem('last-muted', Boolean(muted))
  return Boolean(muted)
}
