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
import { InterfaceLrcInfo, InterfaceMusicInfo } from '../Interface/music'

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
  // 歌词，直接拉出列表，然后塞进去，储存
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

// 获取歌曲列表
export const getMusicList = async ():Promise<InterfaceMusicInfo[]>  => {
  const key = 'music-list'
  const list: InterfaceMusicInfo[] = await localforage.getItem(key)  || []
  return list
}

// 获取单首歌词信息
export const getMusicInfoFromLocal = async (id: string): Promise<InterfaceMusicInfo> => {
  return new Promise(async (resolve, reject) => {
    const list = await localforage.getItem('music-list') as InterfaceMusicInfo[]
    const cur = list.filter((item: InterfaceMusicInfo) => item.id === id)[0]
    if (!cur) {
      reject('获取歌曲信息失败')
    } else {
      cur.music = await localforage.getItem(id)  as Blob
      if (cur.lrcKey) {
        cur.lrc = await localforage.getItem(cur.lrcKey) as string
      }
      resolve(cur)
    }
  })
} 